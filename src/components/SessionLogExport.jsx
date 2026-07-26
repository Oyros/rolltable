import { useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase.js';

function timeLabel(at) {
  return new Date(at || 0).toLocaleString('tr-TR');
}

function rollLabel(r) {
  if (r.kind === 'formula') return r.formula;
  if (r.kind === 'fudge') return '4dF';
  const modeLabel = r.mode === 'advantage' ? ' (avantaj)' : r.mode === 'disadvantage' ? ' (dezavantaj)' : '';
  return `d${r.dice}${modeLabel}`;
}

const QUEST_STATUS_LABEL = { active: 'aktif', done: 'tamamlandı', failed: 'süresi doldu' };

export default function SessionLogExport({ roomCode, playerId, isGM }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function exportLog() {
    setBusy(true);
    setError('');
    try {
      const [rollsSnap, questsSnap, chatSnap, playersSnap] = await Promise.all([
        get(ref(db, `rooms/${roomCode}/rolls`)),
        get(ref(db, `rooms/${roomCode}/quests`)),
        get(ref(db, `rooms/${roomCode}/chat`)),
        get(ref(db, `rooms/${roomCode}/players`)),
      ]);

      const lines = [];

      Object.values(rollsSnap.val() || {}).forEach((r) => {
        if (r.hidden && !isGM) return;
        const lock = r.hidden ? '🔒 ' : '';
        lines.push({ at: r.at, text: `🎲 ${lock}${r.roller}: ${rollLabel(r)} → ${r.hidden ? 'gizli' : r.result}` });
      });

      Object.values(questsSnap.val() || {}).forEach((q) => {
        const status = QUEST_STATUS_LABEL[q.status] || q.status;
        lines.push({ at: q.createdAt, text: `📜 Görev eklendi: ${q.title} (şu an: ${status})` });
      });

      Object.values(chatSnap.val() || {}).forEach((m) => {
        lines.push({ at: m.at, text: `💬 ${m.by}${m.isGM ? ' (GM)' : ''}: ${m.text}` });
      });

      const players = playersSnap.val() || {};
      Object.entries(players).forEach(([uid, p]) => {
        if (!isGM && uid !== playerId) return;
        Object.values(p.whispers || {}).forEach((w) => {
          if (!w.system) return;
          lines.push({ at: w.at, text: `${p.name}: ${w.text}` });
        });
      });

      lines.sort((a, b) => (a.at || 0) - (b.at || 0));

      const header = `RollTable Oturum Kaydı — Oda: ${roomCode}\nDışa aktarma zamanı: ${timeLabel(Date.now())}\n${'='.repeat(40)}\n`;
      const body = lines.length
        ? lines.map((l) => `[${timeLabel(l.at)}] ${l.text}`).join('\n')
        : '(Bu oturumda henüz kayıtlı bir olay yok.)';

      const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rolltable-${roomCode}-oturum-kaydi.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Dışa aktarılamadı: ${err.message}`);
    }
    setBusy(false);
  }

  return (
    <div>
      <p className="muted small-hint">
        Zar atışları, sohbet, görevler ve karakter değişiklik kayıtlarını .txt olarak indir.
        {!isGM && ' Sadece kendi kayıtların ve gizli olmayan zarlar dahil edilir.'}
      </p>
      <button type="button" className="btn-primary small" onClick={exportLog} disabled={busy}>
        {busy ? 'Hazırlanıyor...' : '📥 Oturumu Dışa Aktar (.txt)'}
      </button>
      {error && <p className="sound-error">{error}</p>}
    </div>
  );
}
