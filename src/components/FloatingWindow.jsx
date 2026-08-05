import { useState } from 'react';

const MIN_W = 260;
const MIN_H = 200;

function clampBox(box) {
  const w = Math.min(Math.max(box.w, MIN_W), window.innerWidth);
  const h = Math.min(Math.max(box.h, MIN_H), window.innerHeight);
  return {
    w,
    h,
    // Always leave a sliver on screen so a window dragged off the edge can
    // still be grabbed back.
    x: Math.min(Math.max(box.x, -w + 80), window.innerWidth - 80),
    y: Math.min(Math.max(box.y, 0), window.innerHeight - 48),
  };
}

function loadBox(storageKey, fallback) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return clampBox(fallback);
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed?.x)) return clampBox(fallback);
    return clampBox(parsed);
  } catch {
    return clampBox(fallback);
  }
}

// Draggable, corner-resizable window used by the map and chat pop-ups. Position
// and size persist per storageKey.
export default function FloatingWindow({
  title,
  storageKey,
  defaultBox,
  className = '',
  barExtra,
  onClose,
  children,
}) {
  const [box, setBox] = useState(() => loadBox(storageKey, defaultBox));

  function beginGesture(e, computeNext) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startBox = box;
    let latest = startBox;

    const onMove = (moveEvent) => {
      latest = clampBox(
        computeNext(startBox, moveEvent.clientX - startX, moveEvent.clientY - startY)
      );
      setBox(latest);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      localStorage.setItem(storageKey, JSON.stringify(latest));
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const startDrag = (e) =>
    beginGesture(e, (start, dx, dy) => ({ ...start, x: start.x + dx, y: start.y + dy }));

  const startResizeRight = (e) =>
    beginGesture(e, (start, dx, dy) => ({ ...start, w: start.w + dx, h: start.h + dy }));

  // Dragging the left grip moves the left edge, so x shifts with the width.
  const startResizeLeft = (e) =>
    beginGesture(e, (start, dx, dy) => ({
      ...start,
      x: start.x + dx,
      w: start.w - dx,
      h: start.h + dy,
    }));

  return (
    <div
      className={`floating-window panel ${className}`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div className="floating-window-bar" onPointerDown={startDrag} title="Taşımak için sürükle">
        <span className="floating-window-title">{title}</span>
        {/* Controls sit inside the drag bar, so they must not start a drag. */}
        <div className="floating-window-actions" onPointerDown={(e) => e.stopPropagation()}>
          {barExtra}
          <button type="button" className="btn-ghost small" onClick={onClose} title="Kapat">
            ✕
          </button>
        </div>
      </div>

      <div className="floating-window-body">{children}</div>

      <div className="floating-resize-grip left" onPointerDown={startResizeLeft} title="Boyutlandır" />
      <div className="floating-resize-grip right" onPointerDown={startResizeRight} title="Boyutlandır" />
    </div>
  );
}
