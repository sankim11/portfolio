import { describe, expect, it } from 'vitest';

import { createRateLimiter } from './rateLimit.js';

describe('createRateLimiter', () => {
  it('allows up to the maximum, then limits', () => {
    const isLimited = createRateLimiter({ windowMs: 1000, max: 3 });
    expect([1, 2, 3].map(() => isLimited('a', 0))).toEqual([false, false, false]);
    expect(isLimited('a', 0)).toBe(true);
  });

  it('tracks each key separately', () => {
    const isLimited = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(isLimited('a', 0)).toBe(false);
    expect(isLimited('b', 0)).toBe(false);
    expect(isLimited('a', 0)).toBe(true);
  });

  it('lets requests through again once the window has passed', () => {
    const isLimited = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(isLimited('a', 0)).toBe(false);
    expect(isLimited('a', 500)).toBe(true);
    expect(isLimited('a', 1001)).toBe(false);
  });
});
