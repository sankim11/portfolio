import { describe, expect, it } from 'vitest';

import { experience } from './experience';
import { hobbies } from './hobbies';
import { buildKnowledge } from './knowledge';
import { profile } from './profile';
import { projects } from './projects';

describe('buildKnowledge', () => {
  const knowledge = buildKnowledge();

  it('covers every project, role and pursuit on the site', () => {
    for (const p of projects) expect(knowledge).toContain(p.name);
    for (const e of experience) expect(knowledge).toContain(e.company);
    for (const h of hobbies) expect(knowledge).toContain(h.name);
  });

  it('gives the assistant the email to refer people to', () => {
    expect(knowledge).toContain(profile.email);
  });

  it('never includes the phone number', () => {
    expect(knowledge).not.toContain(profile.phone);
    expect(knowledge.replace(/\D/g, '')).not.toContain(profile.phone.replace(/\D/g, ''));
  });

  it('says nothing about looking for work', () => {
    expect(knowledge).not.toMatch(/open to (new )?roles|looking for (a job|work)|available for hire/i);
  });
});
