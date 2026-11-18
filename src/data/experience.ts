export type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  date: string;
  bullets: string[];
  tags: string[];
};

export const experience: ExperienceItem[] = [
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
