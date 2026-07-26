import { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase.js';
import { getOrCreatePlayerId } from '../utils/id.js';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';
import ParticleEffect from '../components/ParticleEffect.jsx';
import HelpGuide from '../components/HelpGuide.jsx';

export default function Home({ onJoin }) {
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState(params.get('room') ? 'join' : null);
  const [roomCode, setRoomCode] = useState(params.get('room') || '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    applyTheme(DEFAULT_THEME_ID);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!roomCode.trim() || !name.trim()) return;
    const code = roomCode.trim().toLowerCase();
    setBusy(true);
    setError('');
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (snap.exists()) {
        setError('Bu oda kodu zaten kullanılıyor. Farklı bir kod dene.');
        setBusy(false);
        return;
      }
      const playerId = getOrCreatePlayerId();
      await update(ref(db, `rooms/${code}`), { ownerId: playerId, ownerName: name.trim() });
      onJoin({ roomCode: code, name: name.trim(), role: 'gm', playerId });
    } catch (err) {
      setError(`Oda kurulamadı: ${err.message}`);
      setBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!roomCode.trim() || !name.trim()) return;
    const code = roomCode.trim().toLowerCase();
    setBusy(true);
    setError('');
    try {
      const snap = await get(ref(db, `rooms/${code}`));
      if (!snap.exists()) {
        setError('Bu oda kodu bulunamadı. Önce GM odayı kurmalı.');
        setBusy(false);
        return;
      }
      const playerId = getOrCreatePlayerId();
      const ownerId = snap.val()?.ownerId;
      const role = ownerId && ownerId === playerId ? 'gm' : 'oyuncu';
      onJoin({ roomCode: code, name: name.trim(), role, playerId });
    } catch (err) {
      setError(`Katılınamadı: ${err.message}`);
      setBusy(false);
    }
  }

  function goBack() {
    setMode(null);
    setError('');
  }

  if (!mode) {
    return (
      <div className="home-screen">
        <ParticleEffect theme={DEFAULT_THEME_ID} />
        <div className="home-card panel">
          <h1 className="title-font">RollTable</h1>
          <p className="subtitle">Sanal Masaya Katıl</p>
          <div className="home-choice-buttons">
            <button type="button" className="btn-primary" onClick={() => setMode('create')}>
              🎲 Oda Kur
            </button>
            <button
              type="button"
              className="btn-ghost sound-toggle home-join-btn"
              onClick={() => setMode('join')}
            >
              🚪 Odaya Katıl
            </button>
          </div>
          <button
            type="button"
            className="btn-ghost home-back-btn"
            onClick={() => setShowHelp(true)}
          >
            ❓ Nasıl Çalışır?
          </button>
        </div>
        {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
      </div>
    );
  }

  return (
    <div className="home-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="home-card panel">
        <h1 className="title-font">RollTable</h1>
        <p className="subtitle">{mode === 'create' ? 'Yeni Oda Kur' : 'Odaya Katıl'}</p>
        <form onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          <label>
            Oda Kodu
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="örn. kampanya1"
              required
            />
          </label>
          <label>
            İsmin
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Karakter veya oyuncu adın"
              required
            />
          </label>

          {mode === 'create' && (
            <p className="muted home-hint">
              Bu kodla yeni bir oda kurulacak ve otomatik olarak GM olarak atanacaksın. Sadece sen
              bu odayı silebilirsin.
            </p>
          )}

          {error && <p className="sound-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Bekleniyor...' : mode === 'create' ? 'Odayı Kur ve Gir' : 'Masaya Otur'}
          </button>
          <button type="button" className="btn-ghost home-back-btn" onClick={goBack}>
            ← Geri
          </button>
        </form>
      </div>
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
    </div>
  );
}
