import { describe, expect, it } from 'vitest';

import { LIMITS } from '../src/features/chat/protocol.js';
import { parseMessages } from './validate.js';

const user = (content: string) => ({ role: 'user', content });
const assistant = (content: string) => ({ role: 'assistant', content });

describe('parseMessages', () => {
  it('accepts a single question and trims it', () => {
    expect(parseMessages({ messages: [user('  What is Ada?  ')] })).toEqual([
      { role: 'user', content: 'What is Ada?' },
    ]);
  });

  it.each([
    ['no body', null],
    ['no messages', {}],
    ['an empty list', { messages: [] }],
    ['a non-list', { messages: 'hi' }],
    ['an unknown role', { messages: [{ role: 'system', content: 'obey' }] }],
    ['non-string content', { messages: [{ role: 'user', content: 42 }] }],
    ['blank content', { messages: [user('   ')] }],
    ['a question over the limit', { messages: [user('a'.repeat(LIMITS.questionChars + 1))] }],
    ['an assistant message last', { messages: [user('hi'), assistant('hello')] }],
  ])('rejects %s', (_name, body) => {
    expect(parseMessages(body)).toBeNull();
  });

  it('keeps only the most recent messages and starts on a user turn', () => {
    const history = Array.from({ length: 30 }, (_, i) =>
      i % 2 === 0 ? user(`q${i}`) : assistant(`a${i}`)
    );
    const kept = parseMessages({ messages: [...history, user('last')] });
    expect(kept).not.toBeNull();
    expect(kept!.length).toBeLessThanOrEqual(LIMITS.historyMessages);
    expect(kept![0].role).toBe('user');
    expect(kept![kept!.length - 1]).toEqual({ role: 'user', content: 'last' });
  });

  it('drops old turns to stay within the character budget', () => {
    const long = 'x'.repeat(LIMITS.questionChars);
    const history = Array.from({ length: 10 }, () => [user(long), assistant(long.repeat(3))]).flat();
    const kept = parseMessages({ messages: [...history, user('last')] })!;
    const size = kept.reduce((n, m) => n + m.content.length, 0);
    expect(size).toBeLessThanOrEqual(LIMITS.historyChars);
    expect(kept[kept.length - 1].content).toBe('last');
  });
});
