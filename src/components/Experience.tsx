type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  date: string;
  bullets: string[];
  tags: string[];
};

const experience: ExperienceItem[] = [
  {
    role: 'Full Stack Software Engineer',
    company: 'Motiv',
    location: 'Calgary, Canada',
    date: 'Feb 2025 — Present',
    bullets: [
      'Ships across 12 concurrent client platforms (Vue/Nuxt, TypeScript/tRPC, PHP/WordPress).',
      'Owns the Stripe integration powering 3 production platforms — checkout, subscription billing, and payment reconciliation.',
      'Built a modular AI orchestration framework supporting interchangeable LLMs — GPT, Claude, LLaMA.',
      'Built an AI-powered hiring platform matching companies with youth, ages 18 — 24.',
      'Increased team delivery speed ~60% by integrating Codex into planning, code generation, and PR review.',
    ],
    tags: [
      'Vue/Nuxt',
      'PHP',
      'tRPC',
      'Stripe',
      'AWS',
      'Snowflake'
    ],
  },
  {
    role: 'Co-Founder & CTO',
    company: 'Munitora Livestock Management Solutions Inc.',
    location: 'Calgary, Canada',
    date: 'Nov 2023 — Present',
    bullets: [
      'Won $50,000 at the U of Calgary × TC Energy Ingenuity Pitch Competition (Inventures 2024).',
      'Hired and led 4 engineers across mobile (Flutter/Dart), frontend, QA, and infrastructure.',
      'Architected a modular TypeScript backend (Express, Prisma) supporting REST, GraphQL, background jobs, AI agents, and CI/CD.',
      'Automated Azure infrastructure with Pulumi — App Service, PostgreSQL, Function Apps, Key Vault, and Virtual Networks as code.',
    ],
    tags: ['TypeScript', 'Express', 'Prisma', 'Flutter', 'Azure', 'Pulumi'],
  },
  {
    role: 'Full Stack Software Engineer',
    company: 'BTG Pactual',
    location: 'São Paulo, Brazil (Remote)',
    date: 'Jan 2024 — Jun 2024',
    bullets: [
      'Processed high-volume fixed-income financial data on a C#/.NET backend for the private bonds trading platform.',
      'Reduced query latency via strategic MSSQL indexing.',
      'Used AWS SQS for decoupling microservices in the trading architecture.',
    ],
    tags: ['C# / .NET', 'Angular', 'MSSQL', 'AWS SQS', 'Fintech'],
  },
];

const Experience = () => {
  return (
    <>
      <section id="experience" style={{ padding: '140px 0' }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 3fr',
              gap: 80,
            }}
            className="exp-grid"
          >
            <div>
              <span className="label">§.03 — Experience</span>
              <p
                className="font-display"
                style={{
                  marginTop: 24,
                  marginBottom: 14,
                  fontSize: 22,
                  color: 'var(--fg)',
                  lineHeight: 1.3,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  whiteSpace: 'nowrap',
                }}
              >
                Three roles. Three industries. One discipline.
              </p>
            </div>
            <div
              style={{ position: 'relative', paddingLeft: 25 }}
              id="timeline"
            >
              <span className="tline"></span>
              {experience.map((e, i) => (
                <div
                  key={`${e.company}-${i}`}
                  className="tnode enter"
                  style={{
                    paddingBottom: i === experience.length - 1 ? 0 : 64,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 24,
                      flexWrap: 'wrap',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        className="label"
                        style={{ color: 'var(--gold)', marginBottom: 6 }}
                      >
                        {e.company}
                      </div>
                      <h3
                        className="font-display"
                        style={{
                          fontSize: 26,
                          color: 'var(--fg)',
                          fontWeight: 300,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {e.role}
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="label" style={{ marginBottom: 4 }}>
                        {e.date}
                      </div>
                      <div className="label" style={{ color: 'var(--muted)' }}>
                        {e.location}
                      </div>
                    </div>
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '18px 0 18px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      color: 'var(--body)',
                    }}
                  >
                    {e.bullets.map((b, bi) => (
                      <li
                        key={bi}
                        style={{
                          fontSize: 15,
                          lineHeight: 1.55,
                          paddingLeft: 18,
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 10,
                            width: 6,
                            height: 1,
                            background: 'var(--gold)',
                          }}
                        ></span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                  >
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          padding: '5px 9px',
                          border: '1px solid var(--line)',
                          color: 'var(--muted)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="hairline"></div>
      </div>
    </>
  );
};

export default Experience;
