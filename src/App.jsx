import { lazy, Suspense, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, db } from './firebase.js';
// Split per page: someone signing in shouldn't download the whole room
// (Firebase, WebRTC, the map, the GM panel) before they can even see the form.
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Room = lazy(() => import('./pages/Room.jsx'));

const SESSION_KEY = 'sessizlik_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Each page arrives as its own chunk, so there's a beat before it renders.
function page(node) {
  return <Suspense fallback={<LoadingScreen text="Yükleniyor..." />}>{node}</Suspense>;
}

function LoadingScreen({ text, action }) {
  return (
    <div className="home-screen">
      <div className="home-card panel">
        <h1 className="title-font">RollTable</h1>
        <p className="subtitle">{text}</p>
        {action}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = logged out
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = no profile yet
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setAuthTimedOut(true);
    }, 8000);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (cancelled) return;
      clearTimeout(timer);
      setAuthTimedOut(false);
      setAuthUser(user);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!authUser) {
      setProfile(undefined);
      return undefined;
    }
    const unsub = onValue(ref(db, `users/${authUser.uid}`), (snap) => {
      setProfile(snap.val() || null);
    });
    return () => unsub();
  }, [authUser]);

  // Discard a stale session left over from a previously logged-in account on
  // this browser — the stored playerId won't match the account now signed in.
  useEffect(() => {
    if (authUser && session && session.playerId !== authUser.uid) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  function handleJoin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function handleLeave() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (authUser === undefined) {
    if (authTimedOut) {
      return (
        <LoadingScreen
          text="Bağlantı kurulamadı."
          action={
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Yeniden Dene
            </button>
          }
        />
      );
    }
    return <LoadingScreen text="Bağlanıyor..." />;
  }

  if (!authUser) {
    return page(<Auth mode="login-or-signup" />);
  }

  if (profile === undefined) {
    return <LoadingScreen text="Bağlanıyor..." />;
  }

  if (!profile) {
    return page(<Auth authUser={authUser} mode="complete-profile" />);
  }

  if (!session) {
    return page(
      <Profile authUser={authUser} profile={profile} playerId={authUser.uid} onJoin={handleJoin} />
    );
  }

  return page(<Room session={session} onLeave={handleLeave} />);
}
