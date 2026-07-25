import { useEffect, useState } from 'react';

export default function TypewriterText({ text, className, speed = 28 }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    if (!text) return undefined;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  if (!text) return null;
  return <p className={className}>{shown}</p>;
}
