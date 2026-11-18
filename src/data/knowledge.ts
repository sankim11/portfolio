// Builds the plain-text profile the chat assistant answers from. It is generated
// from the same data files the page renders, so the two can never drift apart.
// Imports use .js extensions because this file also runs in Node as ESM.
import { facts, paragraphs } from './about.js';
import { education, experience } from './experience.js';
import { hobbies } from './hobbies.js';
import { profile } from './profile.js';
import { projects } from './projects.js';
import { skills } from './skills.js';

export function buildKnowledge(): string {
  const out: string[] = [];

  out.push(
    '## Who he is',
    `${profile.name}. ${profile.role} based in ${profile.location}.`,
    `Focus: ${profile.focus}`,
    ''
  );

  out.push('## About, in his own words');
  for (const segs of paragraphs)
    out.push(segs.map((s) => (typeof s === 'string' ? s : s.strong)).join(''));
  out.push('');

  out.push('## Key figures');
  for (const f of facts) out.push(`- ${f.label}: ${f.value}`);
  out.push('');

  out.push('## Experience (most recent first)');
  for (const e of experience) {
    out.push(`### ${e.role}, ${e.company} (${e.date}; ${e.location})`);
    for (const b of e.bullets) out.push(`- ${b}`);
    out.push(`Stack: ${e.tags.join(', ')}`, '');
  }

  out.push(
    '## Education',
    `${education.degree}. ${education.school}, ${education.location} (${education.date}).`,
    ''
  );

  out.push('## Projects (in the order the site shows them; the first is the most recent)');
  for (const p of projects) {
    out.push(`### ${p.name}: ${p.title}`, p.blurb);
    if (p.stack.frontend.length) out.push(`Frontend: ${p.stack.frontend.join(', ')}`);
    if (p.stack.backend.length) out.push(`Backend: ${p.stack.backend.join(', ')}`);
    if (p.stack.infra.length) out.push(`Infra and tools: ${p.stack.infra.join(', ')}`);
    out.push(
      `Role: ${p.role}`,
      `Status: ${p.status}`,
      `Year: ${p.year.trim()}`,
      `Shown on the site as: ${p.deployed ? 'Live' : 'Local build'}`,
      ''
    );
  }

  out.push('## Toolkit');
  for (const s of skills) out.push(`- ${s.label}: ${s.items.join(', ')}`);
  out.push('');

  out.push('## Outside work');
  for (const h of hobbies) out.push(`- ${h.name}: ${h.copy} (How often: ${h.tempo})`);
  out.push('');

  out.push(
    '## Contact',
    `- Email: ${profile.email}`,
    `- LinkedIn: ${profile.linkedin}`,
    `- GitHub: ${profile.github}`
  );

  return out.join('\n');
}
