import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../motion';

const COUNT_MS = 1100;
const OPEN_MS = 1100;

/**
 * Opening curtain: a count to 100 draws a horizon line across the screen,
 * then the two halves part to reveal the hero. Skipped under reduced motion.
 */
const Intro = () => {
  const [phase, setPhase] = useState<'count' | 'open' | 'done'>(() =>
    prefersReducedMotion() ? 'done' : 'count'
  );
  const [n, setN] = useState(0);

  useEffect(() => {
    if (phase !== 'count') return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / COUNT_MS);
      setN(Math.round((1 - Math.pow(1 - k, 3)) * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setPhase('open');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open') return;
    const id = window.setTimeout(() => setPhase('done'), OPEN_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div className={`intro ${phase === 'open' ? 'is-open' : ''}`} aria-hidden>
      <div className="intro-half intro-top" />
      <div className="intro-half intro-bottom" />
      <div className="intro-line" style={{ transform: `scaleX(${n / 100})` }} />
      <div className="intro-mark">
        <span>David San Kim</span>
        <span className="t-mono">{String(n).padStart(3, '0')}</span>
      </div>
    </div>
  );
};

export default Intro;
