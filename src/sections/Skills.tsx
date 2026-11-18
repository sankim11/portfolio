import { skills } from '../data/skills';

const Skills = () => {
  return (
    <section id="skills" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="t-display-lg grad-title" data-reveal="title">
            Toolkit
          </h2>
          <p data-reveal data-i="2">
            What I build with, grouped by where it sits in the stack. I work
            spec-first, with Claude Code as my primary development tool.
          </p>
        </div>
        <div className="tools" data-scrub>
          {skills.map((s, i) => (
            <div key={s.label} className="tool-row" data-reveal data-i={i + 1}>
              <span className="tool-name">{s.label}</span>
              <span className="tool-items">{s.items.join(', ')}</span>
              <span className="tool-count t-mono">{s.items.length}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
