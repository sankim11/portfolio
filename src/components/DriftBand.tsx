import { useScrollVar } from '../motion';

const words = ['Fintech', 'SaaS', 'AI', 'Agtech', 'Payments', 'Data pipelines'];
const row = [...words, ...words];

/** Two rows of oversized words that slide in opposite directions as you scroll. */
const DriftBand = () => {
  const ref = useScrollVar<HTMLDivElement>('--x', (el) => {
    const r = el.getBoundingClientRect();
    return (window.innerHeight - r.top) * 0.35;
  });

  return (
    <div className="drift" ref={ref} aria-hidden>
      <div className="drift-row">
        {row.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="drift-row">
        {[...row].reverse().map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
};

export default DriftBand;
