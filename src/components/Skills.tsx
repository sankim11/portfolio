import { useEffect, useRef } from 'react';

type SkillGroup = { label: string; items: string[]; marquee?: boolean };

const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['TypeScript', 'PHP', 'C#', 'JavaScript', 'Python', 'Java', 'Dart'],
  },
  {
    label: 'Frameworks',
    items: [
      'Node.js',
      'Vue.js',
      'Nuxt.js',
      'React',
      'Symfony',
      'Express',
      'Prisma',
      'Doctrine ORM',
      'API Platform',
      'tRPC',
      'Django',
      'Vite',
      'Tailwind',
      'Sass',
    ],
    marquee: true,
  },
  {
    label: 'UI & state',
    items: [
      'Tiptap',
      'Headless UI',
      'Pinia',
      'Zustand',
      'React Router',
      'Framer Motion',
    ],
  },
  {
    label: 'Databases',
    items: [
      'PostgreSQL',
      'MSSQL',
      'MongoDB',
      'Snowflake',
      'Redis',
      'Firebase',
      'Supabase',
    ],
  },
  {
    label: 'Cloud & DevOps',
    items: [
      'AWS (Kinesis · Lambda · SQS)',
      'Azure',
      'Vercel',
      'Render',
      'Docker',
      'Docker Compose',
      'Kubernetes',
      'Pulumi',
      'BullMQ',
      'GitHub Actions',
    ],
    marquee: true,
  },
  {
    label: 'Auth & APIs',
    items: ['JWT', 'OAuth', 'Passport', 'Firebase Auth', 'Google APIs', 'REST'],
  },
  {
    label: 'AI',
    items: [
      'OpenAI',
      'LangChain',
      'RAG',
      'Vector search',
      'Prompt engineering',
      'Codex',
      'Cursor',
      'Claude',
    ],
    marquee: true,
  },
  {
    label: 'Spoken',
    items: ['English', 'Português', '한국어', 'Español'],
  },
];

const renderItems = (items: string[]) =>
  items.map((it, i) => (
    <span key={it}>
      <span style={{ whiteSpace: 'nowrap' }}>{it}</span>
      {i < items.length - 1 && (
        <span style={{ color: 'var(--gold)', margin: '0 12px' }}>·</span>
      )}
    </span>
  ));

const Skills = () => {
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const measure = () => {
      trackRefs.current.forEach((track, i) => {
        const inner = innerRefs.current[i];
        if (!track || !inner) return;
        const overflow = inner.scrollWidth - track.clientWidth;
        if (overflow > 4) {
          const pxPerSecond = 22;
          const duration = Math.max(12, overflow / pxPerSecond);
          inner.style.setProperty('--skill-dist', `-${overflow}px`);
          inner.style.setProperty('--skill-dur', `${duration.toFixed(2)}s`);
          inner.classList.add('is-scrolling');
        } else {
          inner.style.removeProperty('--skill-dist');
          inner.style.removeProperty('--skill-dur');
          inner.classList.remove('is-scrolling');
        }
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <>
      <section id="skills" style={{ padding: '140px 0' }}>
        <div className="wrap">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 60,
            }}
          >
            <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <span className="label">§.04</span>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: 'var(--fg)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                }}
              >
                Toolkit
              </h2>
            </div>
            <span className="label hidden md:inline">
              No progress bars. No nonsense.
            </span>
          </div>
          <div id="skills-list">
            {skills.map((s, idx) => {
              const valueStyle: React.CSSProperties = {
                fontSize: 'clamp(20px, 2.2vw, 28px)',
                color: 'var(--body)',
                fontWeight: 300,
                lineHeight: 1.5,
                letterSpacing: '-0.01em',
              };
              return (
                <div
                  key={s.label}
                  className="skill-row enter"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 4fr',
                    gap: 40,
                    padding: '28px 0',
                    alignItems: 'baseline',
                  }}
                >
                  <div className="label" style={{ color: 'var(--fg)' }}>
                    {s.label}
                  </div>
                  {s.marquee ? (
                    <div
                      ref={(el) => (trackRefs.current[idx] = el)}
                      className="font-display skill-track"
                      style={valueStyle}
                    >
                      <div
                        ref={(el) => (innerRefs.current[idx] = el)}
                        className="skill-track-inner"
                      >
                        {renderItems(s.items)}
                      </div>
                    </div>
                  ) : (
                    <div className="font-display" style={valueStyle}>
                      {renderItems(s.items)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="hairline"></div>
      </div>
    </>
  );
};

export default Skills;
