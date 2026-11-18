import type { Shape } from '../types';

/** A green with the cup and flagstick, a ball short of the hole, and a putter. */
export function golf(): Shape {
  const pts: number[][] = [];
  const edges: number[][] = [];
  const gy = -1.4;

  function ring(cx: number, cz: number, rx: number, rz: number, n: number) {
    const st = pts.length;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, gy, cz + Math.sin(a) * rz]);
    }
    for (let i = 0; i < n; i++) edges.push([st + i, st + ((i + 1) % n)]);
  }

  // The green: an outer edge and a fringe, with the cup cut into it.
  ring(0, 0, 3.0, 1.45, 34);
  ring(0.1, 0, 2.2, 1.0, 26);
  const cupX = 0.75;
  ring(cupX, 0, 0.24, 0.12, 12);

  // Flagstick rising out of the cup.
  const stickTop = 1.75;
  const stick = pts.length;
  const stickSegs = 9;
  for (let i = 0; i <= stickSegs; i++)
    pts.push([cupX, gy + ((stickTop - gy) * i) / stickSegs, 0]);
  for (let i = 0; i < stickSegs; i++) edges.push([stick + i, stick + i + 1]);

  // Flag: a pennant with a gentle ripple, built as a small mesh.
  const flagRows = 4;
  const flagCols = 5;
  const flag = pts.length;
  for (let r = 0; r <= flagRows; r++) {
    for (let c = 0; c <= flagCols; c++) {
      const u = c / flagCols;
      const v = r / flagRows;
      const taper = 1 - u; // narrows to a point at the fly end
      const y = stickTop - 0.35 - (v - 0.5) * 0.7 * taper;
      pts.push([cupX + u * 1.25, y, Math.sin(u * Math.PI * 1.5) * 0.14]);
    }
  }
  const fIdx = (r: number, c: number) => flag + r * (flagCols + 1) + c;
  for (let r = 0; r <= flagRows; r++)
    for (let c = 0; c < flagCols; c++) edges.push([fIdx(r, c), fIdx(r, c + 1)]);
  for (let c = 0; c <= flagCols; c++)
    for (let r = 0; r < flagRows; r++) edges.push([fIdx(r, c), fIdx(r + 1, c)]);

  // Ball resting short of the cup: three great circles.
  const bc = [-0.9, gy + 0.2, 0.45];
  const br = 0.2;
  for (let axis = 0; axis < 3; axis++) {
    const st = pts.length;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * br;
      const y = Math.sin(a) * br;
      if (axis === 0) pts.push([bc[0] + x, bc[1] + y, bc[2]]);
      else if (axis === 1) pts.push([bc[0] + x, bc[1], bc[2] + y]);
      else pts.push([bc[0], bc[1] + x, bc[2] + y]);
    }
    for (let i = 0; i < n; i++) edges.push([st + i, st + ((i + 1) % n)]);
  }

  // Putter leaning in from the left: grip, shaft and a blade head.
  const gripTop = [-2.75, 1.25, 0.1];
  const hosel = [-1.95, gy + 0.22, 0.45];
  const shaft = pts.length;
  const shaftSegs = 8;
  for (let i = 0; i <= shaftSegs; i++) {
    const t = i / shaftSegs;
    pts.push([
      gripTop[0] + (hosel[0] - gripTop[0]) * t,
      gripTop[1] + (hosel[1] - gripTop[1]) * t,
      gripTop[2] + (hosel[2] - gripTop[2]) * t,
    ]);
  }
  for (let i = 0; i < shaftSegs; i++) edges.push([shaft + i, shaft + i + 1]);
  // Grip: a short thicker sleeve at the top of the shaft.
  const grip = pts.length;
  for (const off of [-0.05, 0.05]) {
    pts.push([gripTop[0] + off, gripTop[1], gripTop[2]]);
    pts.push([gripTop[0] + 0.24 + off, gripTop[1] - 0.75, gripTop[2] + 0.1]);
  }
  edges.push([grip, grip + 1], [grip + 2, grip + 3], [grip, grip + 2], [grip + 1, grip + 3]);
  // Head: a low box sitting on the green behind the ball.
  const hx = hosel[0];
  const hz = hosel[2];
  const head = pts.length;
  for (const y of [gy + 0.02, gy + 0.22])
    for (const [dx, dz] of [
      [-0.1, -0.32],
      [0.14, -0.32],
      [0.14, 0.32],
      [-0.1, 0.32],
    ])
      pts.push([hx + dx, y, hz + dz]);
  for (let k = 0; k < 2; k++)
    for (let i = 0; i < 4; i++) edges.push([head + k * 4 + i, head + k * 4 + ((i + 1) % 4)]);
  for (let i = 0; i < 4; i++) edges.push([head + i, head + 4 + i]);

  // Lift the whole scene so the green clears the caption beneath it.
  for (const pt of pts) pt[1] += 0.35;

  return { points: pts, edges };
}
