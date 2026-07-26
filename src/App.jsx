import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase.js';
import { getOrCreateLocalId } from './utils/id.js';
import Home from './pages/Home.jsx';
import Room from './pages/Room.jsx';

const SESSION_KEY = 'sessizlik_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fallbackTimer = setTimeout(() => {
      // Auth never resolved (network issue, corrupted browser storage,
      // extension interference...) — don't leave the user stuck on
      // "Bağlanıyor..." forever.
      if (!cancelled) setPlayerId((current) => current || getOrCreateLocalId());
    }, 8000);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (cancelled) return;
      if (user) {
        clearTimeout(fallbackTimer);
        setPlayerId(user.uid);
      } else {
        signInAnonymously(auth).catch(() => {
          // Anonymous Auth not enabled yet in the Firebase console for this
          // project — fall back to the old locally-generated id so the app
          // keeps working (just without server-enforced identity rules).
          if (!cancelled) {
            clearTimeout(fallbackTimer);
            setPlayerId(getOrCreateLocalId());
          }
        });
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  function handleJoin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function handleLeave() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (!playerId) {
    return (
      <div className="home-screen">
        <div className="home-card panel">
          <h1 className="title-font">RollTable</h1>
          <p className="subtitle">Bağlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Home onJoin={handleJoin} playerId={playerId} />;
  }

  return <Room session={session} onLeave={handleLeave} />;
}
