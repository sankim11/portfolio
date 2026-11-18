import { experience } from '../data/experience';

const Experience = () => {
  return (
    <section id="experience" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="t-display-lg grad-title" data-reveal="title">
            Experience
          </h2>
          <p data-reveal data-i="2">Three roles across fintech, SaaS and agtech, most recent first.</p>
        </div>
        <div className="xp-wrap" data-through>
          <span className="xp-rail" aria-hidden>
            <i />
          </span>
          <ol className="xp">
          {experience.map((e) => (
            <li key={e.company} className="xp-row" data-reveal>
              <div className="xp-when">
                <span className="t-mono">{e.date}</span>
                <span className="t-small">{e.location}</span>
              </div>
              <div>
                <div className="xp-company">{e.company}</div>
                <h3 className="t-title">{e.role}</h3>
                <ul className="xp-bullets">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="xp-stack">{e.tags.join(', ')}</p>
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Experience;
