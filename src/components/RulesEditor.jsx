import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import GameRulesForm from './GameRulesForm.jsx';
import Portal from './Portal.jsx';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';

export default function RulesEditor({ roomCode, gameConfig, onClose }) {
  async function handleSave(config) {
    await update(ref(db, `rooms/${roomCode}/gameConfig`), config);
    onClose();
  }

  function handleClose() {
    applyTheme(gameConfig?.theme || DEFAULT_THEME_ID);
    onClose();
  }

  return (
    <Portal>
      <div className="whisper-overlay">
        <div className="game-setup-card panel rules-editor-card">
          <div className="rules-editor-header">
            <h1 className="title-font">Kuralları Düzenle</h1>
            <button type="button" className="btn-ghost" onClick={handleClose}>
              ✕ Kapat
            </button>
          </div>
          <p className="subtitle">
            Yeni stat, ırk, sınıf, trait, perk veya eşya ekleyebilirsin. Mevcut oyuncu seçimleri
            etkilenmez.
          </p>
          <GameRulesForm
            initial={gameConfig}
            submitLabel="Kaydet"
            onSubmit={handleSave}
            onThemeChange={applyTheme}
          />
        </div>
      </div>
    </Portal>
  );
}
