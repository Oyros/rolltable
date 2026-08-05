import { useState } from 'react';

const MIN_WIDTH = 200;

// Two 280px sidebars eat 40% of a 1366px laptop screen, so start narrower
// there. Only affects the first visit — after that the dragged width wins.
function defaultWidth() {
  return window.innerWidth <= 1500 ? 230 : 280;
}

function maxWidth() {
  return Math.max(MIN_WIDTH, Math.round(window.innerWidth * 0.4));
}

function clampWidth(value) {
  return Math.min(Math.max(value, MIN_WIDTH), maxWidth());
}

function loadWidth(storageKey) {
  const raw = localStorage.getItem(storageKey);
  const parsed = raw ? parseInt(raw, 10) : defaultWidth();
  return clampWidth(Number.isFinite(parsed) ? parsed : defaultWidth());
}

// Sidebar whose width the player can drag, mirroring the camera strip's
// resize handle. The grip sits on the inner edge (facing the play area) and is
// a flex sibling of the scrolling content, so it stays put as the panel
// scrolls rather than sliding away with it.
export default function ResizableSidebar({ side, storageKey, children }) {
  const [width, setWidth] = useState(() => loadWidth(storageKey));

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    let latest = startWidth;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      // The left panel grows as the grip moves right; the right one grows as
      // it moves left.
      latest = clampWidth(side === 'left' ? startWidth + delta : startWidth - delta);
      setWidth(latest);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      localStorage.setItem(storageKey, String(latest));
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const grip = (
    <div
      className="sidebar-resizer"
      onPointerDown={startResize}
      title="Genişliği ayarlamak için sağa/sola sürükle"
    />
  );

  return (
    <aside className="room-sidebar" style={{ width, flexBasis: width }}>
      {side === 'right' && grip}
      <div className="room-sidebar-content">{children}</div>
      {side === 'left' && grip}
    </aside>
  );
}
