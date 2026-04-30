import { useEffect, useState } from 'react';

type Project = {
  no: string;
  name: string;
  title: string;
  blurb: string;
  stack: { frontend: string[]; backend: string[]; infra: string[] };
  role: string;
  status: string;
  year: string;
  tone: { from: string; to: string };
  glyph: string;
  deployed: boolean;
  span: { col: number; row: number };
  overlayAnchor: 'br' | 'bl' | 'tr' | 'tl';
};

const projects: Project[] = [
  {
    no: '01',
    name: 'Winnie',
    title: 'Pool-based betting, between friends.',
    blurb:
      'A social, pool-based betting platform where friends compete against each other rather than against the house.',
    stack: {
      frontend: ['React', 'TypeScript', 'Tailwind', 'Vite'],
      backend: ['Supabase', 'Postgres', 'Auth'],
      infra: ['Vercel', 'Render'],
    },
    role: 'Solo build',
    status: 'In active development',
    year: '2026',
    tone: { from: '#3a2a14', to: '#0c0a06' },
    glyph: 'W',
    deployed: true,
    span: { col: 3, row: 2 },
    overlayAnchor: 'br',
  },
  {
    no: '02',
    name: 'Ponte',
    title: 'A bridge to a first job.',
    blurb:
      'A solo side project — an ongoing platform matching youth from Brazilian favelas with companies hiring for entry-level roles, lowering the gap between talent and opportunity.',
    stack: {
      frontend: ['React', 'TypeScript'],
      backend: ['Postgres', 'REST'],
      infra: ['Mission-driven', 'Brazil'],
    },
    role: 'Solo build',
    status: 'In progress · social-impact',
    year: '2026',
    tone: { from: '#1c2a1c', to: '#0a0d0a' },
    glyph: 'P',
    deployed: true,
    span: { col: 2, row: 2 },
    overlayAnchor: 'bl',
  },
  {
    no: '03',
    name: 'Munitora',
    title: 'Livestock, fully instrumented.',
    blurb:
      'A modular livestock management platform covering mobile field operations, web dashboards, and Azure-backed infrastructure. $50K Inventures 2024 pitch winner.',
    stack: {
      frontend: ['Flutter', 'TypeScript'],
      backend: ['Prisma', 'Postgres'],
      infra: ['Azure', 'Pulumi'],
    },
    role: 'Co-founder & CTO · team of 5',
    status: 'In market',
    year: '2023 → ',
    tone: { from: '#2c1a0e', to: '#0a0807' },
    glyph: 'M',
    deployed: true,
    span: { col: 1, row: 2 },
    overlayAnchor: 'bl',
  },
  {
    no: '04',
    name: 'Library Management',
    title: 'A clean-architecture library, end-to-end.',
    blurb:
      'A full-stack library system — Symfony 7.2 / API Platform REST backend with JWT auth and Doctrine ORM, paired with a React + Vite SPA using Zustand and React Router.',
    stack: {
      frontend: [
        'React 18',
        'TypeScript',
        'Vite',
        'Tailwind',
        'Zustand',
        'React Router',
      ],
      backend: [
        'Symfony 7.2',
        'PHP 8.2',
        'API Platform',
        'Doctrine ORM',
        'JWT',
      ],
      infra: ['Postgres', 'PHPUnit', 'Webpack Encore'],
    },
    role: 'Solo build · full-stack',
    status: 'Local · learning project',
    year: '2024',
    tone: { from: '#1c2632', to: '#08090c' },
    glyph: 'L',
    deployed: false,
    span: { col: 2, row: 1 },
    overlayAnchor: 'tr',
  },
  {
    no: '05',
    name: 'Mail Assistant',
    title: 'Inbox, calendar, and tasks — one panel.',
    blurb:
      'An AI-augmented productivity assistant: Express + Prisma backend with BullMQ job queues, Google APIs (Gmail / Calendar / Tasks), OpenAI summaries; React 19 + Vite frontend; Docker-composed services.',
    stack: {
      frontend: ['React 19', 'TypeScript', 'Vite'],
      backend: [
        'Express 5',
        'Prisma 7',
        'OpenAI',
        'Google APIs',
        'BullMQ',
        'JWT',
        'Zod',
      ],
      infra: ['Postgres', 'Redis', 'Docker Compose'],
    },
    role: 'Solo build · full-stack',
    status: 'Local · in development',
    year: '2025',
    tone: { from: '#2a1a2e', to: '#0c0810' },
    glyph: '✉',
    deployed: false,
    span: { col: 2, row: 1 },
    overlayAnchor: 'tl',
  },
  {
    no: '06',
    name: 'Resume Forge',
    title: 'AI-assisted résumés, end-to-end.',
    blurb:
      'A résumé builder pairing a Nuxt 3 / Pinia / Tiptap editor with an Express + Prisma + OpenAI backend; Firebase auth, html-to-docx and html2pdf export, Tailwind + Headless UI.',
    stack: {
      frontend: ['Nuxt 3', 'Vue 3', 'Pinia', 'Tiptap', 'Tailwind', 'Headless UI'],
      backend: ['Node', 'Express', 'Prisma', 'OpenAI', 'Firebase Admin', 'Passport'],
      infra: ['Postgres', 'html-to-docx', 'html2pdf'],
    },
    role: 'Solo build · full-stack',
    status: 'Local · prototype',
    year: '2025',
    tone: { from: '#2c2010', to: '#0c0805' },
    glyph: 'R',
    deployed: false,
    span: { col: 2, row: 1 },
    overlayAnchor: 'tl',
  },
  {
    no: '07',
    name: 'TotalSupri',
    title: 'A polished marketing site, hand-tuned.',
    blurb:
      'A React storefront / marketing experience built on CRA with Framer Motion choreography, react-router navigation, Sass design tokens, and react-use hooks for tactile micro-interactions.',
    stack: {
      frontend: ['React 18', 'Framer Motion', 'React Router', 'Sass', 'react-use'],
      backend: [],
      infra: ['CRA', 'web-vitals', 'Testing Library'],
    },
    role: 'Solo build · frontend-only',
    status: 'Local · client work',
    year: '2024',
    tone: { from: '#1a2a26', to: '#070a09' },
    glyph: 'T',
    deployed: false,
    span: { col: 6, row: 1 },
    overlayAnchor: 'tr',
  },
];

