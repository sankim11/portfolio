import LayerField from '../components/LayerField';
import { profile } from '../data/profile';
import { cssVars } from '../lib/cssVars';
import { useScrollVar } from '../lib/motion';

/** Delay, after the opening curtain, before a piece of the title sequence plays. */
const delay = (ms: number) => cssVars({ '--d': `${ms}ms` });

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
              {profile.role} in Calgary
            </p>
            <h1 className="t-display-xl sheen hero-name">{profile.name}</h1>
            <p className="t-body-lg hero-sub hero-seq" style={delay(1300)}>
              I build AI products and the Stripe billing behind them, from the
              database schema up to the last pixel.
            </p>
            <div className="hero-actions hero-seq" style={delay(1500)}>
              <a href="#work" className="btn btn-primary" data-magnet>
                See selected work
              </a>
              <a href={`mailto:${profile.email}`} className="btn">
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
