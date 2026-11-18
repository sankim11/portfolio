import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from '../lib/motion';

/**
 * Stacked ridgelines rising from the bottom of the hero stage — the layers of a
 * stack, drawn with hidden-line occlusion. Leans toward the pointer; a single
 * still frame under reduced motion.
 */
type Props = {
  /** Ridges rise from a flat line the first time the field is seen. */
  intro?: boolean;
  /** Milliseconds to hold flat before rising (lets the opening curtain part first). */
  delay?: number;
  /** Spread and swell the ridges as the page scrolls, as if flying into them. */
  dive?: boolean;
  /** Where the first ridge sits, as a fraction of the height. */
  top?: number;
};

const LayerField = ({ intro = false, delay = 0, dive = false, top: topFactor }: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let fill = '#0d0d0d';
    let stroke = '#bcc0ca';
    let peak = '#f5f5f5';
    const pointer = { x: -9999, y: -9999, k: 0 };
    const t0 = performance.now();
    let born = -1;

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      fill = s.getPropertyValue('--surface-1').trim() || fill;
      stroke = s.getPropertyValue('--chrome-2').trim() || stroke;
      peak = s.getPropertyValue('--text').trim() || peak;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const t = (time - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const lines = w < 640 ? 22 : 34;
      const top = h * (topFactor ?? (w < 640 ? 0.7 : 0.56));
      if (born < 0) born = time;
      const k = Math.min(1, Math.max(0, (time - born - delay) / 2800));
      const rise = intro && !reduced ? 1 - Math.pow(1 - k, 4) : 1;
      const p = dive && !reduced ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      const bottom = h * (1.04 + 0.7 * p);
      const gap = (bottom - top) / (lines - 1);
      const step = w < 640 ? 5 : 6;
      pointer.k += ((pointer.x > -999 ? 1 : 0) - pointer.k) * 0.06;

      for (let i = 0; i < lines; i++) {
        const y0 = top + i * gap;
        const depth = i / (lines - 1);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + step; x += step) {
          const nx = x / w;
          // Two ridges either side of centre, leaving a valley under the copy.
          const env =
            Math.exp(-Math.pow((nx - 0.16) / 0.15, 2)) +
            0.85 * Math.exp(-Math.pow((nx - 0.84) / 0.15, 2)) +
            0.06;
          const n =
            Math.sin(nx * 7.0 + t * 0.32 + i * 0.41) * 0.5 +
            Math.sin(nx * 15.0 - t * 0.21 + i * 0.23) * 0.22 +
            Math.sin(nx * 2.6 + t * 0.12 + i * 0.73) * 0.55;
          const dx = x - pointer.x;
          const dy = y0 - pointer.y;
          const lift =
            pointer.k * Math.exp(-(dx * dx + dy * dy) / (2 * 150 * 150)) * 1.4;
          const amp = gap * (0.6 + 4.2 * env + 3 * lift) * rise * (1 + 1.6 * p);
          const y = y0 - Math.max(0, n * 0.5 + 0.5) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.globalAlpha =
          (0.18 + 0.6 * (1 - Math.abs(depth - 0.35) * 1.4)) * (0.25 + 0.75 * rise);
        ctx.strokeStyle = i === Math.round(lines * 0.35) ? peak : stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    readColors();
    resize();
    if (reduced) draw(t0 + 4000);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      if (reduced) draw(t0 + 4000);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const themeObs = new MutationObserver(() => {
      readColors();
      if (reduced) draw(t0 + 4000);
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const host = canvas.parentElement;
    window.addEventListener('resize', onResize);
    host?.addEventListener('pointermove', onMove);
    host?.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObs.disconnect();
      window.removeEventListener('resize', onResize);
      host?.removeEventListener('pointermove', onMove);
      host?.removeEventListener('pointerleave', onLeave);
    };
  }, [intro, delay, dive, topFactor]);

  return <canvas ref={ref} className="hero-canvas" aria-hidden />;
};

export default LayerField;
