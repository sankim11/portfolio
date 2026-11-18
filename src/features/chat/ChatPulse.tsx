import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from '../../lib/motion';

type Props = {
  /** 0 → 1: how lively the lines are. Eased toward, never jumped to. */
  level: number;
  /** Stops drawing while the panel is closed. */
  active: boolean;
};

const LINES = 6;

/**
 * The assistant's presence: the site's ridgelines, running along the chat
 * header. Calm when idle, swelling while it thinks, rippling while it answers.
 */
const ChatPulse = ({ level, active }: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const target = useRef(level);
  target.current = level;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!active || !canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const css = getComputedStyle(document.documentElement);
    const stroke = css.getPropertyValue('--chrome-2').trim() || '#bcc0ca';
    const fill = css.getPropertyValue('--surface-1').trim() || '#0d0d0d';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const size = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    let raf = 0;
    let t = 0;
    let last = performance.now();
    let current = target.current;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      current += (target.current - current) * 0.06;
      t += dt * (0.5 + current * 2.4);
      ctx.clearRect(0, 0, w, h);
      const top = h * 0.76;
      const gap = (h * 1.14 - top) / (LINES - 1);
      for (let i = 0; i < LINES; i++) {
        const y0 = top + i * gap;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 4; x += 4) {
          const nx = x / w;
          const n =
            Math.sin(nx * 8 + t * 1.1 + i * 0.5) * 0.5 +
            Math.sin(nx * 17 - t * 0.8 + i * 0.3) * 0.25 +
            Math.sin(nx * 3.1 + t * 0.5 + i) * 0.5;
          ctx.lineTo(x, y0 - Math.max(0, n * 0.5 + 0.5) * gap * (0.45 + 1.45 * current));
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.globalAlpha = 0.22 + 0.55 * (1 - i / LINES);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => {
      size();
      if (reduced) draw(performance.now());
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [active]);

  return <canvas ref={ref} className="chat-pulse" aria-hidden />;
};

export default ChatPulse;
