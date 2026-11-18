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
      'Developed Opal, a multi-tenant AI workspace where teams and autonomous agents collaborate in threads, tasks, and multi-step flows, on a TypeScript, Nuxt, tRPC, and AWS stack.',
      'Built monetization on Stripe: tiered subscriptions, tax, proration, auto top-ups, per-step credit holds, and a ledger metering Vercel AI Gateway usage per organization.',
      'Built a Stripe Connect marketplace for agent, task, and flow templates with usage-based seller earnings.',
      'Extended multimodal knowledge ingestion across documents, images, audio, and video.',
      'Secured the platform with role- and resource-level access control, tenant-scoped queries, and SSRF guards.',
      'For client projects, built automated data pipelines, pollers, webhooks, and scripts, validating with Zod and streaming through AWS Kinesis into Snowflake for consistent ingestion.',
      'Led front-end delivery across multi-sided client platforms in Vue, Nuxt, and Tailwind, 50+ production pages, plus Strapi CMS integration across multiple client environments.',
    ],
    tags: [
      'TypeScript',
      'Nuxt',
      'tRPC',
      'AWS',
      'Stripe',
      'Stripe Connect',
      'Vercel AI Gateway',
      'Snowflake',
      'Strapi',
    ],
  },
  {
    role: 'Co-Founder and CTO',
    company: 'Munitora Livestock Management Solutions Inc.',
    location: 'Calgary, Canada',
    date: 'Nov 2023 — Present',
    bullets: [
      'Led a team of five engineers to develop cross-platform mobile applications using Flutter and Dart, integrating RFID and AI technologies to streamline livestock management workflows.',
      'Developed a modular TypeScript backend using Express, Prisma ORM, and a layered architecture with support for REST, GraphQL, background jobs, AI agents, and CI/CD pipelines.',
      'Automated Azure infrastructure provisioning using Pulumi, deploying components such as App Service, Azure Database for PostgreSQL, Function Apps, Private DNS, Key Vault, and Virtual Networks.',
      'Won the University of Calgary × TC Energy Ingenuity Pitch Competition at Inventures 2024 in Calgary for a prize of $50,000.',
      'Developing specialized agents to deliver scalable, context-aware cattle-farm management functionality.',
      'Designing a computer vision system to identify individual cows through nasal pattern recognition using image scanning and AI-based classification.',
    ],
    tags: ['Flutter', 'Dart', 'TypeScript', 'Express', 'Prisma', 'GraphQL', 'Azure', 'Pulumi'],
  },
  {
    role: 'Full Stack Software Engineer',
    company: 'BTG Pactual',
    location: 'São Paulo, Brazil (Remote)',
    date: 'Jan 2024 — Jun 2024',
    bullets: [
      'Developed and optimized backend endpoints in C# to enhance integration with Angular applications.',
      'Contributed to sprint cycles by taking ownership of tickets, troubleshooting, and fixing backend issues to ensure timely delivery of high quality features.',
      'Redesigned credit data codebase to improve integration and enhance the performance of new data streams.',
      'Created and deployed MS SQL Server procedures and tables to automate and streamline data processing.',
      'Refactored legacy codebase to improve performance and maintainability across private bonds platform.',
    ],
    tags: ['C#', 'Angular', 'MS SQL Server', 'Fintech'],
  },
];

export const education = {
  school: 'University of Calgary, Schulich School of Engineering',
  degree: 'Bachelor of Science in Engineering, Software Engineering',
  location: 'Calgary, Canada',
  date: 'Sep 2018 — May 2024',
};
