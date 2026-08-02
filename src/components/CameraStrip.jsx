import { useEffect, useRef, useState } from 'react';
import { ref, update, remove, push, onValue, onDisconnect } from 'firebase/database';
import { db } from '../firebase.js';
import { createPeerConnection } from '../utils/webrtc.js';

function RemoteTile({ uid, stream, name, color, micOn }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="camera-tile" key={uid}>
      <video ref={videoRef} autoPlay playsInline />
      <span className="camera-tile-name" style={color ? { color } : undefined}>
        {micOn === false ? '🔇 ' : ''}
        {name || '?'}
      </span>
    </div>
  );
}

export default function CameraStrip({ roomCode, playerId, name, role, color, players }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [broadcasters, setBroadcasters] = useState({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [cameraError, setCameraError] = useState('');

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());

  const canBroadcast = role !== 'spectator';

  function sendSignal(toUid, type, data) {
    push(ref(db, `rooms/${roomCode}/webrtc/signals/${toUid}`), {
      from: playerId,
      type,
      data,
      at: Date.now(),
    });
  }

  function attachLocalTracks(pc) {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    }
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
    if (type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(from, 'answer', { sdp: answer.sdp, type: answer.type });
    } else if (type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === 'candidate') {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data));
      } catch {
        // benign — candidate can arrive before the remote description is set
      }
    }
  }

  // Listen for broadcasters (who's currently sharing camera/mic).
  useEffect(() => {
    const peersRef = ref(db, `rooms/${roomCode}/webrtc/peers`);
    const unsub = onValue(peersRef, (snap) => setBroadcasters(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  // Listen for incoming signaling messages addressed to me.
  useEffect(() => {
    const inboxRef = ref(db, `rooms/${roomCode}/webrtc/signals/${playerId}`);
    const unsub = onValue(inboxRef, (snap) => {
      const val = snap.val() || {};
      Object.entries(val).forEach(([sigId, sig]) => {
        handleSignal(sig).finally(() => {
          remove(ref(db, `rooms/${roomCode}/webrtc/signals/${playerId}/${sigId}`));
        });
      });
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerId]);

  // Reconcile which peer connections should exist: everyone online while I
  // broadcast (so they receive me), plus every other broadcaster (so I can
  // watch them even when my own camera is off).
  useEffect(() => {
    const onlineUids = Object.entries(players || {})
      .filter(([uid, p]) => p.online && uid !== playerId)
      .map(([uid]) => uid);
    const broadcasterUids = Object.keys(broadcasters).filter((uid) => uid !== playerId);

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

    desired.forEach((uid) => {
      if (peerConnectionsRef.current.has(uid)) return;
      const theyBroadcast = !!broadcasters[uid];
      const iAmInitiator = cameraOn && (!theyBroadcast || playerId < uid);
      if (iAmInitiator) connectTo(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, broadcasters, players, roomCode, playerId]);

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
    }
  }, [cameraOn]);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setCameraOn(true);
      setMicOn(true);
      const peerRef = ref(db, `rooms/${roomCode}/webrtc/peers/${playerId}`);
      await update(peerRef, { mic: true, at: Date.now() });
      onDisconnect(peerRef).remove();
    } catch (err) {
      setCameraError('Kameraya erişilemedi: ' + err.message);
    }
  }

  function stopCamera() {
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
    <div className="camera-strip">
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
          <div className="camera-tile">
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
  );
}
