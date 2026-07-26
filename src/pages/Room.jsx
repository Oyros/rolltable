import { useEffect, useRef, useState } from 'react';
import { ref, onValue, update, get, remove, onDisconnect } from 'firebase/database';
import { db } from '../firebase.js';
import SceneDisplay from '../components/SceneDisplay.jsx';
import DiceRoller from '../components/DiceRoller.jsx';
import CharacterSheet from '../components/CharacterSheet.jsx';
import GMPanel from '../components/GMPanel.jsx';
import SoundEffectsPanel from '../components/SoundEffectsPanel.jsx';
import VisualEffectsPanel from '../components/VisualEffectsPanel.jsx';
import GMNotes from '../components/GMNotes.jsx';
import PlayerNotes from '../components/PlayerNotes.jsx';
import PartyOverview from '../components/PartyOverview.jsx';
import GmSlotCard from '../components/GmSlotCard.jsx';
import Portal from '../components/Portal.jsx';
import WhisperOverlay from '../components/WhisperOverlay.jsx';
import GameSetup from './GameSetup.jsx';
import ParticleEffect from '../components/ParticleEffect.jsx';
import WeatherEffect from '../components/WeatherEffect.jsx';
import SessionTimer from '../components/SessionTimer.jsx';
import NpcNameGenerator from '../components/NpcNameGenerator.jsx';
import PromptGenerator from '../components/PromptGenerator.jsx';
import HelpGuide from '../components/HelpGuide.jsx';
import QuestBoard from '../components/QuestBoard.jsx';
import LootGenerator from '../components/LootGenerator.jsx';
import GameCalendar from '../components/GameCalendar.jsx';
import InitiativeBar from '../components/InitiativeBar.jsx';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';

const AMBIANCE_VOLUME_KEY = 'sessizlik_ambiance_volume';

function loadAmbianceVolume() {
  const raw = localStorage.getItem(AMBIANCE_VOLUME_KEY);
  const parsed = raw ? parseFloat(raw) : 0.5;
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.5;
}

