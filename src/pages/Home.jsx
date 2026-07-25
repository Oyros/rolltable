import { useEffect, useState } from 'react';
import { getOrCreatePlayerId } from '../utils/id.js';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';
import ParticleEffect from '../components/ParticleEffect.jsx';

export default function Home({ onJoin }) {
  const params = new URLSearchParams(window.location.search);
  const [roomCode, setRoomCode] = useState(params.get('room') || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState('oyuncu');

  useEffect(() => {
    applyTheme(DEFAULT_THEME_ID);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!roomCode.trim() || !name.trim()) return;
    const playerId = getOrCreatePlayerId();
    onJoin({
      roomCode: roomCode.trim().toLowerCase(),
      name: name.trim(),
      role,
      playerId,
    });
  }

  return (
    <div className="home-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="home-card panel">
        <h1 className="title-font">RollTable</h1>
        <p className="subtitle">Sanal Masaya Katıl</p>
        <form onSubmit={handleSubmit}>
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
          <fieldset>
            <legend>Rolün</legend>
            <label className="radio">
              <input
                type="radio"
                name="role"
                value="oyuncu"
                checked={role === 'oyuncu'}
                onChange={() => setRole('oyuncu')}
              />
              Oyuncu
            </label>
            <label className="radio">
              <input
                type="radio"
                name="role"
                value="gm"
                checked={role === 'gm'}
                onChange={() => setRole('gm')}
              />
              Oyun Yöneticisi (GM)
            </label>
          </fieldset>
          <button type="submit" className="btn-primary">
            Masaya Otur
          </button>
        </form>
      </div>
    </div>
  );
}
