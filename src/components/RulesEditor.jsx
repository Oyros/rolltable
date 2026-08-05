import { useRef } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import GameRulesForm from './GameRulesForm.jsx';
import Portal from './Portal.jsx';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';

export default function RulesEditor({ roomCode, gameConfig, onClose }) {
  // Set by the form; guards the close button against throwing away edits.
  const dirtyRef = useRef(false);

  async function handleSave(config) {
    await update(ref(db, `rooms/${roomCode}/gameConfig`), config);
    onClose();
  }

  function handleClose() {
    if (
      dirtyRef.current &&
      !window.confirm('Kaydedilmemiş değişiklikler var. Yine de kapatılsın mı? (Taslak saklanır)')
    ) {
      return;
    }
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
            draftScope={`rules_${roomCode}`}
            onDirtyChange={(d) => {
              dirtyRef.current = d;
            }}
          />
        </div>
      </div>
    </Portal>
  );
}
