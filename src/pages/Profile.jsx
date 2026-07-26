import { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase.js';
import { applyTheme, getTheme, DEFAULT_THEME_ID } from '../utils/themes.js';
import ParticleEffect from '../components/ParticleEffect.jsx';
import HelpGuide from '../components/HelpGuide.jsx';
import Home from './Home.jsx';
import PublicProfile from './PublicProfile.jsx';
import {
  findUserByNickname,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from '../utils/friends.js';

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

function UserRow({ uid, hint, children, onOpenProfile }) {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const unsub = onValue(ref(db, `users/${uid}/nickname`), (snap) => setNickname(snap.val() || ''));
    return () => unsub();
  }, [uid]);

  return (
    <div className="room-card">
      <span className="room-card-dot" style={{ background: 'var(--amber)' }} />
      <div className="room-card-info">
        <button type="button" className="user-row-name" onClick={() => onOpenProfile(uid)}>
          {nickname || '...'}
        </button>
        {hint && <span className="room-card-code muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function FriendsSection({ profile, playerId, onOpenProfile }) {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const friends = Object.keys(profile.friends || {});
  const incoming = profile.friendRequestsIncoming || {};
  const outgoing = profile.friendRequestsOutgoing || {};

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchBusy(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const found = await findUserByNickname(search);
      if (!found) {
        setSearchError('Bu kullanıcı adında biri bulunamadı.');
      } else {
        setSearchResult(found);
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchBusy(false);
    }
  }

  async function handleAddFriend() {
    if (!searchResult) return;
    setActionBusy(true);
    try {
      await sendFriendRequest(playerId, profile.nickname, searchResult.uid, searchResult.nickname);
      setSearchResult(null);
      setSearch('');
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setActionBusy(false);
    }
  }

  function handleAction(fn) {
    fn().catch((err) => setSearchError(err.message));
  }

  const alreadyFriend = searchResult && !!profile.friends?.[searchResult.uid];
  const alreadyRequested =
    searchResult && (!!outgoing[searchResult.uid] || !!incoming[searchResult.uid]);
  const isSelfResult = searchResult && searchResult.uid === playerId;

  return (
    <div className="panel profile-section">
      <h2 className="title-font">Arkadaşlar</h2>

      <form onSubmit={handleSearch} className="friend-search-form">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kullanıcı adıyla ara..."
        />
        <button type="submit" className="btn-ghost small" disabled={searchBusy}>
          {searchBusy ? 'Aranıyor...' : 'Ara'}
        </button>
      </form>
      {searchError && <p className="sound-error">{searchError}</p>}
      {searchResult && (
        <div className="room-card">
          <span className="room-card-dot" style={{ background: 'var(--amber)' }} />
          <div className="room-card-info">
            <button type="button" className="user-row-name" onClick={() => onOpenProfile(searchResult.uid)}>
              {searchResult.nickname}
            </button>
          </div>
          {isSelfResult ? (
            <span className="muted room-card-status">Bu sensin</span>
          ) : alreadyFriend ? (
            <span className="muted room-card-status">Zaten arkadaşsınız</span>
          ) : alreadyRequested ? (
            <span className="muted room-card-status">İstek bekliyor</span>
          ) : (
            <button type="button" className="btn-primary small" onClick={handleAddFriend} disabled={actionBusy}>
              Arkadaş Ekle
            </button>
          )}
        </div>
      )}

      {Object.keys(incoming).length > 0 && (
        <>
          <h3 className="friends-subheading">Gelen İstekler</h3>
          <div className="room-card-list">
            {Object.keys(incoming).map((fromUid) => (
              <UserRow key={fromUid} uid={fromUid} onOpenProfile={onOpenProfile}>
                <button
                  type="button"
                  className="btn-primary small"
                  onClick={() => handleAction(() => acceptFriendRequest(playerId, fromUid))}
                >
                  Kabul Et
                </button>
                <button
                  type="button"
                  className="btn-ghost small"
                  onClick={() => handleAction(() => declineFriendRequest(playerId, fromUid))}
                >
                  Reddet
                </button>
              </UserRow>
            ))}
          </div>
        </>
      )}

      {Object.keys(outgoing).length > 0 && (
        <>
          <h3 className="friends-subheading">Giden İstekler</h3>
          <div className="room-card-list">
            {Object.keys(outgoing).map((toUid) => (
              <UserRow key={toUid} uid={toUid} onOpenProfile={onOpenProfile}>
                <button
                  type="button"
                  className="btn-ghost small"
                  onClick={() => handleAction(() => cancelFriendRequest(playerId, toUid))}
                >
                  İptal Et
                </button>
              </UserRow>
            ))}
          </div>
        </>
      )}

      <h3 className="friends-subheading">Arkadaş Listesi</h3>
      {friends.length === 0 ? (
        <p className="muted">Henüz arkadaşın yok.</p>
      ) : (
        <div className="room-card-list">
          {friends.map((uid) => (
            <UserRow key={uid} uid={uid} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile({ authUser, profile, playerId, onJoin }) {
  const initialRoomParam = new URLSearchParams(window.location.search).get('room');
  const [homeView, setHomeView] = useState(initialRoomParam ? 'join' : null);
  const [showHelp, setShowHelp] = useState(false);
  const [viewingUid, setViewingUid] = useState(null);

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

  if (viewingUid) {
    return (
      <PublicProfile
        uid={viewingUid}
        myUid={playerId}
        myProfile={profile}
        onBack={() => setViewingUid(null)}
      />
    );
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

        <FriendsSection profile={profile} playerId={playerId} onOpenProfile={setViewingUid} />
      </div>
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
    </div>
  );
}
