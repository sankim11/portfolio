import { useEffect, useRef, useState } from 'react';

import { hobbies } from '../data/hobbies';
import { prefersReducedMotion } from '../motion';
import { createSculpture, type Sculpture } from '../particleSculpture';

/** How long each pursuit stays up while the tabs cycle on their own. */
const CYCLE_MS = 5200;

const OffHours = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const sculptureRef = useRef<Sculpture | null>(null);
  const [activeId, setActiveId] = useState<string>(hobbies[0].id);
  // When the tabs don't all fit (phones), they cycle on their own so it is
  // obvious there are more, until the visitor touches the tabs or the sculpture.
  const [auto, setAuto] = useState(true);
  const [overflows, setOverflows] = useState(false);
  const cycling = auto && overflows && !prefersReducedMotion();

  const active = hobbies.find((h) => h.id === activeId) || hobbies[0];

  // The particle sculpture lives for as long as the section does.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sculpture = createSculpture(canvas, {
      initial: hobbies[0].id,
      onGrab: () => setAuto(false),
    });
    sculptureRef.current = sculpture;
    return () => {
      sculpture?.dispose();
      sculptureRef.current = null;
    };
  }, []);

  // Re-form the sculpture whenever the pursuit changes.
  useEffect(() => {
    sculptureRef.current?.setShape(activeId);
  }, [activeId]);

  // Track whether the tab strip overflows, and which edges hide more tabs.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      setOverflows(max > 4);
      strip.toggleAttribute('data-more-start', strip.scrollLeft > 4);
      strip.toggleAttribute('data-more-end', strip.scrollLeft < max - 4);
    };
    update();
    strip.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(strip);
    return () => {
      strip.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  // Keep the selected tab centred in the strip. Scrolls the strip only, never the page.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !tab) return;
    strip.scrollTo({
      left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activeId]);

  // Step to the next pursuit while cycling, but only when the stage is on screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!cycling || !stage) return;
    let inView = false;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(stage);
    const id = window.setInterval(() => {
      if (!inView || document.hidden) return;
      if (document.documentElement.classList.contains('chat-open')) return;
      setActiveId((cur) => {
        const i = hobbies.findIndex((h) => h.id === cur);
        return hobbies[(i + 1) % hobbies.length].id;
      });
    }, CYCLE_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [cycling]);

  return (
    <section id="offhours" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="t-display-lg grad-title" data-reveal="title">
            Off-hours
          </h2>
          <p data-reveal data-i="2">
            What fills the week away from the keyboard. Drag the sculpture to turn it.
          </p>
        </div>

        <div className="stage hobby-stage" data-scrub ref={stageRef}>
          <div className="hobby-top swap-in" key={`top-${active.id}`}>
            <span className="t-title">{active.name}</span>
            <span className="t-small">{active.caption}</span>
          </div>
          <canvas ref={canvasRef} className="hobby-canvas" aria-hidden></canvas>
          <div className="hobby-bottom swap-in late" key={`bottom-${active.id}`}>
            <p className="t-body-lg hobby-copy">{active.copy}</p>
            <span className="t-mono">{active.tempo}</span>
          </div>
        </div>

        <div
          ref={stripRef}
          className="segmented"
          data-reveal
          data-i="2"
          data-cycling={cycling ? '' : undefined}
          role="tablist"
          aria-label="Off-hours pursuits"
          style={{ marginTop: 'var(--space-5)' }}
          onPointerDown={() => setAuto(false)}
        >
          {hobbies.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={h.id === activeId}
              onClick={() => {
                setAuto(false);
                setActiveId(h.id);
              }}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffHours;
