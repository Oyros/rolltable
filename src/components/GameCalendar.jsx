import { useEffect, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

function normalize(day, hour) {
  let d = day;
  let h = hour;
  while (h >= 24) {
    h -= 24;
    d += 1;
  }
  while (h < 0) {
    h += 24;
    d -= 1;
  }
  return { day: Math.max(1, d), hour: h };
}

export default function GameCalendar({ roomCode, calendar, isGM }) {
  const day = calendar?.day ?? 1;
  const hour = calendar?.hour ?? 8;
  const minute = calendar?.minute ?? 0;

  const [dayDraft, setDayDraft] = useState(day);
  const [hourDraft, setHourDraft] = useState(hour);
  const [minuteDraft, setMinuteDraft] = useState(minute);

  useEffect(() => {
    setDayDraft(day);
    setHourDraft(hour);
    setMinuteDraft(minute);
  }, [day, hour, minute]);

  function commit(next) {
    update(ref(db, `rooms/${roomCode}/settings/calendar`), next);
  }

  function advance(hours) {
    const { day: nd, hour: nh } = normalize(day, hour + hours);
    commit({ day: nd, hour: nh, minute });
  }

  function applyManual() {
    const { day: nd, hour: nh } = normalize(Number(dayDraft) || 1, Number(hourDraft) || 0);
    const nm = Math.min(59, Math.max(0, Number(minuteDraft) || 0));
    commit({ day: nd, hour: nh, minute: nm });
  }

  return (
    <div className="panel calendar-panel">
      <h2 className="title-font">🗓️ Takvim</h2>
      <p className="calendar-display">
        {hour >= 6 && hour < 20 ? '☀️' : '🌙'} Gün {day} · {pad(hour)}:{pad(minute)}
      </p>

      {isGM && (
        <>
          <div className="calendar-buttons">
            <button type="button" className="btn-ghost small" onClick={() => advance(1)}>
              +1 Saat
            </button>
            <button type="button" className="btn-ghost small" onClick={() => advance(6)}>
              +6 Saat
            </button>
            <button type="button" className="btn-ghost small" onClick={() => advance(24)}>
              +1 Gün
            </button>
          </div>
          <div className="calendar-manual">
            <label>
              Gün
              <input
                type="number"
                min={1}
                value={dayDraft}
                onChange={(e) => setDayDraft(e.target.value)}
              />
            </label>
            <label>
              Saat
              <input
                type="number"
                min={0}
                max={23}
                value={hourDraft}
                onChange={(e) => setHourDraft(e.target.value)}
              />
            </label>
            <label>
              Dakika
              <input
                type="number"
                min={0}
                max={59}
                value={minuteDraft}
                onChange={(e) => setMinuteDraft(e.target.value)}
              />
            </label>
            <button type="button" className="btn-primary small" onClick={applyManual}>
              Ayarla
            </button>
          </div>
        </>
      )}
    </div>
  );
}