export default function Room({ session, onLeave }) {
  const { roomCode, playerId, name, role } = session;
  const [players, setPlayers] = useState({});
  const [scene, setScene] = useState(null);
  const [settings, setSettings] = useState(null);
  const [gameConfig, setGameConfig] = useState(undefined);
  const [quests, setQuests] = useState({});
  const [flashActive, setFlashActive] = useState(false);
  const [ambianceVolume, setAmbianceVolumeState] = useState(loadAmbianceVolume);
  const [joinBlocked, setJoinBlocked] = useState(false);
  const [kicked, setKicked] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [turnBannerActive, setTurnBannerActive] = useState(false);
  const flashSeenRef = useRef(undefined);
  const kickSeenRef = useRef(undefined);
  const turnSeenRef = useRef(undefined);

  function setAmbianceVolume(value) {
    setAmbianceVolumeState(value);
    localStorage.setItem(AMBIANCE_VOLUME_KEY, String(value));
  }

  useEffect(() => {
    if (!gameConfig) return;
    let cancelled = false;

    async function joinRoom() {
      const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
      const snap = await get(playerRef);

      if (!snap.exists()) {
        if (role !== 'gm') {
          const lockedSnap = await get(ref(db, `rooms/${roomCode}/settings/locked`));
          if (lockedSnap.val()) {
            if (!cancelled) setJoinBlocked(true);
            return;
          }
        }
        const defaultStats = {};
        (gameConfig.stats || []).forEach((stat) => {
          defaultStats[stat.id] = 2;
        });
        update(playerRef, {
          name,
          role,
          status: 'iyi',
          stats: defaultStats,
          skills: '',
          inventory: [],
          raceId: '',
          classId: '',
          subclassId: '',
          traits: [],
          perks: [],
          updatedAt: Date.now(),
        });
      } else {
        update(playerRef, { name, role, updatedAt: Date.now() });
      }
    }

    joinRoom();
    return () => {
      cancelled = true;
    };
  }, [roomCode, playerId, name, role, gameConfig]);

  useEffect(() => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsub = onValue(playersRef, (snap) => setPlayers(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (!gameConfig) return undefined;
    const connectedRef = ref(db, '.info/connected');
    const presencePath = `rooms/${roomCode}/players/${playerId}`;

    const unsub = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(ref(db, `${presencePath}/online`)).set(false);
        update(ref(db, presencePath), { online: true });
      }
    });

    return () => {
      unsub();
      update(ref(db, presencePath), { online: false }).catch(() => {});
    };
  }, [roomCode, playerId, gameConfig]);

  useEffect(() => {
    const sceneRef = ref(db, `rooms/${roomCode}/scene`);
    const unsub = onValue(sceneRef, (snap) => setScene(snap.val()));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    const ownerRef = ref(db, `rooms/${roomCode}/ownerId`);
    const unsub = onValue(ownerRef, (snap) => setOwnerId(snap.val()));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    const settingsRef = ref(db, `rooms/${roomCode}/settings`);
    const unsub = onValue(settingsRef, (snap) => setSettings(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    const gameConfigRef = ref(db, `rooms/${roomCode}/gameConfig`);
    const unsub = onValue(gameConfigRef, (snap) => setGameConfig(snap.val() || null));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    const questsRef = ref(db, `rooms/${roomCode}/quests`);
    const unsub = onValue(questsRef, (snap) => setQuests(snap.val() || {}));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (role === 'gm') return;
    const kickRef = ref(db, `rooms/${roomCode}/kickSignal/${playerId}`);
    const unsub = onValue(kickRef, (snap) => {
      const val = snap.val();
      if (kickSeenRef.current === undefined) {
        kickSeenRef.current = val ?? null;
        return;
      }
      if (val && val !== kickSeenRef.current) {
        kickSeenRef.current = val;
        setKicked(true);
      }
    });
    return () => unsub();
  }, [roomCode, playerId, role]);

  useEffect(() => {
    if (scene?.flashAt === undefined) return;
    if (flashSeenRef.current === undefined) {
      flashSeenRef.current = scene.flashAt;
      return;
    }
    if (scene.flashAt !== flashSeenRef.current) {
      flashSeenRef.current = scene.flashAt;
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 600);
    }
  }, [scene?.flashAt]);

  useEffect(() => {
    if (role === 'gm') return;
    const at = settings?.initiative?.at;
    if (at === undefined) return;
    if (turnSeenRef.current === undefined) {
      turnSeenRef.current = at;
      return;
    }
    if (at !== turnSeenRef.current) {
      turnSeenRef.current = at;
      const queue = settings?.initiative?.queue || [];
      const currentId = queue[settings?.initiative?.currentIndex ?? 0];
      if (currentId === playerId) {
        setTurnBannerActive(true);
        setTimeout(() => setTurnBannerActive(false), 3500);
      }
    }
  }, [settings?.initiative, role, playerId]);

  useEffect(() => {
    const v = scene?.vignette ?? 0;
    const opacity = 0.35 + (v / 100) * 0.55;
    const inner = 40 - (v / 100) * 25;
    document.documentElement.style.setProperty('--vignette-opacity', opacity.toFixed(2));
    document.documentElement.style.setProperty('--vignette-inner', `${inner.toFixed(0)}%`);
  }, [scene?.vignette]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--vignette-opacity');
      document.documentElement.style.removeProperty('--vignette-inner');
    };
  }, []);

  useEffect(() => {
    if (gameConfig?.theme) applyTheme(gameConfig.theme);
  }, [gameConfig?.theme]);

  useEffect(() => {
    return () => applyTheme(DEFAULT_THEME_ID);
  }, []);

  function kickPlayer(targetId) {
    update(ref(db, `rooms/${roomCode}/kickSignal`), { [targetId]: Date.now() });
    remove(ref(db, `rooms/${roomCode}/players/${targetId}`));
  }

  function advanceInitiative(direction) {
    const queue = settings?.initiative?.queue || [];
    if (queue.length === 0) return;
    const currentIndex = settings?.initiative?.currentIndex ?? 0;
    const prevId = queue[currentIndex] ?? null;
    const newIndex = (currentIndex + direction + queue.length) % queue.length;
    update(ref(db, `rooms/${roomCode}/settings/initiative`), {
      currentIndex: newIndex,
      previousPlayerId: prevId,
      at: Date.now(),
    });
  }

  const isOwner = ownerId ? ownerId === playerId : true;

  function deleteRoom() {
    if (!isOwner) return;
    if (
      !window.confirm(
        'Bu odayı ve içindeki tüm verileri (sahne, karakterler, oyun kuralları) kalıcı olarak silmek istediğine emin misin?'
      )
    ) {
      return;
    }
    remove(ref(db, `rooms/${roomCode}`));
    onLeave();
  }

  const me = players[playerId];

  const header = (
    <header className="room-header">
      {settings?.bannerUrl && (
        <>
          <img className="room-header-banner" src={settings.bannerUrl} alt="" />
          <div className="room-header-banner-overlay" />
        </>
      )}
      <div className="room-header-content">
        <div className="header-left">
          <h1 className="title-font">{gameConfig?.name || 'RollTable'}</h1>
          <span className="room-code">Oda: {roomCode}</span>
        </div>
        <div className="header-center">
          <InitiativeBar
            initiative={settings?.initiative}
            players={players}
            isGM={role === 'gm'}
            onAdvance={advanceInitiative}
          />
        </div>
        <div className="header-right">
          <SessionTimer startedAt={settings?.sessionStartedAt} />
          <span className="who-am-i">
            {name} · {role === 'gm' ? 'GM' : 'Oyuncu'}
          </span>
          <button className="btn-ghost" onClick={() => setShowHelp(true)}>
            ❓ Yardım
          </button>
          <button className="btn-ghost" onClick={onLeave}>
            Odadan Çık
          </button>
        </div>
      </div>
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
    </header>
  );

  if (kicked) {
    return (
      <div className="room">
        {header}
        <div className="room-setup-wrap">
          <div className="game-setup-card panel">
            <h1 className="title-font">Odadan Çıkarıldın</h1>
            <p className="subtitle">GM seni bu odadan çıkardı. İstersen tekrar katılabilirsin.</p>
            <button type="button" className="btn-primary" onClick={onLeave}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (joinBlocked) {
    return (
      <div className="room">
        {header}
        <div className="room-setup-wrap">
          <div className="game-setup-card panel">
            <h1 className="title-font">Oda Kilitli</h1>
            <p className="subtitle">
              GM şu anda bu odaya yeni katılımcı kabul etmiyor. Daha sonra tekrar dene.
            </p>
            <button type="button" className="btn-primary" onClick={onLeave}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameConfig) {
    return (
      <div className="room">
        {header}
        {role === 'gm' ? (
          <GameSetup roomCode={roomCode} />
        ) : (
          <div className="room-setup-wrap">
            <p className="muted">GM henüz oyunu ayarlıyor, lütfen bekle...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`room${flashActive ? ' shake' : ''}`}>
      <div className={`flash-overlay${flashActive ? ' active' : ''}`} />

      <ParticleEffect theme={gameConfig?.theme || DEFAULT_THEME_ID} />
      <WeatherEffect weather={scene?.weather} />

      {role !== 'gm' && (
        <WhisperOverlay whispers={me?.whispers} roomCode={roomCode} playerId={playerId} />
      )}

      {turnBannerActive && (
        <Portal>
          <div className="whisper-overlay">
            <div className="whisper-box panel turn-banner">
              <span className="turn-banner-icon">🎙️</span>
              <p>SIRA SENDE!</p>
              <button type="button" className="btn-primary small" onClick={() => setTurnBannerActive(false)}>
                Tamam
              </button>
            </div>
          </div>
        </Portal>
      )}

      {header}

      <div className="room-body">
        <aside className="room-sidebar">
          <GmSlotCard players={players} />

          <details className="panel side-accordion" open>
            <summary>
              🗓️ Takvim<span className="side-accordion-chevron">▾</span>
            </summary>
            <div className="side-accordion-body">
              <GameCalendar roomCode={roomCode} calendar={settings?.calendar} isGM={role === 'gm'} />
            </div>
          </details>

          <details className="panel side-accordion" open>
            <summary>
              👥 Parti<span className="side-accordion-chevron">▾</span>
            </summary>
            <div className="side-accordion-body">
              <PartyOverview
                players={players}
                gameConfig={gameConfig}
                isGM={role === 'gm'}
                onKick={kickPlayer}
                playerId={playerId}
                activeTurnPlayerId={settings?.initiative?.queue?.[settings?.initiative?.currentIndex ?? 0]}
                roomCode={roomCode}
                sessionStarted={!!settings?.sessionStartedAt}
              />
            </div>
          </details>

          <details className="panel side-accordion">
            <summary>
              📜 Görev Panosu<span className="side-accordion-chevron">▾</span>
            </summary>
            <div className="side-accordion-body">
              <QuestBoard
                roomCode={roomCode}
                quests={quests}
                isGM={role === 'gm'}
                players={players}
                calendar={settings?.calendar}
              />
            </div>
          </details>
        </aside>

        <div className="room-content">
          <SceneDisplay
            scene={scene}
            roomCode={roomCode}
            isGM={role === 'gm'}
            name={name}
            playerId={playerId}
            pinColor={me?.color}
            ambianceVolume={ambianceVolume}
            onAmbianceVolumeChange={setAmbianceVolume}
            savedLocations={settings?.savedLocations}
            savedFocuses={settings?.savedFocuses}
            savedMusic={settings?.savedMusic}
          />

          <div className="room-bottom">
            <button
              type="button"
              className="panel bottom-panel-trigger"
              onClick={() => setShowBottomPanel(true)}
            >
              <span className="bottom-panel-trigger-icon">{role === 'gm' ? '🛠️' : '📜'}</span>
              <span>{role === 'gm' ? 'GM Kontrol Panelini Aç' : 'Karakter Kağıdımı Aç'}</span>
            </button>
          </div>

          {showBottomPanel && (
            <Portal>
            <div className="whisper-overlay" onClick={() => setShowBottomPanel(false)}>
              <div className="bottom-panel-modal" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn-ghost bottom-panel-close"
                  onClick={() => setShowBottomPanel(false)}
                >
                  ✕ Kapat
                </button>
                {role === 'gm' ? (
                  <GMPanel
                    roomCode={roomCode}
                    scene={scene}
                    players={players}
                    settings={settings}
                    gameConfig={gameConfig}
                    onDeleteRoom={deleteRoom}
                    isOwner={isOwner}
                  />
                ) : (
                  me && (
                    <CharacterSheet
                      roomCode={roomCode}
                      playerId={playerId}
                      player={me}
                      gameConfig={gameConfig}
                      sessionStarted={!!settings?.sessionStartedAt}
                    />
                  )
                )}
              </div>
            </div>
            </Portal>
          )}
        </div>

        <aside className="room-sidebar">
          <details className="panel side-accordion" open>
            <summary>
              🎲 Zar<span className="side-accordion-chevron">▾</span>
            </summary>
            <div className="side-accordion-body">
              <DiceRoller roomCode={roomCode} name={name} isGM={role === 'gm'} />
            </div>
          </details>

          {role !== 'gm' && (
            <details className="panel side-accordion">
              <summary>
                📓 Not Defterim<span className="side-accordion-chevron">▾</span>
              </summary>
              <div className="side-accordion-body">
                <PlayerNotes roomCode={roomCode} playerId={playerId} player={me} />
              </div>
            </details>
          )}

          {role === 'gm' && (
            <details className="panel side-accordion">
              <summary>
                🌫️ Görsel Efektler<span className="side-accordion-chevron">▾</span>
              </summary>
              <div className="side-accordion-body">
                <VisualEffectsPanel roomCode={roomCode} scene={scene} />
              </div>
            </details>
          )}

          {role === 'gm' && (
            <details className="panel side-accordion">
              <summary>
                🔊 Ses Efektleri<span className="side-accordion-chevron">▾</span>
              </summary>
              <div className="side-accordion-body">
                <SoundEffectsPanel
                  roomCode={roomCode}
                  scene={scene}
                  ambianceVolume={ambianceVolume}
                  onAmbianceVolumeChange={setAmbianceVolume}
                />
              </div>
            </details>
          )}

          {role === 'gm' && (
            <details className="panel side-accordion">
              <summary>
                📝 GM Notları<span className="side-accordion-chevron">▾</span>
              </summary>
              <div className="side-accordion-body">
                <GMNotes roomCode={roomCode} settings={settings} />
              </div>
            </details>
          )}

          {role === 'gm' && (
            <details className="panel side-accordion">
              <summary>
                🎭 Üreteçler<span className="side-accordion-chevron">▾</span>
              </summary>
              <div className="side-accordion-body">
                <NpcNameGenerator theme={gameConfig?.theme} />
                <PromptGenerator theme={gameConfig?.theme} />
                <LootGenerator roomCode={roomCode} players={players} theme={gameConfig?.theme} />
              </div>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
