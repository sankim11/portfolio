import type { CSSProperties } from 'react';
import { useCountUp, useWordScrub } from '../motion';

import { facts, paragraphs } from '../data/about';

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

  let wi = 0;
  const body = paragraphs.map((segs, pi) => (
    <p key={pi}>
      {segs.map((seg, si) => {
        const strong = typeof seg !== 'string';
        const text = strong ? seg.strong : seg;
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
                style={{ '--wi': wi++ } as CSSProperties}
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
            style={{ '--n': wi } as CSSProperties}
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
