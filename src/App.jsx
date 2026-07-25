import { useState } from 'react';
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

  function handleJoin(newSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function handleLeave() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (!session) {
    return <Home onJoin={handleJoin} />;
  }

  return <Room session={session} onLeave={handleLeave} />;
}
