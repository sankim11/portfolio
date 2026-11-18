export type Project = {
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
};

export const projects: Project[] = [
  {
    no: '01',
    name: 'Ada',
    title: 'A self-hosted agent runtime, built spec-first.',
    blurb:
      'A self-hosted agentic runtime: an AI agent that runs a loop of Observe, Understand, Plan, Act, Verify and Remember, with a language model that can be swapped out. All 198 requirements trace to 1,170 test scenarios, 198 of them safety scenarios, and the validator reports 0 errors. Its 105 tool contracts each declare whether their action can be undone. Ada speaks through ElevenLabs today; the wider assistant (email, calendar, calls, home devices, smart glasses) is planned, not built. 448 of its 572 commits were written with Claude Code.',
    stack: {
      frontend: ['Electron desktop app', 'Android client'],
      backend: ['TypeScript', 'Node 22', 'tRPC', 'Drizzle ORM', 'PostgreSQL 17', 'pgvector'],
      infra: ['Model Context Protocol over stdio', 'ElevenLabs voice', 'Claude Code'],
    },
    role: 'Solo build',
    status: 'Working prototype · unreleased',
    year: '2026',
    tone: { from: '#2a2440', to: '#09080f' },
    glyph: 'A',
    deployed: false,
  },
  {
    no: '02',
    name: 'Winnie',
    title: 'Pool-based betting, between friends.',
    blurb:
      'A social, pool-based betting platform where friends compete against each other rather than against the house.',
    stack: {
      frontend: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind', 'Radix UI', 'TanStack Query', 'Framer Motion'],
      backend: ['Fastify 5', 'Supabase', 'Postgres', 'Kysely', 'Zod', 'Turborepo'],
      infra: ['Vercel', 'Docker', 'Sentry', 'pnpm workspaces'],
    },
    role: 'Solo build',
    status: 'In active development',
    year: '2026',
    tone: { from: '#3a2a14', to: '#0c0a06' },
    glyph: 'W',
    deployed: true,
  },
  {
    no: '03',
    name: 'Ponte',
    title: 'A bridge to a first job.',
    blurb:
      'A solo side project — an ongoing platform matching youth from Brazilian favelas with companies hiring for entry-level roles, lowering the gap between talent and opportunity.',
    stack: {
      frontend: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind', 'Flutter'],
      backend: ['Supabase', 'Postgres', 'JOSE / JWT'],
      infra: ['Vercel', 'Playwright', 'Vitest'],
    },
    role: 'Solo build',
    status: 'In progress · social-impact',
    year: '2026',
    tone: { from: '#1c2a1c', to: '#0a0d0a' },
    glyph: 'P',
    deployed: true,
  },
  {
    no: '04',
    name: 'Munitora',
    title: 'Livestock, fully instrumented.',
    blurb:
      'A modular livestock management platform covering mobile field operations, web dashboards, and Azure-backed infrastructure. $50K Inventures 2024 pitch winner.',
    stack: {
      frontend: ['Flutter', 'React 19', 'TypeScript', 'Tailwind', 'Vite'],
      backend: ['Express 5', 'Prisma', 'Postgres', 'Firebase', 'Stripe', 'OpenAI', 'Zod'],
      infra: ['Azure Functions', 'Mapbox', 'Docker', 'Resend'],
    },
    role: 'Co-founder & CTO · team of 5',
    status: 'In market',
    year: '2023 → ',
    tone: { from: '#2c1a0e', to: '#0a0807' },
    glyph: 'M',
    deployed: true,
  },
  {
    no: '05',
    name: 'Brushwork',
    title: 'A painter’s portfolio, by medium.',
    blurb:
      'A personal art portfolio split by medium — drawing, acrylic, oil, watercolour. React 18 + Vite + Tailwind v4 SPA, hand-tuned palettes per room, route-driven gallery navigation.',
    stack: {
      frontend: ['React 18', 'TypeScript', 'Vite 6', 'Tailwind v4', 'React Router 6'],
      backend: [],
      infra: ['Vite', 'tsc'],
    },
    role: 'Solo build · side project',
    status: 'Local · personal',
    year: '2026',
    tone: { from: '#2a1c24', to: '#0a0708' },
    glyph: 'B',
    deployed: true,
  },
  {
    no: '06',
    name: 'Rainbow 6 Manual',
    title: 'A tactical reference for Rainbow Six.',
    blurb:
      'A Rainbow Six Siege field manual — operator catalog, map blueprints, loadouts, drone doctrine, tier list, and comms reference. React 18 + Vite, frontend-only, structured component-per-section.',
    stack: {
      frontend: ['React 18', 'Vite 5', 'JavaScript', 'CSS'],
      backend: [],
      infra: ['ESLint 9', 'Vite'],
    },
    role: 'Solo build · side project',
    status: 'Local · personal',
    year: '2026',
    tone: { from: '#1f2218', to: '#08090a' },
    glyph: 'R6',
    deployed: true,
  },
  {
    no: '07',
    name: 'PoloMetrics',
    title: 'Workload · recovery · pairing, for polo.',
    blurb:
      'Workload, recovery, and pairing analytics for high-goal polo players — the player–horse pair treated as a first-class entity. Flutter app (iOS / Android / Windows) plus a static marketing site, organized as a monorepo.',
    stack: {
      frontend: ['Flutter', 'Dart', 'fl_chart', 'Material', 'HTML / CSS'],
      backend: [],
      infra: ['Monorepo', 'iOS', 'Android', 'Windows desktop'],
    },
    role: 'Solo build · side project',
    status: 'Local · prototype',
    year: '2026',
    tone: { from: '#1a2820', to: '#080c0a' },
    glyph: 'PM',
    deployed: true,
  },
  {
    no: '08',
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
  },
  {
    no: '09',
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
  },
  {
    no: '10',
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
  },
  {
    no: '11',
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
  },
  {
    no: '12',
    name: 'Team Smandych',
    title: 'A Calgary Muay Thai gym, rebuilt.',
    blurb:
      'A modern site rebuild for Team Smandych Muay Thai & Kickboxing in Calgary — six pages covering schedule, trainers, fees, a 3-step registration wizard, and contact info, with all gym content driven by typed data modules.',
    stack: {
      frontend: [
        'Next.js 14',
        'React 18',
        'TypeScript',
        'Tailwind',
        'Framer Motion',
        'React Hook Form',
        'Zod',
      ],
      backend: [],
      infra: ['next/font', 'next/image', 'ESLint'],
    },
    role: 'Solo build · client work',
    status: 'Local · in development',
    year: '2026',
    tone: { from: '#2a1212', to: '#0a0606' },
    glyph: 'TS',
    deployed: true,
  },
  {
    no: '13',
    name: 'Loupe',
    title: 'AI-generated visuals you can drill into.',
    blurb:
      'An interactive AI-generated visual explorer — type a prompt, get an isometric illustration, click any element to drill in. Built collaboratively by Claude Code (frontend / integration) and Gemini CLI (image generation), with a shared SPEC contract.',
    stack: {
      frontend: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind v4'],
      backend: ['@google/genai', 'Gemini API'],
      infra: ['tsx', 'PostCSS', 'dotenv'],
    },
    role: 'Multi-agent build · prototype',
    status: 'Local · v0 prototype',
    year: '2026',
    tone: { from: '#101a2c', to: '#06070c' },
    glyph: 'Lp',
    deployed: true,
  },
];
