import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The shared smooth scroller, so dialogs can pause it. Null under reduced motion. */
export const scroller: { lenis: Lenis | null } = { lenis: null };

/**
 * Marks every [data-reveal] element with data-in once it scrolls into view
 * (optionally staggered by data-i), including elements React mounts later.
 * An attribute, not a class, so React re-renders never wipe it.
 */
export function initReveal() {
  const show = (el: Element) => {
    const i = Number((el as HTMLElement).dataset.i || 0);
    if (i > 0) window.setTimeout(() => el.setAttribute('data-in', ''), i * 90);
    else el.setAttribute('data-in', '');
  };

  const instant = prefersReducedMotion() || !('IntersectionObserver' in window);
  const io = instant
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            show(e.target);
            io!.unobserve(e.target);
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

  const take = (el: Element) => {
    if (io) io.observe(el);
    else el.setAttribute('data-in', '');
  };
  const scan = (root: ParentNode) =>
    root.querySelectorAll('[data-reveal]:not([data-in])').forEach(take);

  scan(document);
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches('[data-reveal]:not([data-in])')) take(n);
        scan(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io?.disconnect();
    mo.disconnect();
  };
}

/**
 * One frame loop for everything scroll- and pointer-driven:
 *  - inertial smooth scrolling (Lenis), with in-page anchors eased
 *  - --s on [data-scrub] (0 → 1 as the element enters) and [data-through]
 *    (0 → 1 as the reading line passes through it)
 *  - --v on <html>: signed scroll velocity, -1 … 1
 *  - the pointer light, and [data-magnet] buttons
 * Does nothing under reduced motion; CSS falls back to the resting state.
 */
export function initScrollEngine() {
  if (prefersReducedMotion()) return () => {};

  const root = document.documentElement;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  scroller.lenis = lenis;

  const scrubEls = Array.from(
    document.querySelectorAll<HTMLElement>('[data-scrub], [data-through]')
  );
  const light = document.querySelector<HTMLElement>('.pointer-light');

  let dirty = true;
  let v = 0;
  let raf = 0;
  const pointer = { x: -1, y: -1, lx: 0, ly: 0, seen: false };

  const updateScrub = () => {
    const vh = window.innerHeight;
    for (const el of scrubEls) {
      const r = el.getBoundingClientRect();
      const s =
        'through' in el.dataset
          ? clamp01((vh * 0.62 - r.top) / r.height)
          : clamp01((vh - r.top) / (vh * 0.5));
      el.style.setProperty('--s', s.toFixed(4));
    }
  };

  const frame = (time: number) => {
    lenis.raf(time);
    const target = Math.max(-1, Math.min(1, lenis.velocity / 45));
    v += (target - v) * 0.12;
    root.style.setProperty('--v', Math.abs(v) < 0.001 ? '0' : v.toFixed(3));
    if (dirty) {
      dirty = false;
      updateScrub();
    }
    if (light && pointer.seen) {
      pointer.lx += (pointer.x - pointer.lx) * 0.1;
      pointer.ly += (pointer.y - pointer.ly) * 0.1;
      light.style.translate = `${pointer.lx.toFixed(1)}px ${pointer.ly.toFixed(1)}px`;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const markDirty = () => (dirty = true);
  lenis.on('scroll', markDirty);
  window.addEventListener('resize', markDirty);

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.seen) {
      pointer.seen = true;
      pointer.lx = pointer.x;
      pointer.ly = pointer.y;
      light?.setAttribute('data-on', '');
    }
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  // In-page anchors glide instead of jumping.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    const dest = id === 'top' || id === '' ? 0 : document.getElementById(id);
    if (dest === null) return;
    e.preventDefault();
    lenis.scrollTo(dest, { offset: -72, duration: 1.6 });
    history.replaceState(null, '', id ? `#${id}` : location.pathname);
  };
  document.addEventListener('click', onClick);

  // Magnetic buttons lean toward the pointer.
  const magnets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnet]'));
  const onMagnetMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.32).toFixed(1)}px`;
  };
  const onMagnetLeave = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).style.translate = '';
  };
  for (const m of magnets) {
    m.addEventListener('pointermove', onMagnetMove);
    m.addEventListener('pointerleave', onMagnetLeave);
  }

  return () => {
    cancelAnimationFrame(raf);
    lenis.destroy();
    scroller.lenis = null;
    window.removeEventListener('resize', markDirty);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('click', onClick);
    for (const m of magnets) {
      m.removeEventListener('pointermove', onMagnetMove);
      m.removeEventListener('pointerleave', onMagnetLeave);
    }
  };
}

/** Sets a CSS variable on the element from scroll position, once per frame. */
export function useScrollVar<T extends HTMLElement>(
  name: string,
  compute: (el: T) => number
) {
  const ref = useRef<T | null>(null);
  const fn = useRef(compute);
  fn.current = compute;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty(name, fn.current(el).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [name]);

  return ref;
}

/**
 * Drives word-by-word lighting: sets --prog (0 → 1) on the element as it scrolls
 * through the viewport. The component renders each word as a .w span with its
 * index in --wi and the total in --n; CSS does the rest.
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
    const m = /^(\D*)(\d+)(.*)$/.exec(value);
    if (!el || !m || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    const [, pre, num, post] = m;
    const target = Number(num);
    let raf = 0;
    setText(`${pre}0${post}`);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - k, 4);
          setText(`${pre}${Math.round(target * eased)}${post}`);
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
