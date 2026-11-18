import type { Shape } from '../types';

/** A football over the centre circle and halfway line. */
export function football(): Shape {
  const pts: number[][] = [];
  const edges: number[][] = [];

  // The ball: a truncated icosahedron (12 pentagons, 20 hexagons), built by
  // cutting each icosahedron edge a third of the way in from both ends.
  const phi = (1 + Math.sqrt(5)) / 2;
  const ico: number[][] = [];
  for (const a of [-1, 1])
    for (const b of [-phi, phi]) ico.push([0, a, b], [a, b, 0], [b, 0, a]);
  const near = (p: number[], q: number[]) =>
    Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - 2) < 0.01;
  const R = 1.3;
  const cy = 0.2;
  const seen = new Map<string, number>();
  const cut = (i: number, j: number) => {
    const key = i + '-' + j;
    let idx = seen.get(key);
    if (idx === undefined) {
      const pA = ico[i],
        pB = ico[j];
      const v = [
        pA[0] + (pB[0] - pA[0]) / 3,
        pA[1] + (pB[1] - pA[1]) / 3,
        pA[2] + (pB[2] - pA[2]) / 3,
      ];
      const len = Math.hypot(v[0], v[1], v[2]);
      idx = pts.length;
      pts.push([(v[0] / len) * R, (v[1] / len) * R + cy, (v[2] / len) * R]);
      seen.set(key, idx);
    }
    return idx;
  };
  for (let i = 0; i < 12; i++) {
    const nb: number[] = [];
    for (let j = 0; j < 12; j++) if (j !== i && near(ico[i], ico[j])) nb.push(j);
    for (const j of nb) {
      if (i < j) edges.push([cut(i, j), cut(j, i)]); // seam between two hexagons
      for (const k of nb)
        if (j < k && near(ico[j], ico[k])) edges.push([cut(i, j), cut(i, k)]); // pentagon side
    }
  }

  // The pitch: centre circle and halfway line.
  const gy = -1.45;
  const cs = pts.length;
  const cSegs = 28;
  for (let i = 0; i < cSegs; i++) {
    const a = (i / cSegs) * Math.PI * 2;
    pts.push([Math.cos(a) * 2.2, gy, Math.sin(a) * 1.3]);
  }
  for (let i = 0; i < cSegs; i++) edges.push([cs + i, cs + ((i + 1) % cSegs)]);
  const hs = pts.length;
  for (let i = 0; i <= 12; i++) pts.push([-3.3 + (6.6 * i) / 12, gy, 0]);
  for (let i = 0; i < 12; i++) edges.push([hs + i, hs + i + 1]);

  return { points: pts, edges };
}
