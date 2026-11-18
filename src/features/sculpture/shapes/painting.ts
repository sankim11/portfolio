import type { Shape, Vec2, Vec3 } from '../types';
import { ShapeBuilder, smooth } from './builder';

/** An easel holding a landscape in progress, with a palette and brush beside it. */
export function painting(): Shape {
  const b = new ShapeBuilder();

  // Canvas: an outer edge, an inner frame, and a little thickness.
  const z = 0.08;
  const [x0, x1, y0, y1] = [-1.2, 1.2, -0.25, 1.5];
  const front = b.path(
    [
      [x0, y0, z],
      [x1, y0, z],
      [x1, y1, z],
      [x0, y1, z],
    ],
    true
  );
  const rear = b.path(
    [
      [x0, y0, z - 0.1],
      [x1, y0, z - 0.1],
      [x1, y1, z - 0.1],
      [x0, y1, z - 0.1],
    ],
    true
  );
  b.link(front, rear);
  const inset = 0.09;
  b.path(
    [
      [x0 + inset, y0 + inset, z],
      [x1 - inset, y0 + inset, z],
      [x1 - inset, y1 - inset, z],
      [x0 + inset, y1 - inset, z],
    ],
    true
  );

  // The painting: a mountain range, a low sun, and water in the foreground.
  const pz = z + 0.01;
  const horizon = 0.42;
  b.path([
    [x0 + inset, horizon, pz],
    [-0.62, 1.02, pz],
    [-0.3, 0.7, pz],
    [0.18, 1.24, pz],
    [0.62, 0.66, pz],
    [0.86, 0.88, pz],
    [x1 - inset, horizon + 0.1, pz],
  ]);
  b.path([
    [x0 + inset, horizon, pz],
    [x1 - inset, horizon, pz],
  ]);
  b.ring([0.7, 1.18, pz], 0.13, 0.13, 'xy', 14);
  for (const [wy, phase] of [
    [0.22, 0],
    [0.02, 1.6],
  ]) {
    const wave: Vec3[] = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      wave.push([-0.85 + t * 1.7, wy + Math.sin(t * Math.PI * 4 + phase) * 0.035, pz]);
    }
    b.path(wave);
  }

  // Easel: two front legs meeting above the canvas, a back leg, and a tray.
  b.path([
    [-0.92, -1.15, 0.36],
    [-0.2, 1.78, -0.06],
  ]);
  b.path([
    [0.92, -1.15, 0.36],
    [0.2, 1.78, -0.06],
  ]);
  b.path([
    [-0.2, 1.78, -0.06],
    [0.2, 1.78, -0.06],
  ]);
  b.path([
    [0, 1.7, -0.06],
    [0, -1.15, -1.0],
  ]);
  const trayFront = b.path([
    [-1.35, y0 - 0.06, 0.34],
    [1.35, y0 - 0.06, 0.34],
  ]);
  const trayBack = b.path([
    [-1.35, y0 - 0.06, 0.12],
    [1.35, y0 - 0.06, 0.12],
  ]);
  b.link(trayFront, trayBack);

  // Palette lying to the right, tipped toward the viewer, with dabs of paint.
  const pc: Vec3 = [2.15, -0.78, 0.55];
  const onPalette = ([u, v]: Vec2): Vec3 => [pc[0] + u, pc[1] + v * 0.55, pc[2] + v * 0.5];
  const kidney: Vec2[] = [
    [-0.8, 0.0],
    [-0.62, 0.42],
    [-0.1, 0.56],
    [0.5, 0.46],
    [0.82, 0.08],
    [0.62, -0.34],
    [0.2, -0.3],
    [0.0, -0.5],
    [-0.45, -0.46],
  ];
  b.path(smooth(kidney, 6).map(onPalette), true);
  const circle = (cu: number, cv: number, r: number, n: number) => {
    const pts: Vec3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(onPalette([cu + Math.cos(a) * r, cv + Math.sin(a) * r]));
    }
    b.path(pts, true);
  };
  circle(0.38, -0.08, 0.13, 10); // thumb hole
  for (const [u, v] of [
    [-0.5, 0.12],
    [-0.22, 0.3],
    [0.1, 0.33],
    [0.4, 0.24],
  ])
    circle(u, v, 0.08, 8);

  // Brush resting across the palette.
  const brushA = b.path([
    [1.75, -0.73, 0.72],
    [2.95, 0.42, 0.82],
  ]);
  const brushB = b.path([
    [1.81, -0.79, 0.72],
    [3.01, 0.36, 0.82],
  ]);
  b.link(brushA, brushB);
  b.path([
    [2.95, 0.42, 0.82],
    [3.14, 0.57, 0.84],
    [3.01, 0.36, 0.82],
  ]);

  return b.build();
}