const TileBackground = ({
  project,
  index,
  glyphSize,
}: {
  project: Project;
  index: number;
  glyphSize: number;
}) => (
  <div
    className="atelier-tile-bg"
    style={{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(135deg, ${project.tone.from} 0%, ${project.tone.to} 100%)`,
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
      aria-hidden
    >
      <defs>
        <pattern
          id={`atstrp${index}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="rgba(201,169,97,0.10)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#atstrp${index})`} />
    </svg>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        className="font-display"
        style={{
          fontSize: glyphSize,
          color: 'rgba(201,169,97,0.18)',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1,
        }}
      >
        {project.glyph}
      </div>
    </div>
  </div>
);

const StackChips = ({ project }: { project: Project }) => (
  <div className="atelier-stack-list">
    {project.stack.frontend.length > 0 && (
      <div className="stack-row">
        <span className="stack-label">Frontend</span>
        <div className="chip-row">
          {project.stack.frontend.map((t) => (
            <span key={t} className="chip chip-fe">
              {t}
            </span>
          ))}
        </div>
      </div>
    )}
    {project.stack.backend.length > 0 && (
      <div className="stack-row">
        <span className="stack-label">Backend</span>
        <div className="chip-row">
          {project.stack.backend.map((t) => (
            <span key={t} className="chip chip-be">
              {t}
            </span>
          ))}
        </div>
      </div>
    )}
    {project.stack.infra.length > 0 && (
      <div className="stack-row">
        <span className="stack-label">Infra · tools</span>
        <div className="chip-row">
          {project.stack.infra.map((t) => (
            <span key={t} className="chip chip-infra">
              {t}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Projects = () => {
  const [activeNo, setActiveNo] = useState<string | null>(null);
  const [expandedNo, setExpandedNo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const active = activeNo
    ? projects.find((p) => p.no === activeNo) ?? null
    : null;

  return (
    <>
      <section id="work" style={{ padding: '140px 0' }}>
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
              <span className="label">§.02</span>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: 'var(--fg)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                }}
              >
                Selected work
              </h2>
            </div>
            <span className="label hidden md:inline">
              07 projects · 2023 — 2026
            </span>
          </div>

          {!isMobile ? (
            <div
              className="atelier-stage enter"
              data-active={active ? 'true' : 'false'}
              data-overlay-anchor={active?.overlayAnchor ?? 'br'}
              onMouseLeave={() => setActiveNo(null)}
            >
              <div className="atelier-grid">
                {projects.map((p, i) => {
                  const isActive = activeNo === p.no;
                  const isDimmed = activeNo !== null && activeNo !== p.no;
                  const glyphSize =
                    p.span.col >= 3 ? 200 : p.span.col >= 2 ? 150 : 120;
                  return (
                    <button
                      key={p.no}
                      type="button"
                      className={`atelier-tile ${isActive ? 'is-active' : ''} ${
                        isDimmed ? 'is-dimmed' : ''
                      }`}
                      style={{
                        gridColumn: `span ${p.span.col}`,
                        gridRow: `span ${p.span.row}`,
                      }}
                      onMouseEnter={() => setActiveNo(p.no)}
                      onFocus={() => setActiveNo(p.no)}
                      onBlur={() => setActiveNo(null)}
                      data-cursor="hover"
                      aria-label={`${p.name} — ${p.title}`}
                    >
                      <TileBackground
                        project={p}
                        index={i}
                        glyphSize={glyphSize}
                      />
                      <span
                        className={`atelier-status-dot ${
                          p.deployed ? 'is-deployed' : 'is-local'
                        }`}
                        aria-hidden
                      />
                      <div className="atelier-tile-meta">
                        <span className="atelier-tile-no">No. {p.no}</span>
                        <span className="atelier-tile-name font-display">
                          {p.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="atelier-hint">
                <span className="label" style={{ color: 'var(--muted)' }}>
                  Hover any project to read more →
                </span>
              </div>

              <div
                className="atelier-overlay"
                aria-hidden={!active}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${active.tone.from} 0%, ${active.tone.to} 100%)`,
                      }
                    : undefined
                }
              >
                {active && (
                  <div className="atelier-overlay-inner">
                    <div className="atelier-overlay-top">
                      <span
                        className="label"
                        style={{ color: 'var(--gold)' }}
                      >
                        No. {active.no}
                      </span>
                      <span
                        className="label"
                        style={{ color: 'rgba(242,237,228,0.62)' }}
                      >
                        {active.status}
                      </span>
                    </div>
                    <h3 className="atelier-overlay-title font-display">
                      <span className="atelier-overlay-eyebrow">
                        {active.name}
                      </span>
                      {active.title}
                    </h3>
                    <p className="atelier-overlay-blurb">{active.blurb}</p>
                    <StackChips project={active} />
                    <div className="atelier-overlay-bottom">
                      <span
                        className="label"
                        style={{ color: 'rgba(242,237,228,0.7)' }}
                      >
                        {active.role}
                      </span>
                      {active.deployed ? (
                        <span
                          className="label"
                          style={{ color: 'var(--gold)' }}
                        >
                          View case study ↗
                        </span>
                      ) : (
                        <span className="atelier-stamp-local">
                          Local · not deployed
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="atelier-stack enter">
              {projects.map((p, i) => {
                const expanded = expandedNo === p.no;
                return (
                  <div
                    key={p.no}
                    className={`atelier-mobile ${expanded ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="atelier-mobile-head"
                      onClick={() =>
                        setExpandedNo(expanded ? null : p.no)
                      }
                      aria-expanded={expanded}
                    >
                      <TileBackground project={p} index={i} glyphSize={130} />
                      <span
                        className={`atelier-status-dot ${
                          p.deployed ? 'is-deployed' : 'is-local'
                        }`}
                        aria-hidden
                      />
                      <div className="atelier-tile-meta">
                        <span className="atelier-tile-no">No. {p.no}</span>
                        <span className="atelier-tile-name font-display">
                          {p.name}
                        </span>
                      </div>
                    </button>
                    {expanded && (
                      <div className="atelier-mobile-body">
                        <div className="atelier-overlay-top">
                          <span
                            className="label"
                            style={{ color: 'var(--gold)' }}
                          >
                            No. {p.no}
                          </span>
                          <span className="label">{p.status}</span>
                        </div>
                        <h3 className="atelier-overlay-title font-display">
                          <span className="atelier-overlay-eyebrow">
                            {p.name}
                          </span>
                          {p.title}
                        </h3>
                        <p
                          className="atelier-overlay-blurb"
                          style={{ color: 'var(--body)' }}
                        >
                          {p.blurb}
                        </p>
                        <StackChips project={p} />
                        <div className="atelier-overlay-bottom">
                          <span className="label">{p.role}</span>
                          {p.deployed ? (
                            <span
                              className="label"
                              style={{ color: 'var(--gold)' }}
                            >
                              View case study ↗
                            </span>
                          ) : (
                            <span className="atelier-stamp-local">
                              Local · not deployed
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="wrap">
        <div className="hairline"></div>
      </div>
    </>
  );
};

export default Projects;
