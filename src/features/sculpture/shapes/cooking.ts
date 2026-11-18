import type { Shape, Vec3 } from '../types';
import { ShapeBuilder } from './builder';

/** A pot on a lit burner, a spoon resting in it, and steam curling up. */
export function cooking(): Shape {
  const b = new ShapeBuilder();
  const seg = 30;

  // Pot: near-straight walls drawn as staves from base to rim, with a rolled lip.
  const base = b.ring([0, -1.0, 0], 1.24, 1.24, 'xz', seg);
  const rim = b.ring([0, 0.2, 0], 1.32, 1.32, 'xz', seg);
  b.link(base, rim, 2);
  const lip = b.ring([0, 0.27, 0], 1.42, 1.42, 'xz', seg);
  b.link(rim, lip, 5);
  b.ring([0, 0.12, 0], 1.18, 1.18, 'xz', seg); // the surface of what's cooking

  // Two loop handles.
  for (const side of [-1, 1]) {
    const top = b.path([
      [side * 1.34, 0.08, 0.24],
      [side * 1.82, 0.08, 0.24],
      [side * 1.82, 0.08, -0.24],
      [side * 1.34, 0.08, -0.24],
    ]);
    const under = b.path([
      [side * 1.34, -0.06, 0.24],
      [side * 1.82, -0.06, 0.24],
      [side * 1.82, -0.06, -0.24],
      [side * 1.34, -0.06, -0.24],
    ]);
    b.link(top, under);
  }

  // Wooden spoon leaning out over the rim.
  const spoonA = b.path([
    [0.25, -0.35, 0.3],
    [1.95, 1.3, 0.42],
  ]);
  const spoonB = b.path([
    [0.33, -0.43, 0.3],
    [2.03, 1.22, 0.42],
  ]);
  b.link(spoonA, spoonB);
  b.ring([2.02, 1.3, 0.42], 0.11, 0.07, 'xy', 10);

  // Steam: three wisps that widen and wander as they rise.
  const wisps: [number, number, number][] = [
    [-0.55, 1.05, 0.0],
    [0.0, 1.35, 1.7],
    [0.5, 0.95, 3.1],
  ];
  for (const [x0, height, phase] of wisps) {
    const wisp: Vec3[] = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      wisp.push([
        x0 + Math.sin(t * Math.PI * 2.4 + phase) * 0.2 * (0.35 + t),
        0.3 + t * height,
        Math.cos(t * Math.PI * 1.7 + phase) * 0.14 * (0.3 + t),
      ]);
    }
    b.path(wisp);
  }

  // Burner: a plate wider than the pot, so the two read as separate things,
  // with a ring of short flames in the gap between them.
  const plateY = -1.56;
  b.ring([0, plateY, 0], 1.62, 1.62, 'xz', seg);
  const flames = 9;
  const flameR = 0.8;
  for (let i = 0; i < flames; i++) {
    const a = (i / flames) * Math.PI * 2;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const tall = i % 2 === 0 ? 0.52 : 0.4;
    // `side` runs along the ring, so each teardrop faces outward.
    const at = (side: number, rise: number): Vec3 => [
      cx * flameR - cz * side,
      plateY + rise,
      cz * flameR + cx * side,
    ];
    b.path(
      [
        at(-0.06, 0),
        at(-0.15, tall * 0.34),
        at(-0.07, tall * 0.72),
        at(0.02, tall),
        at(0.09, tall * 0.62),
        at(0.15, tall * 0.3),
        at(0.06, 0),
      ],
      true
    );
  }

  return b.build();
}
