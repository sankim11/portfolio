import { describe, expect, it } from 'vitest';

import { hobbies } from '../../../data/hobbies';
import { sample } from '../sample';
import { SHAPES } from './index';

describe('sculpture shapes', () => {
  it('has a shape for every pursuit', () => {
    for (const hobby of hobbies) expect(SHAPES[hobby.id]).toBeTypeOf('function');
  });

  it.each(Object.entries(SHAPES))('%s is a well-formed wireframe', (_id, build) => {
    const { points, edges } = build();
    expect(points.length).toBeGreaterThan(10);
    expect(edges.length).toBeGreaterThan(10);
    for (const p of points) {
      expect(p).toHaveLength(3);
      expect(p.every(Number.isFinite)).toBe(true);
    }
    for (const [a, b] of edges) {
      expect(points[a], `edge start ${a}`).toBeDefined();
      expect(points[b], `edge end ${b}`).toBeDefined();
    }
  });

  it.each(Object.entries(SHAPES))('%s samples into the stage', (_id, build) => {
    const count = 500;
    const particles = sample(build(), count);
    expect(particles).toHaveLength(count * 3);
    for (const v of particles) {
      expect(Number.isFinite(v)).toBe(true);
      expect(Math.abs(v)).toBeLessThan(6);
    }
  });
});
