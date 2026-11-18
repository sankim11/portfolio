export const facts = [
  { label: 'Production pages', value: '50+' },
  { label: 'Engineers led', value: '5' },
  { label: 'Languages spoken', value: '4' },
  { label: 'Pitch prize', value: '$50K' },
];

/** Copy as segments so emphasised names keep their style; plain strings are body text. */
export type Seg = string | { strong: string };

export const paragraphs: Seg[][] = [
  [
    'At Motiv I develop ',
    { strong: 'Opal' },
    ', a multi-tenant AI workspace where teams and autonomous agents collaborate across threads, tasks and multi-step flows. I built the Stripe billing underneath it: subscriptions, proration, usage metering and a Stripe Connect marketplace. I also stream client data through AWS Kinesis into Snowflake, and I’ve led front-end delivery of 50+ production pages across multi-sided client platforms.',
  ],
  [
    'Before Motiv I worked on the fixed-income trading platform at ',
    { strong: 'BTG Pactual' },
    ', Latin America’s largest investment bank, in C#/.NET and SQL. That’s where I learned that in finance there’s no such thing as close enough.',
  ],
  [
    'I co-founded ',
    { strong: 'Munitora' },
    ', built its technical foundation from zero and led a team of five engineers. We won $50K at the University of Calgary × TC Energy Ingenuity Pitch Competition. Outside work I build prototypes with Claude Code, including ',
    { strong: 'Ada' },
    ', a self-hosted AI agent runtime, and ',
    { strong: 'Ponte' },
    ', a WhatsApp-first app that gives young people in Brazil’s favelas a personalised feed of jobs, courses and scholarships.',
  ],
  [
    'I have a Software Engineering degree from the University of Calgary’s Schulich School of Engineering. I speak English, Portuguese and Korean, plus conversational Spanish.',
  ],
];
