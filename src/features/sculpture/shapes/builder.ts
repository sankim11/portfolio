import type { Shape, Vec2, Vec3 } from '../types';

type Plane = 'xy' | 'xz' | 'yz';

/**
 * Small drawing kit for wireframes. A shape is a set of paths and rings; the
 * sculpture scatters its particles along them, so longer lines read brighter.
 */
export class ShapeBuilder {
  private readonly points: number[][] = [];
  private readonly edges: number[][] = [];

  /** Joins the given points in order. Returns their indices. */
  path(pts: Vec3[], closed = false): number[] {
    const start = this.points.length;
    for (const p of pts) this.points.push([p[0], p[1], p[2]]);
    const ids = pts.map((_, i) => start + i);
    for (let i = 0; i + 1 < ids.length; i++) this.edges.push([ids[i], ids[i + 1]]);
    if (closed && ids.length > 2) this.edges.push([ids[ids.length - 1], ids[0]]);
    return ids;
  }

  /** An ellipse lying in one of the three planes. */
  ring(center: Vec3, ra: number, rb: number, plane: Plane = 'xz', segments = 24): number[] {
    const pts: Vec3[] = [];
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const a = Math.cos(t) * ra;
      const b = Math.sin(t) * rb;
      if (plane === 'xz') pts.push([center[0] + a, center[1], center[2] + b]);
      else if (plane === 'xy') pts.push([center[0] + a, center[1] + b, center[2]]);
      else pts.push([center[0], center[1] + a, center[2] + b]);
    }
    return this.path(pts, true);
  }

  /** Joins two paths point for point, taking every `step`-th pair. */
  link(a: number[], b: number[], step = 1): void {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += step) this.edges.push([a[i], b[i]]);
  }

  /** Applies a transform to every point drawn so far. */
  transform(fn: (p: number[]) => Vec3): this {
    for (let i = 0; i < this.points.length; i++) this.points[i] = fn(this.points[i]);
    return this;
  }

  build(): Shape {
    return { points: this.points, edges: this.edges };
  }
}

/** Rotation about the X axis, for tipping a flat drawing back into the scene. */
export const tiltX =
  (angle: number) =>
  (p: number[]): Vec3 => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  };

/** Rounds a polygon into a smooth outline (Catmull-Rom through the given points). */
export function smooth(points: Vec2[], perSegment = 8, closed = true): Vec2[] {
  const n = points.length;
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const out: Vec2[] = [];
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(points[n - 1]);
  return out;
}
