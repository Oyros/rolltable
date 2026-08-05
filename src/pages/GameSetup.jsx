import { useEffect, useState } from 'react';
import { ref, onValue, update, push, get } from 'firebase/database';
import { db } from '../firebase.js';
import GameRulesForm from '../components/GameRulesForm.jsx';
import { applyTheme } from '../utils/themes.js';
import { DEFAULT_TEMPLATES } from '../utils/defaultTemplates.js';

export default function GameSetup({ roomCode }) {
  const [templates, setTemplates] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [applying, setApplying] = useState(false);
  const [templateError, setTemplateError] = useState('');

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    const templatesRef = ref(db, 'gameTemplates');
    const unsub = onValue(
      templatesRef,
      (snap) => setTemplates(snap.val() || {}),
      (err) => setTemplateError(`Şablonlar okunamadı: ${err.message}`)
    );
    return () => unsub();
  }, []);

  async function useTemplate() {
    if (!selectedTemplateId) return;
    setApplying(true);
    setTemplateError('');
    try {
      const builtin = DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (builtin) {
        const { id, label, ...rest } = builtin;
        await update(ref(db, `rooms/${roomCode}/gameConfig`), { ...rest, createdAt: Date.now() });
      } else {
        const snap = await get(ref(db, `gameTemplates/${selectedTemplateId}`));
        const tmpl = snap.val();
        if (tmpl) {
          const { createdAt, ...rest } = tmpl;
          await update(ref(db, `rooms/${roomCode}/gameConfig`), { ...rest, createdAt: Date.now() });
        }
      }
    } catch (err) {
      setTemplateError(`Şablon uygulanamadı: ${err.message}`);
    }
    setApplying(false);
  }

  async function handleCreate(config) {
    const withDate = { ...config, createdAt: Date.now() };
    await update(ref(db, `rooms/${roomCode}/gameConfig`), withDate);
    if (saveAsTemplate) {
      await push(ref(db, 'gameTemplates'), {
        ...withDate,
        name: templateName.trim() || config.name,
      });
    }
  }

  const templateList = Object.entries(templates);

  return (
    <div className="room-setup-wrap">
      <div className="game-setup-card panel">
        <h1 className="title-font">Oyunu Ayarla</h1>
        <p className="subtitle">Bu oda için önce oyunun kurallarını tanımlaman gerekiyor.</p>

        <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <h3 className="title-font gm-section-title">Kayıtlı Şablon Kullan</h3>
          <div className="inline-form">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">Şablon seç...</option>
              <optgroup label="Hazır Şablonlar">
                {DEFAULT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label || t.name}
                  </option>
                ))}
              </optgroup>
              {templateList.length > 0 && (
                <optgroup label="Kayıtlı Şablonlarım">
                  {templateList.map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <button
              type="button"
              className="btn-primary small"
              onClick={useTemplate}
              disabled={!selectedTemplateId || applying}
            >
              {applying ? 'Uygulanıyor...' : 'Bu Şablonu Kullan'}
            </button>
          </div>
          {templateError && <p className="sound-error">{templateError}</p>}
        </div>

        <div className="gm-section">
          <h3 className="title-font gm-section-title">Sıfırdan Oluştur</h3>
          <GameRulesForm
            submitLabel="Oyunu Başlat"
            onSubmit={handleCreate}
            onThemeChange={applyTheme}
            draftScope={`setup_${roomCode}`}
          >
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
              />
              Bu oyunu şablon olarak kaydet (sonra tekrar kullan)
            </label>
            {saveAsTemplate && (
              <label>
                Şablon Adı
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Şablon adı"
                />
              </label>
            )}
          </GameRulesForm>
        </div>
      </div>
    </div>
  );
}
