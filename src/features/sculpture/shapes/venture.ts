import type { Shape } from '../types';

/** A rocket leaning into its climb. */
export function venture(): Shape {
  const pts: number[][] = [];
  const edges: number[][] = [];

  // Rocket body and nose: stacked rings joined by struts.
  const segs = 14;
  const rings = [
    { y: -1.25, r: 0.42 },
    { y: -0.8, r: 0.52 },
    { y: -0.2, r: 0.56 },
    { y: 0.4, r: 0.54 },
    { y: 0.9, r: 0.44 },
    { y: 1.3, r: 0.3 },
    { y: 1.6, r: 0.15 },
  ];
  const starts: number[] = [];
  rings.forEach(({ y, r }) => {
    const st = pts.length;
    starts.push(st);
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    for (let i = 0; i < segs; i++) edges.push([st + i, st + ((i + 1) % segs)]);
  });
  for (let i = 0; i < segs; i += 2)
    for (let r = 0; r < starts.length - 1; r++)
      edges.push([starts[r] + i, starts[r + 1] + i]);
  const tip = pts.length;
  pts.push([0, 1.9, 0]);
  for (let i = 0; i < segs; i += 2) edges.push([starts[starts.length - 1] + i, tip]);

  // Nozzle.
  const nz = pts.length;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    pts.push([Math.cos(a) * 0.3, -1.5, Math.sin(a) * 0.3]);
  }
  for (let i = 0; i < 10; i++) edges.push([nz + i, nz + ((i + 1) % 10)]);
  for (let i = 0; i < 10; i += 2)
    edges.push([nz + i, starts[0] + (Math.round((i * segs) / 10) % segs)]);

  // Three swept fins.
  for (let f = 0; f < 3; f++) {
    const a = (f / 3) * Math.PI * 2 + Math.PI / 6;
    const c = Math.cos(a),
      sn = Math.sin(a);
    const f0 = pts.length;
    pts.push(
      [c * 0.53, -0.55, sn * 0.53],
      [c * 1.15, -1.5, sn * 1.15],
      [c * 1.05, -1.75, sn * 1.05],
      [c * 0.42, -1.25, sn * 0.42]
    );
    edges.push([f0, f0 + 1], [f0 + 1, f0 + 2], [f0 + 2, f0 + 3], [f0 + 3, f0]);
  }

  // Porthole facing the camera.
  const ph = pts.length;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    pts.push([Math.cos(a) * 0.2, 0.45 + Math.sin(a) * 0.2, 0.57]);
  }
  for (let i = 0; i < 10; i++) edges.push([ph + i, ph + ((i + 1) % 10)]);

  // Exhaust trails.
  for (const dx of [-0.16, 0, 0.16]) {
    const e0 = pts.length;
    pts.push([dx, -1.6, 0], [dx * 1.6, -2.0, 0], [dx * 0.8, -2.45, 0]);
    edges.push([e0, e0 + 1], [e0 + 1, e0 + 2]);
  }

  // Lean into the climb.
  const t = -0.42;
  const ct = Math.cos(t),
    st = Math.sin(t);
  for (const pt of pts) {
    const x = pt[0],
      y = pt[1];
    pt[0] = x * ct - y * st;
    pt[1] = x * st + y * ct + 0.2;
  }

  return { points: pts, edges };
}
