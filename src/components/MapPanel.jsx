import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import { resolveQueueEntity } from '../utils/initiativeEntity.js';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
// Past this much pointer travel a press counts as a pan, not a pin drop.
const PAN_THRESHOLD_PX = 4;

export default function MapPanel({
  roomCode,
  scene,
  isGM,
  name,
  playerId,
  pinColor,
  canPin,
  players,
  savedFocuses,
  initiativeQueue,
  onClose,
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragToken, setDragToken] = useState(null); // { id, x, y } while dragging

  const canvasRef = useRef(null);
  const panStartRef = useRef(null);
  // Set when a press turned into a pan, so the click that follows doesn't
  // also drop a pin.
  const suppressClickRef = useRef(false);

  function changeZoom(delta) {
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(current + delta).toFixed(2)));
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetView() {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }

  function startPan(e) {
    if (e.button !== 0 || zoom === MIN_ZOOM) return;
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, moved: false };

    const onMove = (moveEvent) => {
      const start = panStartRef.current;
      if (!start) return;
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      if (!start.moved && Math.hypot(dx, dy) > PAN_THRESHOLD_PX) start.moved = true;
      if (start.moved) setPan({ x: start.panX + dx, y: start.panY + dy });
    };
    const onUp = () => {
      suppressClickRef.current = !!panStartRef.current?.moved;
      panStartRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // Pins and tokens are stored as percentages of the map canvas. Measuring the
  // canvas (not the viewport) keeps that maths correct at any zoom or pan,
  // because getBoundingClientRect() already accounts for the transform.
  function canvasPercent(clientX, clientY) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }

  function handleMapClick(e) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!canPin) return;
    const point = canvasPercent(e.clientX, e.clientY);
    if (!point) return;
    push(ref(db, `rooms/${roomCode}/scene/mapPins`), {
      x: point.x,
      y: point.y,
      by: name || '',
      byId: playerId || '',
      color: pinColor || '',
      gm: !!isGM,
    });
  }

  function removePin(pinId, pin, e) {
    e.stopPropagation();
    if (!isGM && pin.byId !== playerId) return;
    remove(ref(db, `rooms/${roomCode}/scene/mapPins/${pinId}`));
  }

  // GM auto-places a token for anyone in the initiative queue who doesn't
  // have one yet, scattered along the bottom edge — GM drags from there.
  useEffect(() => {
    if (!isGM) return;
    const queue = initiativeQueue || [];
    const existing = scene?.mapTokens || {};
    const payload = {};
    queue.forEach((id, i) => {
      if (existing[id]) return;
      payload[id] = { x: 8 + i * (84 / Math.max(queue.length - 1, 1)), y: 88 };
    });
    if (Object.keys(payload).length > 0) {
      update(ref(db, `rooms/${roomCode}/scene/mapTokens`), payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGM, roomCode, initiativeQueue, scene?.mapTokens]);

  function handleTokenPointerDown(id, e) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const token = scene?.mapTokens?.[id];
    setDragToken({ id, x: token?.x ?? 50, y: token?.y ?? 50 });
  }

  function handleTokenPointerMove(e) {
    if (!dragToken) return;
    const point = canvasPercent(e.clientX, e.clientY);
    if (!point) return;
    setDragToken((d) =>
      d
        ? {
            ...d,
            x: Math.min(100, Math.max(0, point.x)),
            y: Math.min(100, Math.max(0, point.y)),
          }
        : d
    );
  }

  function handleTokenPointerUp() {
    if (!dragToken) return;
    update(ref(db, `rooms/${roomCode}/scene/mapTokens/${dragToken.id}`), {
      x: dragToken.x,
      y: dragToken.y,
    });
    setDragToken(null);
  }

  if (!scene?.mapImageUrl) return null;

  return (
    <div className="map-panel panel">
      <div className="map-panel-bar">
        <span className="map-panel-title">🗺️ Harita</span>
        <div className="map-panel-zoom">
          <button type="button" className="btn-ghost small" onClick={() => changeZoom(-ZOOM_STEP)} title="Uzaklaştır">
            ➖
          </button>
          <span className="map-zoom-level">{Math.round(zoom * 100)}%</span>
          <button type="button" className="btn-ghost small" onClick={() => changeZoom(ZOOM_STEP)} title="Yakınlaştır">
            ➕
          </button>
          <button type="button" className="btn-ghost small" onClick={resetView} title="Sıfırla">
            ⟲
          </button>
        </div>
        <button type="button" className="btn-ghost small" onClick={onClose} title="Kapat">
          ✕
        </button>
      </div>

      <div className={`map-viewport${zoom > MIN_ZOOM ? ' pannable' : ''}`}>
        <div
          className={`map-canvas${canPin ? ' map-pin-area' : ''}`}
          ref={canvasRef}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          onClick={handleMapClick}
          onPointerDown={startPan}
        >
          <img src={scene.mapImageUrl} alt="Harita" draggable={false} />
          {(initiativeQueue || []).map((id) => {
            const entity = resolveQueueEntity(id, players, savedFocuses);
            if (!entity) return null;
            const stored = scene.mapTokens?.[id];
            const dragging = dragToken?.id === id;
            if (!dragging && !stored) return null;
            const x = dragging ? dragToken.x : stored.x;
            const y = dragging ? dragToken.y : stored.y;
            return (
              <div
                key={`token-${id}`}
                className={`map-token${entity.isNpc ? ' enemy' : ''}${isGM ? ' draggable' : ''}${dragging ? ' dragging' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  borderColor: entity.isNpc ? undefined : entity.color || 'var(--amber)',
                  // Counter-scale so tokens keep a constant on-screen size.
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                }}
                title={entity.name}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={isGM ? (e) => handleTokenPointerDown(id, e) : undefined}
                onPointerMove={isGM ? handleTokenPointerMove : undefined}
                onPointerUp={isGM ? handleTokenPointerUp : undefined}
              >
                {entity.imageUrl ? (
                  <img src={entity.imageUrl} alt={entity.name} />
                ) : (
                  <span className="map-token-fallback">
                    {entity.isNpc ? '⚔️' : (entity.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
          {Object.entries(scene.mapPins || {}).map(([id, pin]) => {
            const canRemove = isGM || pin.byId === playerId;
            const label = pin.by
              ? `${pin.by} bıraktı${canRemove ? ' — kaldırmak için tıkla' : ''}`
              : 'Kaldırmak için tıkla';

            if (pin.gm) {
              return (
                <button
                  key={id}
                  type="button"
                  className={`map-pin map-pin-emoji${canRemove ? '' : ' map-pin-locked'}`}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: `translate(-50%, -100%) scale(${1 / zoom})`,
                  }}
                  title={label}
                  onClick={(e) => removePin(id, pin, e)}
                >
                  📍
                </button>
              );
            }

            return (
              <button
                key={id}
                type="button"
                className={`map-pin map-pin-marker${canRemove ? '' : ' map-pin-locked'}`}
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  background: pin.color || 'var(--amber)',
                  transform: `translate(-50%, -100%) rotate(-45deg) scale(${1 / zoom})`,
                }}
                title={label}
                onClick={(e) => removePin(id, pin, e)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
