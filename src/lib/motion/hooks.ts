import { useEffect, useRef, useState } from 'react';

import { clamp01, prefersReducedMotion } from './reducedMotion';

/**
 * Sets a CSS variable on the element from scroll position, at most once per
 * frame. `compute` receives the element and returns the value; CSS does the rest.
 */
export function useScrollVar<T extends HTMLElement>(
  name: `--${string}`,
  compute: (el: T) => number
) {
  const ref = useRef<T | null>(null);
  const latest = useRef(compute);
  latest.current = compute;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty(name, latest.current(el).toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [name]);

  return ref;
}

/**
 * Drives word-by-word lighting: sets --prog (0 → 1) on the element as it scrolls
 * through the viewport. The component renders each word as a .w span with its
 * index in --wi and the total in --n.
 */
export function useWordScrub<T extends HTMLElement>() {
  return useScrollVar<T>('--prog', (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.88;
    const end = vh * 0.64;
    return clamp01((start - r.top) / (r.height + start - end));
  });
}

/** Counts a figure like "$50K" or "3+" up from zero the first time it is seen. */
export function useCountUp(value: string, duration = 1600) {
  const ref = useRef<HTMLElement | null>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const parts = /^(\D*)(\d+)(.*)$/.exec(value);
    if (!el || !parts || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setText(value);
      return;
    }
    const [, prefix, digits, suffix] = parts;
    const target = Number(digits);
    let raf = 0;
    setText(`${prefix}0${suffix}`);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - k, 4);
          setText(`${prefix}${Math.round(target * eased)}${suffix}`);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return { ref, text };
}
