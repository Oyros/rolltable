import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { DEFAULT_THEME_ID, getTheme } from '../utils/themes.js';
import ParticleEffect from '../components/ParticleEffect.jsx';
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '../utils/friends.js';

function RoomSummary({ roomCode }) {
  const [gameConfig, setGameConfig] = useState(null);
  const [exists, setExists] = useState(undefined);

  useEffect(() => {
    const unsubExists = onValue(ref(db, `rooms/${roomCode}/ownerId`), (snap) => setExists(snap.exists()));
    const unsubGc = onValue(ref(db, `rooms/${roomCode}/gameConfig`), (snap) => setGameConfig(snap.val()));
    return () => {
      unsubExists();
      unsubGc();
    };
  }, [roomCode]);

  if (exists === false || exists === undefined) return null;
  const theme = getTheme(gameConfig?.theme || DEFAULT_THEME_ID);

  return (
    <div className="room-card" style={{ borderColor: theme.vars['--amber-dim'] }}>
      <span className="room-card-dot" style={{ background: theme.vars['--amber'] }} />
      <div className="room-card-info">
        <span className="room-card-name">{gameConfig?.name || `Oda: ${roomCode}`}</span>
        <span className="room-card-code muted">#{roomCode}</span>
      </div>
    </div>
  );
}

export default function PublicProfile({ uid, myUid, myProfile, onBack }) {
  const [profile, setProfile] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onValue(ref(db, `users/${uid}`), (snap) => setProfile(snap.val() || null));
    return () => unsub();
  }, [uid]);

  if (profile === undefined) return null;
  if (!profile) {
    return (
      <div className="profile-screen">
        <ParticleEffect theme={DEFAULT_THEME_ID} />
        <div className="profile-shell">
          <div className="panel profile-section">
            <p className="muted">Bu kullanıcı bulunamadı.</p>
            <button type="button" className="btn-ghost" onClick={onBack}>
              ← Geri
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSelf = uid === myUid;
  const isFriend = !!myProfile?.friends?.[uid];
  const outgoingPending = !!myProfile?.friendRequestsOutgoing?.[uid];
  const incomingPending = !!myProfile?.friendRequestsIncoming?.[uid];
  const gmRooms = Object.keys(profile.roomsAsGM || {});
  const playerRooms = Object.keys(profile.roomsAsPlayer || {});
  const canSeeActivity = isSelf || !profile.hideActivity;

  async function withBusy(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="profile-shell">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Geri
        </button>

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
              {isSelf && <span className="muted">Bu sensin</span>}
            </div>
          </div>
          {!isSelf && (
            <div className="profile-header-actions">
              {isFriend && (
                <button
                  type="button"
                  className="btn-ghost danger"
                  disabled={busy}
                  onClick={() => withBusy(() => removeFriend(myUid, uid))}
                >
                  Arkadaşlıktan Çıkar
                </button>
              )}
              {!isFriend && outgoingPending && (
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() => withBusy(() => cancelFriendRequest(myUid, uid))}
                >
                  İsteği İptal Et
                </button>
              )}
              {!isFriend && incomingPending && (
                <>
                  <button
                    type="button"
                    className="btn-primary small"
                    disabled={busy}
                    onClick={() => withBusy(() => acceptFriendRequest(myUid, uid))}
                  >
                    Kabul Et
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={busy}
                    onClick={() => withBusy(() => declineFriendRequest(myUid, uid))}
                  >
                    Reddet
                  </button>
                </>
              )}
              {!isFriend && !outgoingPending && !incomingPending && (
                <button
                  type="button"
                  className="btn-primary small"
                  disabled={busy}
                  onClick={() =>
                    withBusy(() =>
                      sendFriendRequest(myUid, myProfile.nickname, uid, profile.nickname)
                    )
                  }
                >
                  Arkadaş Ekle
                </button>
              )}
            </div>
          )}
        </div>

        {error && <p className="sound-error">{error}</p>}

        {canSeeActivity ? (
          <>
            <div className="panel profile-section">
              <h2 className="title-font">GM Olduğu Odalar</h2>
              {gmRooms.length === 0 ? (
                <p className="muted">Yok.</p>
              ) : (
                <div className="room-card-list">
                  {gmRooms.map((code) => (
                    <RoomSummary key={code} roomCode={code} />
                  ))}
                </div>
              )}
            </div>
            <div className="panel profile-section">
              <h2 className="title-font">Katıldığı Odalar</h2>
              {playerRooms.length === 0 ? (
                <p className="muted">Yok.</p>
              ) : (
                <div className="room-card-list">
                  {playerRooms.map((code) => (
                    <RoomSummary key={code} roomCode={code} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="panel profile-section">
            <p className="muted">Bu kullanıcı aktivitesini gizledi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
