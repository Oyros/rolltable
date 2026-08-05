import { useEffect, useRef, useState } from 'react';
import { ref, update, remove, push, onValue, onChildAdded, onDisconnect } from 'firebase/database';
import { db } from '../firebase.js';
import { createPeerConnection } from '../utils/webrtc.js';

const STRIP_HEIGHT_KEY = 'rolltable_camera_strip_height';
const MIN_STRIP_HEIGHT = 96;

// On a 768px-tall laptop the strip competes with the play area, so start it
// shorter there. First visit only — the dragged height wins afterwards.
function defaultStripHeight() {
  return window.innerHeight <= 850 ? 118 : 150;
}

function maxStripHeight() {
  return Math.round(window.innerHeight * 0.6);
}

function clampStripHeight(value) {
  return Math.min(Math.max(value, MIN_STRIP_HEIGHT), maxStripHeight());
}

function loadStripHeight() {
  const raw = localStorage.getItem(STRIP_HEIGHT_KEY);
  const parsed = raw ? parseInt(raw, 10) : defaultStripHeight();
  return clampStripHeight(Number.isFinite(parsed) ? parsed : defaultStripHeight());
}

let sharedAudioCtx;

function getAudioCtx() {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
}

// Lights up while there's actual voice on the stream. The analyser is only
// ever a tap — it is deliberately not connected to the destination, otherwise
// the audio would play twice (the <video> element already plays it).
function useSpeaking(stream) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setSpeaking(false);
      return undefined;
    }
    let source;
    let analyser;
    try {
      const ctx = getAudioCtx();
      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
    } catch {
      return undefined;
    }
    const samples = new Uint8Array(analyser.fftSize);
    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i += 1) {
        const deviation = (samples[i] - 128) / 128;
        sum += deviation * deviation;
      }
      setSpeaking(Math.sqrt(sum / samples.length) > 0.045);
    }, 180);
    return () => {
      clearInterval(timer);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {
        // already torn down with the stream
      }
    };
  }, [stream]);

  return speaking;
}

function RemoteTile({ uid, stream, name, color, micOn }) {
  const videoRef = useRef(null);
  // Browsers block autoplay of unmuted video without a user gesture — start
  // muted (always allowed) and let the viewer unmute with a real click.
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const speaking = useSpeaking(stream);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume, muted]);

  return (
    <div
      className={`camera-tile${speaking && !muted ? ' speaking' : ''}`}
      key={uid}
      onClick={() => setShowVolume((v) => !v)}
      title="Ses seviyesi için tıkla"
    >
      <video ref={videoRef} autoPlay playsInline muted={muted} />
      <button
        type="button"
        className="camera-tile-unmute"
        onClick={(e) => {
          e.stopPropagation();
          setMuted((m) => !m);
        }}
        title={muted ? 'Sesi aç' : 'Sesi kapat'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {showVolume && (
        <div className="camera-tile-volume" onClick={(e) => e.stopPropagation()}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (muted) setMuted(false);
            }}
          />
        </div>
      )}
      <span className="camera-tile-name" style={color ? { color } : undefined}>
        {micOn === false ? '🔇 ' : ''}
        {name || '?'}
      </span>
    </div>
  );
}

