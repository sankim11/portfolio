import Lenis from 'lenis';

import { clamp01, prefersReducedMotion } from './reducedMotion';

/** The shared smooth scroller, so dialogs can pause it. Null under reduced motion. */
export const scroller: { lenis: Lenis | null } = { lenis: null };

/** Room left for the fixed nav when gliding to a section. */
const ANCHOR_OFFSET = -72;

/**
 * One frame loop for everything scroll- and pointer-driven:
 *  - inertial smooth scrolling (Lenis), with in-page anchors eased
 *  - --s on [data-scrub] (0 → 1 as the element enters) and [data-through]
 *    (0 → 1 as the reading line passes through it)
 *  - --v on <html>: signed scroll velocity, -1 … 1
 *  - the pointer light, and [data-magnet] buttons
 *
 * Does nothing under reduced motion; CSS falls back to the resting state.
 * Returns a cleanup function.
 */
export function initScrollEngine(): () => void {
  if (prefersReducedMotion()) return () => {};

  const root = document.documentElement;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  scroller.lenis = lenis;

  const scrubbed = Array.from(
    document.querySelectorAll<HTMLElement>('[data-scrub], [data-through]')
  );
  const light = document.querySelector<HTMLElement>('.pointer-light');

  let dirty = true;
  let velocity = 0;
  let raf = 0;
  const pointer = { x: 0, y: 0, lx: 0, ly: 0, seen: false };

  const updateScrub = () => {
    const vh = window.innerHeight;
    for (const el of scrubbed) {
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
    velocity += (target - velocity) * 0.12;
    root.style.setProperty('--v', Math.abs(velocity) < 0.001 ? '0' : velocity.toFixed(3));
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

  const markDirty = () => {
    dirty = true;
  };
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
    const target = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!target) return;
    const id = (target.getAttribute('href') ?? '').slice(1);
    const dest = id === 'top' || id === '' ? 0 : document.getElementById(id);
    if (dest === null) return;
    e.preventDefault();
    lenis.scrollTo(dest, { offset: ANCHOR_OFFSET, duration: 1.6 });
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
