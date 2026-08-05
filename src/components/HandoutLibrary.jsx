import { useState } from 'react';
import { ref, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import FileUploadButton from './FileUploadButton.jsx';
import { buildSendPayload, recipientLabel } from '../utils/handouts.js';
import { trackedRemove } from '../utils/journal.js';

// GM-only. Handouts are written once here, then sent to the whole table or to
// individual players; each send shows up as a card in their chat feed and can
// be taken back.
export default function HandoutLibrary({ roomCode, handouts, sends, players, gmName, gmId }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openSendId, setOpenSendId] = useState(null);
  const [picked, setPicked] = useState([]);

  const list = Object.entries(handouts || {}).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
  const sentList = Object.entries(sends || {}).sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
  const playerList = Object.entries(players || {}).filter(([, p]) => p.role === 'oyuncu');

  const libraryPath = `rooms/${roomCode}/settings/handouts`;
  const sendsPath = `rooms/${roomCode}/handoutSends`;

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    push(ref(db, libraryPath), {
      title: trimmed,
      text: text.trim(),
      imageUrl: imageUrl.trim(),
      at: Date.now(),
    });
    setTitle('');
    setText('');
    setImageUrl('');
  }

  function openSendPanel(id) {
    setOpenSendId(openSendId === id ? null : id);
    setPicked([]);
  }

  function togglePicked(id) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function send(id, handout, recipients) {
    const payload = buildSendPayload(id, handout, recipients, gmName);
    if (!payload) return;
    push(ref(db, sendsPath), payload);
    setOpenSendId(null);
    setPicked([]);
  }

  return (
    <div className="gm-section">
      <h3 className="title-font gm-section-title">Belge Kütüphanesi</h3>
      <p className="muted small-hint">
        Mektup, not, gazete kupürü, harita parçası... Önceden hazırlarsın, oyun sırasında herkese
        ya da seçtiğin oyunculara gönderirsin. Gönderilen belge o kişinin sohbet akışına kart
        olarak düşer; istersen geri alabilirsin.
      </p>

      <div className="inline-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Belge başlığı" />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Görsel URL (opsiyonel)"
        />
        <FileUploadButton
          roomCode={roomCode}
          folder="handout"
          accept="image/*"
          onUploaded={setImageUrl}
        />
      </div>
      <textarea
        className="handout-text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Belge metni (opsiyonel)"
      />
      <button type="button" className="btn-primary small" onClick={save}>
        💾 Kaydet
      </button>

      {list.map(([id, h]) => (
        <div key={id} className="handout-row">
          <div className="handout-row-head">
            <span className="handout-row-title">📜 {h.title}</span>
            <button type="button" className="btn-ghost small" onClick={() => openSendPanel(id)}>
              📤 Gönder
            </button>
            <button
              type="button"
              className="btn-ghost small danger"
              onClick={() => {
                if (window.confirm(`"${h.title}" kütüphaneden silinsin mi? Gönderilmiş kopyalar kalır.`)) {
                  trackedRemove(roomCode, { id: gmId, name: gmName }, {
                    path: `settings/handouts/${id}`,
                    label: `Belge silindi: ${h.title}`,
                  });
                }
              }}
            >
              Sil
            </button>
          </div>
          {openSendId === id && (
            <div className="handout-send-panel">
              <button
                type="button"
                className="btn-ghost small"
                onClick={() => send(id, h, 'all')}
              >
                📢 Herkese gönder
              </button>
              {playerList.length > 0 && (
                <>
                  <div className="handout-recipients">
                    {playerList.map(([pid, p]) => (
                      <label key={pid} className="pick-list-option">
                        <input
                          type="checkbox"
                          checked={picked.includes(pid)}
                          onChange={() => togglePicked(pid)}
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-primary small"
                    disabled={picked.length === 0}
                    onClick={() => send(id, h, picked)}
                  >
                    🔒 Seçilenlere gönder
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {sentList.length > 0 && (
        <details className="library-folder">
          <summary>
            📤 Gönderilenler <span className="muted">({sentList.length})</span>
          </summary>
          <div className="sfx-library">
            {sentList.map(([sendId, s]) => (
              <div key={sendId} className="saved-scene-item">
                <span className="handout-sent-label">
                  {s.title} → {recipientLabel(s, players)}
                </span>
                <button
                  type="button"
                  className="btn-ghost small danger"
                  onClick={() =>
                    trackedRemove(roomCode, { id: gmId, name: gmName }, {
                      path: `handoutSends/${sendId}`,
                      label: `Belge geri alındı: ${s.title}`,
                    })
                  }
                  title="Alıcılardan geri al"
                >
                  Geri Al
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