export default function CameraStrip({ roomCode, playerId, name, role, color, players }) {
  const [stripHeight, setStripHeight] = useState(loadStripHeight);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [broadcasters, setBroadcasters] = useState({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [cameraError, setCameraError] = useState('');
  // Mirrors localStreamRef so the speaking indicator can react to it; the ref
  // stays for the imperative reads in connectTo/attachLocalTracks.
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const handledSignalsRef = useRef(new Set());

  const canBroadcast = role !== 'spectator';
  const localSpeaking = useSpeaking(localStream);

  // Drag the handle to resize the strip; the tiles fill its height, so making
  // it taller makes every camera bigger. Listeners go on the window so the
  // drag keeps tracking even when the pointer leaves the thin handle.
  function startResize(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = stripHeight;
    let latest = startHeight;

    const onMove = (moveEvent) => {
      latest = clampStripHeight(startHeight - (moveEvent.clientY - startY));
      setStripHeight(latest);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      localStorage.setItem(STRIP_HEIGHT_KEY, String(latest));
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function sendSignal(toUid, type, data) {
    // Surface failures instead of swallowing them — a denied write here (e.g.
    // the webrtc rules not published yet) otherwise looks exactly like "the
    // camera just doesn't work", with nothing on screen to explain why.
    push(ref(db, `rooms/${roomCode}/webrtc/signals/${toUid}`), {
      from: playerId,
      type,
      data,
      at: Date.now(),
    }).catch((err) => {
      setCameraError(
        `Bağlantı kurulamadı (${err.code || err.message}). Firebase kurallarının yayınlandığından emin ol.`
      );
    });
  }

  function attachLocalTracks(pc) {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
      return;
    }
    // No camera of our own: still declare receive slots, otherwise the offer
    // carries no media at all and we'd never be sent their video/audio.
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
  }

  function setupConnection(uid, pc) {
    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [uid]: e.streams[0] }));
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(uid, 'candidate', e.candidate.toJSON());
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(uid);
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[uid];
          return next;
        });
      }
    };
  }

  // Turning our camera on/off after a connection already exists means the
  // existing connection was negotiated without our media (it was receive-only).
  // Push our tracks onto it and re-offer, otherwise the other side would never
  // be sent our video at all — which is exactly what happened when someone
  // switched their camera on after the connection had been established.
  async function syncLocalTracksInto(uid, pc) {
    const stream = localStreamRef.current;
    const senders = pc.getSenders().filter((s) => s.track);

    if (stream) {
      const alreadySent = new Set(senders.map((s) => s.track));
      const missing = stream.getTracks().filter((t) => !alreadySent.has(t));
      if (missing.length === 0) return;
      missing.forEach((track) => pc.addTrack(track, stream));
    } else {
      if (senders.length === 0) return;
      senders.forEach((sender) => pc.removeTrack(sender));
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(uid, 'offer', { sdp: offer.sdp, type: offer.type });
    } catch {
      // A collision (both sides re-offering at once) resolves on the next pass.
    }
  }

  async function connectTo(uid) {
    const pc = createPeerConnection();
    peerConnectionsRef.current.set(uid, pc);
    setupConnection(uid, pc);
    attachLocalTracks(pc);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(uid, 'offer', { sdp: offer.sdp, type: offer.type });
  }

  async function handleSignal(sig) {
    const { from, type, data } = sig;
    let pc = peerConnectionsRef.current.get(from);
    if (!pc) {
      if (type !== 'offer') return;
      pc = createPeerConnection();
      peerConnectionsRef.current.set(from, pc);
      setupConnection(from, pc);
      attachLocalTracks(pc);
    }
    // Every branch is guarded: a signal that arrives out of order (or twice)
    // must never throw, because an unhandled rejection here would leave the
    // connection half-built and keep the peers re-negotiating in a loop.
    try {
      if (type === 'offer') {
        if (pc.signalingState !== 'stable') return;
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(from, 'answer', { sdp: answer.sdp, type: answer.type });
      } else if (type === 'answer') {
        if (pc.signalingState !== 'have-local-offer') return;
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } else if (type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch {
      // Benign in practice: candidates can land before the remote description
      // is set, and a duplicate/stale description is safe to drop.
    }
  }

  // Listen for broadcasters (who's currently sharing camera/mic).
  useEffect(() => {
    const peersRef = ref(db, `rooms/${roomCode}/webrtc/peers`);
    const unsub = onValue(peersRef, (snap) => setBroadcasters(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  // Our camera just came on (or went off) — bring every already-open
  // connection in line with that, re-offering so the other side actually
  // receives (or stops receiving) our media.
  useEffect(() => {
    peerConnectionsRef.current.forEach((pc, uid) => {
      syncLocalTracksInto(uid, pc);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // Listen for incoming signaling messages addressed to me.
  //
  // This MUST be onChildAdded, not onValue: onValue re-fires on every change
  // and hands back the whole inbox, so every message still awaiting its
  // (async) delete got re-processed over and over — each redundant offer
  // producing another answer and another burst of ICE candidates, which
  // snowballed into a signalling storm that saturated the tab's main thread.
  // onChildAdded delivers each message exactly once; the id set guards against
  // a re-delivery if the listener is ever re-attached before the delete lands.
  useEffect(() => {
    const inboxRef = ref(db, `rooms/${roomCode}/webrtc/signals/${playerId}`);
    const seen = handledSignalsRef.current;
    const unsub = onChildAdded(inboxRef, (snap) => {
      const sigId = snap.key;
      if (seen.has(sigId)) return;
      seen.add(sigId);
      handleSignal(snap.val()).finally(() => {
        remove(ref(db, `rooms/${roomCode}/webrtc/signals/${playerId}/${sigId}`));
      });
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerId]);

  // Keyed on the online/broadcaster *identities* rather than the whole players
  // object, which gets a fresh reference on every unrelated character edit —
  // otherwise this reconcile re-ran constantly during normal play.
  const onlineKey = Object.entries(players || {})
    .filter(([uid, p]) => p.online && uid !== playerId)
    .map(([uid]) => uid)
    .sort()
    .join(',');
  const broadcasterKey = Object.keys(broadcasters)
    .filter((uid) => uid !== playerId)
    .sort()
    .join(',');

  // Reconcile which peer connections should exist: everyone online while I
  // broadcast (so they receive me), plus every other broadcaster (so I can
  // watch them even when my own camera is off).
  useEffect(() => {
    const onlineUids = onlineKey ? onlineKey.split(',') : [];
    const broadcasterUids = broadcasterKey ? broadcasterKey.split(',') : [];

    const desired = new Set();
    if (cameraOn) onlineUids.forEach((uid) => desired.add(uid));
    broadcasterUids.forEach((uid) => desired.add(uid));

    for (const [uid, pc] of peerConnectionsRef.current.entries()) {
      if (!desired.has(uid)) {
        pc.close();
        peerConnectionsRef.current.delete(uid);
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[uid];
          return next;
        });
      }
    }

    // Whoever wants to *receive* opens the connection. That way a viewer with
    // their camera off still pulls in a broadcaster's stream without having to
    // turn on their own camera first (and without depending on the broadcaster
    // having noticed them). Exactly one side initiates per pair:
    //   - only they broadcast  -> I initiate (recvonly)
    //   - both broadcast       -> the lower uid initiates
    //   - only I broadcast     -> they initiate, I just answer
    desired.forEach((uid) => {
      if (peerConnectionsRef.current.has(uid)) return;
      const theyBroadcast = broadcasterUids.includes(uid);
      const iAmInitiator = theyBroadcast && (!cameraOn || playerId < uid);
      if (iAmInitiator) connectTo(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, onlineKey, broadcasterKey, roomCode, playerId]);

  // Full teardown on unmount (leaving the room).
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      remove(ref(db, `rooms/${roomCode}/webrtc/peers/${playerId}`)).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerId]);

  // The local preview <video> only mounts once cameraOn flips true, so the
  // srcObject has to be attached after that render, not inline in
  // startCamera() — at that point the element doesn't exist yet.
  useEffect(() => {
    if (cameraOn && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  async function startCamera() {
    setCameraError('');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      setCameraError('Kameraya erişilemedi: ' + err.message);
      return;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    setCameraOn(true);
    setMicOn(true);
    // Announcing ourselves is what makes everyone else connect to us, so a
    // failure here has to be reported rather than folded into the camera error.
    const peerRef = ref(db, `rooms/${roomCode}/webrtc/peers/${playerId}`);
    try {
      await update(peerRef, { mic: true, at: Date.now() });
      onDisconnect(peerRef).remove();
    } catch (err) {
      setCameraError(
        `Yayın duyurulamadı (${err.code || err.message}). Firebase kurallarının yayınlandığından emin ol.`
      );
    }
  }

  function stopCamera() {
    setLocalStream(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setCameraOn(false);
    const peerRef = ref(db, `rooms/${roomCode}/webrtc/peers/${playerId}`);
    remove(peerRef);
    onDisconnect(peerRef).cancel();
  }

  function toggleMic() {
    if (!localStreamRef.current) return;
    const next = !micOn;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    setMicOn(next);
    update(ref(db, `rooms/${roomCode}/webrtc/peers/${playerId}`), { mic: next });
  }

  const remoteBroadcasterIds = Object.keys(broadcasters).filter((uid) => uid !== playerId);

  if (!canBroadcast && remoteBroadcasterIds.length === 0) return null;

  return (
    <div className="camera-strip" style={{ height: stripHeight }}>
      <div
        className="camera-strip-handle"
        onPointerDown={startResize}
        title="Yüksekliği ayarlamak için yukarı/aşağı sürükle"
      />
      <div className="camera-strip-body">
      <div className="camera-controls">
        {canBroadcast &&
          (cameraOn ? (
            <>
              <button type="button" className="btn-ghost small" onClick={stopCamera}>
                📷 Kamerayı Kapat
              </button>
              <button type="button" className="btn-ghost small" onClick={toggleMic}>
                {micOn ? '🎤 Sustur' : '🔇 Sesi Aç'}
              </button>
            </>
          ) : (
            <button type="button" className="btn-ghost small" onClick={startCamera}>
              📷 Kamerayı Aç
            </button>
          ))}
        {cameraError && <span className="sound-error">{cameraError}</span>}
      </div>

      <div className="camera-tiles">
        {cameraOn && (
          <div className={`camera-tile${localSpeaking ? ' speaking' : ''}`}>
            <video ref={localVideoRef} autoPlay playsInline muted />
            <span className="camera-tile-name" style={color ? { color } : undefined}>
              {micOn === false ? '🔇 ' : ''}
              {name} (sen)
            </span>
          </div>
        )}
        {remoteBroadcasterIds.map((uid) => {
          const stream = remoteStreams[uid];
          if (!stream) return null;
          return (
            <RemoteTile
              key={uid}
              uid={uid}
              stream={stream}
              name={players?.[uid]?.name}
              color={players?.[uid]?.color}
              micOn={broadcasters[uid]?.mic}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}
