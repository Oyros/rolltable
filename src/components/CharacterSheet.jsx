import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

export default function CharacterSheet({ roomCode, playerId, player, gameConfig }) {
  const path = `rooms/${roomCode}/players/${playerId}`;
  const [newItem, setNewItem] = useState('');
  const [catalogItemId, setCatalogItemId] = useState('');
  const [skillsDraft, setSkillsDraft] = useState(player.skills || '');
  const [portraitDraft, setPortraitDraft] = useState(player.portraitUrl || '');

  const stats = gameConfig.stats || [];
  const races = gameConfig.races || [];
  const classes = gameConfig.classes || [];
  const subclasses = gameConfig.subclasses || [];
  const traits = gameConfig.traits || [];
  const perks = gameConfig.perks || [];
  const items = gameConfig.items || [];

  function patch(data) {
    update(ref(db, path), data);
  }

  function commitPortrait() {
    if (portraitDraft !== player.portraitUrl) patch({ portraitUrl: portraitDraft });
  }

  function changeStat(statId, delta) {
    const current = player.stats?.[statId] ?? 2;
    const next = Math.min(10, Math.max(0, current + delta));
    patch({ [`stats/${statId}`]: next });
  }

  function changeStatus(e) {
    patch({ status: e.target.value });
  }

  function commitSkills() {
    if (skillsDraft !== player.skills) patch({ skills: skillsDraft });
  }

  function addItem() {
    if (!newItem.trim()) return;
    patch({ inventory: [...(player.inventory || []), newItem.trim()] });
    setNewItem('');
  }

  function addCatalogItem() {
    if (!catalogItemId) return;
    const item = items.find((i) => i.id === catalogItemId);
    if (!item) return;
    patch({ inventory: [...(player.inventory || []), item.name] });
    setCatalogItemId('');
  }

  function removeItem(index) {
    patch({ inventory: (player.inventory || []).filter((_, i) => i !== index) });
  }

  function toggleInList(field, id) {
    const current = player[field] || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    patch({ [field]: next });
  }

  const selectedRace = races.find((r) => r.id === player.raceId);
  const selectedClass = classes.find((c) => c.id === player.classId);
  const selectedSubclass = subclasses.find((s) => s.id === player.subclassId);

  const selectedTraits = traits.filter((t) => (player.traits || []).includes(t.id));
  const selectedPerks = perks.filter((p) => (player.perks || []).includes(p.id));
  const selectedCatalogItem = items.find((i) => i.id === catalogItemId);

  return (
    <div className="panel character-sheet">
      <h2 className="title-font">{player.name}</h2>

      <div className="portrait-field">
        {portraitDraft && (
          <img className="portrait-preview" src={portraitDraft} alt={player.name} />
        )}
        <label>
          Karakter Görseli (URL)
          <input
            value={portraitDraft}
            onChange={(e) => setPortraitDraft(e.target.value)}
            onBlur={commitPortrait}
            placeholder="https://..."
          />
        </label>
        <label className="color-field">
          Profil Rengi
          <input
            type="color"
            value={player.color || '#cf9a3f'}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </label>
      </div>

      {(races.length > 0 || classes.length > 0 || subclasses.length > 0) && (
        <div className="rcs-grid">
          {races.length > 0 && (
            <label>
              Irk
              <select value={player.raceId || ''} onChange={(e) => patch({ raceId: e.target.value })}>
                <option value="">Seç...</option>
                {races.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {classes.length > 0 && (
            <label>
              Sınıf
              <select
                value={player.classId || ''}
                onChange={(e) => patch({ classId: e.target.value })}
              >
                <option value="">Seç...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {subclasses.length > 0 && (
            <label>
              Alt Sınıf
              <select
                value={player.subclassId || ''}
                onChange={(e) => patch({ subclassId: e.target.value })}
              >
                <option value="">Seç...</option>
                {subclasses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {(selectedRace?.description || selectedClass?.description || selectedSubclass?.description) && (
        <div className="rcs-descriptions">
          {selectedRace?.description && (
            <p>
              <strong>{selectedRace.name}:</strong> {selectedRace.description}
            </p>
          )}
          {selectedClass?.description && (
            <p>
              <strong>{selectedClass.name}:</strong> {selectedClass.description}
            </p>
          )}
          {selectedSubclass?.description && (
            <p>
              <strong>{selectedSubclass.name}:</strong> {selectedSubclass.description}
            </p>
          )}
        </div>
      )}

      {stats.length > 0 && (
        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-box" key={stat.id}>
              <span className="stat-label">{stat.name}</span>
              <div className="stat-control">
                <button type="button" onClick={() => changeStat(stat.id, -1)}>
                  -
                </button>
                <span className="stat-value">{player.stats?.[stat.id] ?? 2}</span>
                <button type="button" onClick={() => changeStat(stat.id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="status-select">
        Durum
        <select value={player.status || 'iyi'} onChange={changeStatus}>
          <option value="iyi">İyi</option>
          <option value="yarali">Yaralı</option>
          <option value="bitkin">Bitkin</option>
          <option value="olu">Ölü</option>
        </select>
      </label>

      {traits.length > 0 && (
        <div className="pick-list">
          <span className="pick-list-label">Traitler</span>
          <div className="pick-list-options">
            {traits.map((t) => (
              <label key={t.id} className="pick-list-option">
                <input
                  type="checkbox"
                  checked={(player.traits || []).includes(t.id)}
                  onChange={() => toggleInList('traits', t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
          {selectedTraits.some((t) => t.description) && (
            <div className="rcs-descriptions">
              {selectedTraits.map(
                (t) =>
                  t.description && (
                    <p key={t.id}>
                      <strong>{t.name}:</strong> {t.description}
                    </p>
                  )
              )}
            </div>
          )}
        </div>
      )}

      {perks.length > 0 && (
        <div className="pick-list">
          <span className="pick-list-label">Perkler</span>
          <div className="pick-list-options">
            {perks.map((p) => (
              <label key={p.id} className="pick-list-option">
                <input
                  type="checkbox"
                  checked={(player.perks || []).includes(p.id)}
                  onChange={() => toggleInList('perks', p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
          {selectedPerks.some((p) => p.description) && (
            <div className="rcs-descriptions">
              {selectedPerks.map(
                (p) =>
                  p.description && (
                    <p key={p.id}>
                      <strong>{p.name}:</strong> {p.description}
                    </p>
                  )
              )}
            </div>
          )}
        </div>
      )}

      <label className="skills-field">
        Yetenek / Dal
        <textarea
          value={skillsDraft}
          onChange={(e) => setSkillsDraft(e.target.value)}
          onBlur={commitSkills}
          rows={4}
          placeholder="Karakterinin yetenek ve dal metnini yaz..."
        />
      </label>

      <div className="inventory">
        <span>Envanter</span>
        <ul>
          {(player.inventory || []).map((item, i) => (
            <li key={i}>
              <span>{item}</span>
              <button type="button" className="btn-ghost small" onClick={() => removeItem(i)}>
                Sil
              </button>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <>
            <div className="inventory-add">
              <select value={catalogItemId} onChange={(e) => setCatalogItemId(e.target.value)}>
                <option value="">Eşya seç...</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-primary small" onClick={addCatalogItem}>
                Ekle
              </button>
            </div>
            {selectedCatalogItem?.description && (
              <div className="rcs-descriptions">
                <p>
                  <strong>{selectedCatalogItem.name}:</strong> {selectedCatalogItem.description}
                </p>
              </div>
            )}
          </>
        )}

        <div className="inventory-add">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Özel eşya..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <button type="button" className="btn-primary small" onClick={addItem}>
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
