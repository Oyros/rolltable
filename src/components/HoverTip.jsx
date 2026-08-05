import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Portal from './Portal.jsx';

const GAP = 10;
const MARGIN = 8;

// Themed replacement for the browser's native title tooltip. The bubble is
// rendered through a portal with fixed positioning, so the scrolling sidebar
// can't clip it the way an absolutely positioned child would.
export default function HoverTip({ content, children, className, wrapperTag = 'span' }) {
  const [anchorRect, setAnchorRect] = useState(null);
  const [box, setBox] = useState(null);
  const tipRef = useRef(null);
  const Tag = wrapperTag;

  useLayoutEffect(() => {
    if (!anchorRect || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    let left = anchorRect.left + anchorRect.width / 2 - tip.width / 2;
    left = Math.min(Math.max(MARGIN, left), window.innerWidth - tip.width - MARGIN);
    let top = anchorRect.top - tip.height - GAP;
    let placement = 'top';
    // Not enough room above — flip under the anchor.
    if (top < MARGIN) {
      top = anchorRect.bottom + GAP;
      placement = 'bottom';
    }
    // Keep the caret pointing at the anchor even when the bubble had to be
    // pushed sideways to stay on screen.
    const arrow = Math.min(
      Math.max(12, anchorRect.left + anchorRect.width / 2 - left),
      tip.width - 12
    );
    setBox({ left, top, placement, arrow });
  }, [anchorRect]);

  // The anchor moves with the panel, so anything that scrolls closes the tip
  // rather than leaving it stranded.
  useEffect(() => {
    if (!anchorRect) return undefined;
    const close = () => setAnchorRect(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [anchorRect]);

  function open(e) {
    setBox(null);
    setAnchorRect(e.currentTarget.getBoundingClientRect());
  }

  function close() {
    setAnchorRect(null);
    setBox(null);
  }

  if (!content) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag
      className={className}
      onPointerEnter={open}
      onPointerLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {anchorRect && (
        <Portal>
          <div
            ref={tipRef}
            className="hover-tip"
            role="tooltip"
            data-placement={box?.placement || 'top'}
            style={{
              left: box ? `${box.left}px` : '0px',
              top: box ? `${box.top}px` : '0px',
              opacity: box ? 1 : 0,
              '--tip-arrow': box ? `${box.arrow}px` : '50%',
            }}
          >
            {content}
          </div>
        </Portal>
      )}
    </Tag>
  );
}
