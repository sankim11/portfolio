import type { CSSProperties } from 'react';
import LayerField from './LayerField';
import { useScrollVar } from '../motion';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const Hero = () => {
  // --p runs 0 → 1 as the hero scrolls away; CSS turns it into parallax.
  const ref = useScrollVar<HTMLElement>('--p', (el) =>
    Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.9)))
  );

  return (
    <header id="top" className="hero" ref={ref}>
      <div className="wrap">
        <div className="stage hero-stage">
          <div className="hero-glow" aria-hidden>
            <span />
            <span />
          </div>
          <LayerField intro dive delay={1100} />
          <div className="hero-content">
            <p className="hero-kicker hero-seq" style={delay(500)}>
              Full-stack engineer in Calgary
            </p>
            <h1 className="t-display-xl sheen hero-name">David San Kim</h1>
            <p className="t-body-lg hero-sub hero-seq" style={delay(1300)}>
              I build production systems across fintech, SaaS and AI, from the
              database schema up to the last pixel.
            </p>
            <div className="hero-actions hero-seq" style={delay(1500)}>
              <a href="#work" className="btn btn-primary" data-magnet>
                See selected work
              </a>
              <a href="mailto:davidsankim02@gmail.com" className="btn">
                Email me
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
