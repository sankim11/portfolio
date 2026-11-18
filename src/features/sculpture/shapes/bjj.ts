import type { Shape } from '../types';

/** A belt tied round twice, its tails falling to a tatami mat. */
export function bjj(): Shape {
  const pts: number[][] = [];
  const edges: number[][] = [];

  // Tatami: a 6 x 4 grid of mats on the floor plane.
  const matY = -1.2;
  const cols = 6,
    rows = 4;
  const matStart = pts.length;
  for (let r = 0; r <= rows; r++)
    for (let c = 0; c <= cols; c++) pts.push([-2.4 + c * 0.8, matY, -1.4 + r * 0.5]);
  const mIdx = (r: number, c: number) => matStart + r * (cols + 1) + c;
  for (let r = 0; r <= rows; r++)
    for (let c = 0; c < cols; c++) edges.push([mIdx(r, c), mIdx(r, c + 1)]);
  for (let c = 0; c <= cols; c++)
    for (let r = 0; r < rows; r++) edges.push([mIdx(r, c), mIdx(r + 1, c)]);

  const beltStart = pts.length;
  // Belt wrapped twice around the waist: two flat bands.
  const segs = 32;
  const rx = 1.45,
    rz = 0.85,
    halfW = 0.14;
  function band(y: number, scale: number, strut: number) {
    const up = pts.length;
    for (let i = 0; i < segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      pts.push([Math.cos(ang) * rx * scale, y + halfW, Math.sin(ang) * rz * scale]);
    }
    const lo = pts.length;
    for (let i = 0; i < segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      pts.push([Math.cos(ang) * rx * scale, y - halfW, Math.sin(ang) * rz * scale]);
    }
    for (let i = 0; i < segs; i++) {
      edges.push([up + i, up + ((i + 1) % segs)]);
      edges.push([lo + i, lo + ((i + 1) % segs)]);
      if (i % strut === 0) edges.push([up + i, lo + i]);
    }
  }
  band(0.35, 1, 2);
  band(0.05, 1.03, 4);

  // Knot at the front: a small box with the cross-wrap drawn across it.
  const kc = [0, 0.2, rz * 1.03 + 0.08];
  const kw = 0.26,
    kh = 0.24,
    kd = 0.14;
  const kS = pts.length;
  for (const dz of [kd, -kd])
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      pts.push([kc[0] + sx * kw, kc[1] + sy * kh, kc[2] + dz]);
  for (let f = 0; f < 2; f++)
    for (let i = 0; i < 4; i++) edges.push([kS + f * 4 + i, kS + f * 4 + ((i + 1) % 4)]);
  for (let i = 0; i < 4; i++) edges.push([kS + i, kS + 4 + i]);
  edges.push([kS, kS + 2], [kS + 1, kS + 3]);

  // Two tails falling from the knot; the right one carries the rank bar.
  function tail(dir: number, endX: number, endY: number, bar: boolean) {
    const steps = 7;
    const tw = 0.13;
    const lS = pts.length;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = dir * 0.18 + (endX - dir * 0.18) * t;
      const y = kc[1] - kh + (endY - (kc[1] - kh)) * t;
      const z = kc[2] + kd + Math.sin(t * Math.PI) * 0.22;
      pts.push([x - tw, y, z], [x + tw, y, z]);
    }
    for (let i = 0; i <= steps; i++) {
      const l = lS + i * 2;
      edges.push([l, l + 1]);
      if (i < steps) edges.push([l, l + 2], [l + 1, l + 3]);
    }
    if (bar) {
      const b0 = lS + (steps - 2) * 2;
      const b1 = lS + steps * 2;
      const bS = pts.length;
      for (let k = 1; k <= 4; k++) {
        const t = k / 5;
        const ax = pts[b0][0] + (pts[b1][0] - pts[b0][0]) * t;
        const ay = pts[b0][1] + (pts[b1][1] - pts[b0][1]) * t;
        const az = pts[b0][2] + (pts[b1][2] - pts[b0][2]) * t + 0.01;
        pts.push([ax - 0.13, ay, az], [ax + 0.13, ay, az]);
      }
      for (let k = 0; k < 4; k++) edges.push([bS + k * 2, bS + k * 2 + 1]);
    }
  }
  tail(-1, -0.55, -1.2, false);
  tail(1, 0.5, -1.1, true);

  // Tip the belt toward the camera so it reads as a loop; the mat stays flat.
  const tilt = 0.75;
  const ct = Math.cos(tilt),
    st = Math.sin(tilt);
  for (let i = beltStart; i < pts.length; i++) {
    const pt = pts[i];
    const y = pt[1] - 0.2,
      z = pt[2];
    pt[1] = y * ct - z * st + 0.65;
    pt[2] = y * st + z * ct;
  }

  return { points: pts, edges };
}
