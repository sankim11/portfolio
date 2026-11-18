import type { Shape, Vec2, Vec3 } from '../types';
import { ShapeBuilder, smooth, tiltX } from './builder';

/** A gamepad: one clean silhouette with grips, sticks, d-pad and face buttons. */
export function gaming(): Shape {
  const b = new ShapeBuilder();

  // Right half of the silhouette, top centre round to bottom centre; mirrored for the left.
  const right: Vec2[] = [
    [0.0, 0.66],
    [0.85, 0.74],
    [1.55, 0.66],
    [2.0, 0.3],
    [2.2, -0.35],
    [2.16, -1.0],
    [1.82, -1.34],
    [1.42, -1.1],
    [1.05, -0.58],
    [0.5, -0.42],
  ];
  const left = right
    .slice(1)
    .reverse()
    .map(([x, y]): Vec2 => [-x, y]);
  const outline = smooth([...right, [0, -0.4], ...left], 7);

  const depth = 0.2;
  const front = b.path(outline.map(([x, y]): Vec3 => [x, y, depth]), true);
  const back = b.path(outline.map(([x, y]): Vec3 => [x, y, -depth]), true);
  b.link(front, back, 6);

  const face = depth + 0.03;

  // D-pad: a plus sign on the left.
  const dx = -1.18;
  const dy = 0.12;
  const arm = 0.3;
  const neck = 0.1;
  b.path(
    [
      [dx - arm, dy + neck, face],
      [dx - neck, dy + neck, face],
      [dx - neck, dy + arm, face],
      [dx + neck, dy + arm, face],
      [dx + neck, dy + neck, face],
      [dx + arm, dy + neck, face],
      [dx + arm, dy - neck, face],
      [dx + neck, dy - neck, face],
      [dx + neck, dy - arm, face],
      [dx - neck, dy - arm, face],
      [dx - neck, dy - neck, face],
      [dx - arm, dy - neck, face],
    ],
    true
  );

  // Four face buttons in a diamond on the right.
  for (const [ox, oy] of [
    [0, 0.27],
    [0.27, 0],
    [0, -0.27],
    [-0.27, 0],
  ])
    b.ring([1.18 + ox, 0.12 + oy, face], 0.11, 0.11, 'xy', 12);

  // Two thumbsticks: a well and a cap raised off the face.
  for (const sx of [-0.52, 0.52]) {
    const well = b.ring([sx, -0.48, face], 0.3, 0.3, 'xy', 20);
    const cap = b.ring([sx, -0.48, face + 0.16], 0.19, 0.19, 'xy', 20);
    b.link(well, cap, 5);
    b.ring([sx, -0.48, face + 0.16], 0.08, 0.08, 'xy', 10);
  }

  // Centre: touch bar, home button and the two small menu buttons.
  b.path(
    [
      [-0.42, 0.42, face],
      [0.42, 0.42, face],
      [0.36, 0.14, face],
      [-0.36, 0.14, face],
    ],
    true
  );
  b.ring([0, -0.08, face], 0.09, 0.09, 'xy', 10);
  for (const sx of [-0.62, 0.62]) b.ring([sx, 0.36, face], 0.07, 0.035, 'xy', 8);

  // Shoulder bumpers rising behind the top edge.
  for (const side of [-1, 1]) {
    const lower = b.path([
      [side * 0.75, 0.74, -depth],
      [side * 1.15, 0.82, -depth],
      [side * 1.62, 0.7, -depth],
    ]);
    const upper = b.path([
      [side * 0.78, 0.92, -depth - 0.12],
      [side * 1.18, 1.0, -depth - 0.12],
      [side * 1.6, 0.86, -depth - 0.12],
    ]);
    b.link(lower, upper);
  }

  // Tip the pad back a little so its depth reads.
  return b.transform(tiltX(-0.32)).build();
}
