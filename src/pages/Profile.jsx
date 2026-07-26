import { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase.js';
import { applyTheme, getTheme, DEFAULT_THEME_ID } from '../utils/themes.js';
import ParticleEffect from '../components/ParticleEffect.jsx';
import HelpGuide from '../components/HelpGuide.jsx';
import Home from './Home.jsx';

function RoomCard({ roomCode, variant, playerId, onEnterAsGM, onEnterAsPlayer }) {
  const [exists, setExists] = useState(undefined);
  const [gameConfig, setGameConfig] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [myName, setMyName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubExists = onValue(ref(db, `rooms/${roomCode}/ownerId`), (snap) => setExists(snap.exists()));
    const unsubGc = onValue(ref(db, `rooms/${roomCode}/gameConfig`), (snap) => setGameConfig(snap.val()));
    const unsubSettings = onValue(ref(db, `rooms/${roomCode}/settings/sessionActive`), (snap) =>
      setSessionActive(!!snap.val())
    );
    let unsubName = () => {};
    if (variant === 'player') {
      unsubName = onValue(ref(db, `rooms/${roomCode}/players/${playerId}/name`), (snap) =>
        setMyName(snap.val() || '')
      );
    }
    return () => {
      unsubExists();
      unsubGc();
      unsubSettings();
      unsubName();
    };
  }, [roomCode, playerId, variant]);

  if (exists === false || exists === undefined) return null;

  const theme = getTheme(gameConfig?.theme || DEFAULT_THEME_ID);

  async function handleGmClick() {
    setBusy(true);
    try {
      await onEnterAsGM(roomCode, sessionActive);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="room-card" style={{ borderColor: theme.vars['--amber-dim'] }}>
      <span className="room-card-dot" style={{ background: theme.vars['--amber'] }} />
      <div className="room-card-info">
        <span className="room-card-name">{gameConfig?.name || `Oda: ${roomCode}`}</span>
        <span className="room-card-code muted">#{roomCode}</span>
        <span className={`room-card-status${sessionActive ? ' active' : ''}`}>
          {sessionActive ? '🟢 Aktif' : '⚪ Kapalı'}
        </span>
      </div>
      {variant === 'gm' ? (
        <button type="button" className="btn-primary small" onClick={handleGmClick} disabled={busy}>
          {sessionActive ? 'Odaya Gir' : '▶️ Oturumu Başlat'}
        </button>
      ) : (
        sessionActive && (
          <button
            type="button"
            className="btn-primary small"
            onClick={() => onEnterAsPlayer(roomCode, myName)}
          >
            Oturuma Katıl
          </button>
        )
      )}
    </div>
  );
}

export default function Profile({ authUser, profile, playerId, onJoin }) {
  const initialRoomParam = new URLSearchParams(window.location.search).get('room');
  const [homeView, setHomeView] = useState(initialRoomParam ? 'join' : null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    applyTheme(DEFAULT_THEME_ID);
  }, []);

  function toggleHideActivity() {
    update(ref(db, `users/${authUser.uid}`), { hideActivity: !profile.hideActivity });
  }

  async function handleEnterAsGM(roomCode, alreadyActive) {
    if (!alreadyActive) {
      await update(ref(db, `rooms/${roomCode}/settings`), {
        sessionActive: true,
        sessionStartedAt: Date.now(),
      });
    }
    onJoin({ roomCode, name: profile.nickname, role: 'gm', playerId });
  }

  function handleEnterAsPlayer(roomCode, myName) {
    onJoin({ roomCode, name: myName || profile.nickname, role: 'oyuncu', playerId });
  }

  if (homeView) {
    return (
      <Home
        onJoin={onJoin}
        playerId={playerId}
        mode={homeView}
        initialRoomCode={homeView === 'join' ? initialRoomParam || '' : ''}
        defaultName={profile.nickname}
        onExit={() => setHomeView(null)}
      />
    );
  }

  const gmRooms = Object.keys(profile.roomsAsGM || {});
  const playerRooms = Object.keys(profile.roomsAsPlayer || {});

  return (
    <div className="profile-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="profile-shell">
        <div className="profile-header panel">
          <div className="profile-header-user">
            {profile.avatarUrl ? (
              <img className="profile-avatar" src={profile.avatarUrl} alt={profile.nickname} />
            ) : (
              <span className="profile-avatar profile-avatar-fallback">
                {profile.nickname.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="title-font">{profile.nickname}</h1>
              {profile.email && <span className="muted">{profile.email}</span>}
            </div>
          </div>
          <div className="profile-header-actions">
            <label className="toggle-field">
              <input type="checkbox" checked={!!profile.hideActivity} onChange={toggleHideActivity} />
              Aktivitemi Gizle
            </label>
            <button type="button" className="btn-ghost" onClick={() => setShowHelp(true)}>
              ❓ Nasıl Çalışır?
            </button>
            <button type="button" className="btn-ghost" onClick={() => signOut(auth)}>
              🚪 Çıkış Yap
            </button>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="btn-primary" onClick={() => setHomeView('create')}>
            🎲 Yeni Oda Kur
          </button>
          <button type="button" className="btn-ghost" onClick={() => setHomeView('join')}>
            🚪 Kodla Odaya Katıl
          </button>
        </div>

        <div className="panel profile-section">
          <h2 className="title-font">GM Olduğun Odalar</h2>
          {gmRooms.length === 0 ? (
            <p className="muted">Henüz kurduğun bir oda yok.</p>
          ) : (
            <div className="room-card-list">
              {gmRooms.map((code) => (
                <RoomCard
                  key={code}
                  roomCode={code}
                  variant="gm"
                  playerId={playerId}
                  onEnterAsGM={handleEnterAsGM}
                  onEnterAsPlayer={handleEnterAsPlayer}
                />
              ))}
            </div>
          )}
        </div>

        <div className="panel profile-section">
          <h2 className="title-font">Katıldığın Odalar</h2>
          {playerRooms.length === 0 ? (
            <p className="muted">Henüz katıldığın bir oda yok.</p>
          ) : (
            <div className="room-card-list">
              {playerRooms.map((code) => (
                <RoomCard
                  key={code}
                  roomCode={code}
                  variant="player"
                  playerId={playerId}
                  onEnterAsGM={handleEnterAsGM}
                  onEnterAsPlayer={handleEnterAsPlayer}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
    </div>
  );
}
