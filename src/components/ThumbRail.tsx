import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { cssVars } from '../lib/cssVars';
import { glideTo } from '../lib/motion';

export type RailStop = {
  /** Id of the element on the page this stop jumps to. */
  id: string;
  /** One or two characters shown on the rail itself. */
  mark: string;
  label: string;
  meta?: string;
};

type Props = {
  /** Accessible name for the rail, e.g. "Jump to a section". */
  label: string;
  /** Shown once, the first time the rail appears, so people know they can slide it. */
  hint: string;
  /** In page order. The rail is on screen while any of them is passing mid-viewport. */
  stops: RailStop[];
};

/** Room left under the fixed nav when a stop lands at the top of the screen. */
const NAV_CLEARANCE = 72;
/** How long scroll tracking stays quiet after a jump, so the glide doesn't fight the thumb. */
const SETTLE_MS = 900;
const HINT_MS = 2800;
/** How far, in pixels, the bulge under the thumb spreads along the rail. */
const WAVE_SPREAD = 46;

/**
 * A thumb rail for long pages on phones: a column of initials on the screen
 * edge. Slide a thumb along it and the page jumps from stop to stop, the
 * initials bulge toward the finger and a label names the one underneath it.
 * Each stop is also a plain button, so taps, keyboards and screen readers work.
 */
export function ThumbRail({ label, hint, stops }: Props) {
  const [onScreen, setOnScreen] = useState(false);
  const [active, setActive] = useState(0);
  const [touching, setTouching] = useState(false);
  const [hinting, setHinting] = useState(false);

  const track = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const quietUntil = useRef(0);
  const hintShown = useRef(false);

  // Show the rail only while one of its stops is passing the middle of the screen.
  useEffect(() => {
    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setOnScreen(inView.size > 0);
      },
      { rootMargin: '-38% 0px -38% 0px' }
    );
    for (const stop of stops) {
      const el = document.getElementById(stop.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [stops]);

  // Follow ordinary scrolling: the stop crossing the reading line becomes current.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (performance.now() < quietUntil.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stops.findIndex((s) => s.id === entry.target.id);
          if (index >= 0) {
            current.current = index;
            setActive(index);
          }
        }
      },
      { rootMargin: '-45% 0px -54% 0px' }
    );
    for (const stop of stops) {
      const el = document.getElementById(stop.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [stops]);

  // Say what the rail is for, once.
  useEffect(() => {
    if (!onScreen || hintShown.current) return;
    hintShown.current = true;
    setHinting(true);
    const timer = window.setTimeout(() => setHinting(false), HINT_MS);
    return () => window.clearTimeout(timer);
  }, [onScreen]);

  const jump = useCallback(
    (index: number) => {
      const target = document.getElementById(stops[index].id);
      const last = document.getElementById(stops[stops.length - 1].id);
      if (!target || !last) return;
      quietUntil.current = performance.now() + SETTLE_MS;
      current.current = index;
      setActive(index);
      setHinting(false);
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_CLEARANCE;
      // Never scroll so far that the last stop, and the rail with it, leaves the screen.
      const lowest =
        last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.66;
      glideTo(Math.max(0, Math.min(top, lowest)), 0.5);
    },
    [stops]
  );

  /** Bulges the initials toward the thumb; pass null to let them settle. */
  const wave = (clientY: number | null) => {
    const marks = track.current?.querySelectorAll<HTMLElement>('[data-stop]');
    if (!marks) return;
    for (const mark of marks) {
      if (clientY === null) {
        mark.style.removeProperty('--lift');
        continue;
      }
      const box = mark.getBoundingClientRect();
      const distance = (clientY - (box.top + box.height / 2)) / WAVE_SPREAD;
      mark.style.setProperty('--lift', Math.exp(-distance * distance).toFixed(3));
    }
  };

  const follow = (clientY: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return;
    const at = Math.floor(((clientY - box.top) / box.height) * stops.length);
    const index = Math.max(0, Math.min(stops.length - 1, at));
    wave(clientY);
    if (index === current.current) return;
    jump(index);
    navigator.vibrate?.(6);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // The pointer was already released; the slide still works without capture.
    }
    setTouching(true);
    setHinting(false);
    follow(e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (touching) follow(e.clientY);
  };
  const release = () => {
    setTouching(false);
    wave(null);
  };

  const at = Math.min(active, stops.length - 1);
  const stop = stops[at];
  if (!stop) return null;

  return createPortal(
    <nav
      className="thumb-rail"
      aria-label={label}
      data-on={onScreen || touching ? '' : undefined}
      data-touching={touching ? '' : undefined}
      style={cssVars({ '--n': stops.length, '--at': at })}
    >
      <div
        ref={track}
        className="thumb-rail-track"
        // Keeps the smooth scroller from treating a slide along the rail as a page scroll.
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {stops.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="thumb-rail-stop"
            data-stop
            aria-current={i === at ? 'true' : undefined}
            aria-label={s.meta ? `${s.label}, ${s.meta}` : s.label}
            onClick={() => jump(i)}
          >
            <span aria-hidden>{s.mark}</span>
          </button>
        ))}
      </div>
      <div
        className="thumb-rail-bubble"
        aria-hidden
        data-show={touching || hinting ? '' : undefined}
      >
        {hinting && !touching ? (
          <span>{hint}</span>
        ) : (
          <>
            <b>{stop.label}</b>
            {stop.meta && <span>{stop.meta}</span>}
          </>
        )}
      </div>
    </nav>,
    document.body
  );
}
