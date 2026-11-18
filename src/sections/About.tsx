import { facts, paragraphs } from '../data/about';
import { cssVars } from '../lib/cssVars';
import { useCountUp, useWordScrub } from '../lib/motion';

const Fact = ({ label, value }: { label: string; value: string }) => {
  const { ref, text } = useCountUp(value);
  return (
    <div>
      <dt>{label}</dt>
      <dd ref={ref} aria-label={value}>
        {text}
      </dd>
    </div>
  );
};

const About = () => {
  // --prog runs 0 → 1 as the copy scrolls through; each word lights up at its index.
  const copyRef = useWordScrub<HTMLDivElement>();

  // Every word becomes a span carrying its position, so CSS can light them in order.
  let wordIndex = 0;
  const body = paragraphs.map((segments, pi) => (
    <p key={pi}>
      {segments.map((segment, si) => {
        const strong = typeof segment !== 'string';
        const text = strong ? segment.strong : segment;
        return text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((part, i) =>
            /^\s+$/.test(part) ? (
              part
            ) : (
              <span
                key={`${si}-${i}`}
                className={strong ? 'w t-strong' : 'w'}
                style={cssVars({ '--wi': wordIndex++ })}
              >
                {part}
              </span>
            )
          );
      })}
    </p>
  ));

  return (
    <section id="about" className="section">
      <div className="wrap about-grid">
        <h2 className="t-display-lg grad-title" data-reveal="title">
          I build AI products that ship.
        </h2>
        <div>
          <div
            className="about-copy t-body-lg scrub"
            ref={copyRef}
            style={cssVars({ '--n': wordIndex })}
          >
            {body}
          </div>
          <dl className="facts" data-reveal>
            {facts.map((f) => (
              <Fact key={f.label} {...f} />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default About;
