import type { Shape } from './types';

/** Where a sculpture may sit, in world units: centred a little above the middle. */
const SAFE = { y: 0.42, halfWidth: 3.5, halfHeight: 1.5 };

/** Share of particles left loose as dust in the air around the sculpture. */
const DUST = 0.06;

/** Roughly normal-distributed random number. */
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.82;

/**
 * Scatters `count` particles along a shape's edges. The shape is first fitted
 * into the safe area between the stage title and its caption, so tall shapes
 * and wide ones are framed alike. Returns xyz triples.
 */
export function sample(shape: Shape, count: number): Float32Array {
  const { points, edges } = shape;

  const lengths: number[] = [];
  let total = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [a, b] of edges) {
    const pa = points[a];
    const pb = points[b];
    if (pa && pb) {
      total += Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      for (const p of [pa, pb]) {
        minX = Math.min(minX, p[0]);
        maxX = Math.max(maxX, p[0]);
        minY = Math.min(minY, p[1]);
        maxY = Math.max(maxY, p[1]);
      }
    }
    lengths.push(total);
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const fit = Math.min(
    SAFE.halfWidth / Math.max(0.01, (maxX - minX) / 2),
    SAFE.halfHeight / Math.max(0.01, (maxY - minY) / 2),
    1.25
  );

  const out = new Float32Array(count * 3);
  const dust = Math.floor(count * DUST);
  for (let i = 0; i < count; i++) {
    const o = i * 3;
    if (i < dust || total === 0) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.cbrt(Math.random());
      out[o] = Math.cos(a) * r * 4.4;
      out[o + 1] = (Math.random() * 2 - 1) * 2.1 * r;
      out[o + 2] = Math.sin(a) * r * 2.6;
      continue;
    }
    // Pick an edge in proportion to its length, then a spot along it.
    const pick = Math.random() * total;
    let lo = 0;
    let hi = lengths.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] < pick) lo = mid + 1;
      else hi = mid;
    }
    const pa = points[edges[lo][0]];
    const pb = points[edges[lo][1]];
    const t = Math.random();
    // Most particles hug the edge; a quarter form a soft halo around it.
    const spread = Math.random() < 0.26 ? 0.075 : 0.016;
    out[o] = (pa[0] + (pb[0] - pa[0]) * t - cx) * fit + gauss() * spread;
    out[o + 1] = (pa[1] + (pb[1] - pa[1]) * t - cy) * fit + SAFE.y + gauss() * spread;
    out[o + 2] = (pa[2] + (pb[2] - pa[2]) * t) * fit + gauss() * spread;
  }
  return out;
}
