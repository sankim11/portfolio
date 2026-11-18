import { useEffect, useRef, useState } from 'react';

import { hobbies } from '../data/hobbies';
import { prefersReducedMotion } from '../motion';

/** How long each pursuit stays up while the tabs cycle on their own. */
const CYCLE_MS = 5200;

const OffHours = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>('bjj');
  // When the tabs don't all fit (phones), they cycle on their own so it is
  // obvious there are more, until the visitor touches the tabs or the model.
  const [auto, setAuto] = useState(true);
  const [overflows, setOverflows] = useState(false);
  const cycling = auto && overflows && !prefersReducedMotion();
  // Use ref to allow Three.js morph trigger from any source
  const setHobbyRef = useRef<(id: string) => void>(() => {});

  const active = hobbies.find((h) => h.id === activeId) || hobbies[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded');
      return;
    }

    let renderer: any, scene: any, camera: any;
    let pointsMesh: any, linesMesh: any;
    let pointPositions: Float32Array;
    let edgeIndices: Uint16Array;
    let currentTargets: number[][];
    let nextTargets: number[][] = [];
    let morphStart = 0;
    const morphDur = 1100;
    let morphing = false;
    let currentId = 'bjj';
    let running = false;
    let raf = 0;
    const t0 = performance.now();

    const N = 560;

    function pad(targets: { points: number[][]; edges: number[][] }) {
      const pts = targets.points.slice();
      const edges = targets.edges || [];
      while (pts.length < N) {
        if (edges.length) {
          const [a, b] = edges[Math.floor(Math.random() * edges.length)];
          const pa = pts[a],
            pb = pts[b];
          if (pa && pb) {
            const t = Math.random();
            pts.push([
              pa[0] + (pb[0] - pa[0]) * t,
              pa[1] + (pb[1] - pa[1]) * t,
              pa[2] + (pb[2] - pa[2]) * t,
            ]);
            continue;
          }
        }
        pts.push(pts[pts.length - 1].slice());
      }
      return { points: pts.slice(0, N), edges };
    }

    function buildGamingTargets() {
      const pts: number[][] = [];
      const edges: number[][] = [];

      function extrudeRing(profile: number[][], depth: number, zFront: number) {
        const n = profile.length;
        const frontStart = pts.length;
        profile.forEach(([x, y]) => pts.push([x, y, zFront]));
        const backStart = pts.length;
        profile.forEach(([x, y]) => pts.push([x, y, zFront - depth]));
        for (let i = 0; i < n; i++)
          edges.push([frontStart + i, frontStart + ((i + 1) % n)]);
        for (let i = 0; i < n; i++)
          edges.push([backStart + i, backStart + ((i + 1) % n)]);
        const stride = Math.max(1, Math.floor(n / 16));
        for (let i = 0; i < n; i += stride)
          edges.push([frontStart + i, backStart + i]);
        return { frontStart, backStart, n };
      }

      function extrudeStrip(profile: number[][], depth: number, zFront: number) {
        const n = profile.length;
        const frontStart = pts.length;
        profile.forEach(([x, y]) => pts.push([x, y, zFront]));
        const backStart = pts.length;
        profile.forEach(([x, y]) => pts.push([x, y, zFront - depth]));
        for (let i = 0; i < n; i++)
          edges.push([frontStart + i, frontStart + ((i + 1) % n)]);
        for (let i = 0; i < n; i++)
          edges.push([backStart + i, backStart + ((i + 1) % n)]);
        const stride = Math.max(1, Math.floor(n / 8));
        for (let i = 0; i < n; i += stride)
          edges.push([frontStart + i, backStart + i]);
        return { frontStart, backStart };
      }

      const bodyProf: number[][] = [];
      const bodyN = 60;
      for (let i = 0; i < bodyN; i++) {
        const t = (i / bodyN) * Math.PI * 2;
        let x = Math.cos(t) * 1.85;
        let y = Math.sin(t) * 0.6;
        if (Math.sin(t) > 0) {
          const dip = Math.max(0, 1 - Math.abs(Math.cos(t)) * 4) * 0.18;
          y -= dip;
        }
        if (Math.sin(t) < -0.3) {
          const gripFactor = (-Math.sin(t) - 0.3) / 0.7;
          x *= 1 + 0.18 * gripFactor;
          y -= 0.55 * gripFactor;
        }
        bodyProf.push([x, y]);
      }
      extrudeRing(bodyProf, 0.55, 0.28);

      const dCx = -0.95,
        dCy = 0.25;
      const dWellR = 0.36;
      const dWellProf: number[][] = [];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        dWellProf.push([dCx + Math.cos(a) * dWellR, dCy + Math.sin(a) * dWellR]);
      }
      extrudeRing(dWellProf, 0.18, 0.4);

      const arm = 0.2,
        neck = 0.06;
      const dpadProf: number[][] = [
        [dCx - arm, dCy + neck],
        [dCx - neck, dCy + neck],
        [dCx - neck, dCy + arm],
        [dCx + neck, dCy + arm],
        [dCx + neck, dCy + neck],
        [dCx + arm, dCy + neck],
        [dCx + arm, dCy - neck],
        [dCx + neck, dCy - neck],
        [dCx + neck, dCy - arm],
        [dCx - neck, dCy - arm],
        [dCx - neck, dCy - neck],
        [dCx - arm, dCy - neck],
      ];
      extrudeStrip(dpadProf, 0.1, 0.5);

      const lwCx = -0.55,
        lwCy = -0.35;
      const lwR = 0.42;
      const lwProf: number[][] = [];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        lwProf.push([lwCx + Math.cos(a) * lwR, lwCy + Math.sin(a) * lwR]);
      }
      extrudeRing(lwProf, 0.22, 0.4);

      const lsR_top = 0.18,
        lsR_skirt = 0.24;
      const lsTop_z = 0.62,
        lsSkirt_z = 0.42;
      const lsTopS = pts.length;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        pts.push([
          lwCx + Math.cos(a) * lsR_top,
          lwCy + Math.sin(a) * lsR_top,
          lsTop_z,
        ]);
      }
      for (let i = 0; i < 16; i++) edges.push([lsTopS + i, lsTopS + ((i + 1) % 16)]);
      const lsSkS = pts.length;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        pts.push([
          lwCx + Math.cos(a) * lsR_skirt,
          lwCy + Math.sin(a) * lsR_skirt,
          lsSkirt_z,
        ]);
      }
      for (let i = 0; i < 16; i++) edges.push([lsSkS + i, lsSkS + ((i + 1) % 16)]);
      for (let i = 0; i < 16; i += 4) edges.push([lsTopS + i, lsSkS + i]);
      pts.push([lwCx, lwCy, lsTop_z + 0.05]);

      const rwCx = 0.55,
        rwCy = -0.35;
      const rwR = 0.42;
      const rwProf: number[][] = [];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        rwProf.push([rwCx + Math.cos(a) * rwR, rwCy + Math.sin(a) * rwR]);
      }
      extrudeRing(rwProf, 0.22, 0.4);
      const rsR_top = 0.18,
        rsR_skirt = 0.24;
      const rsTop_z = 0.62,
        rsSkirt_z = 0.42;
      const rsTopS = pts.length;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        pts.push([
          rwCx + Math.cos(a) * rsR_top,
          rwCy + Math.sin(a) * rsR_top,
          rsTop_z,
        ]);
      }
      for (let i = 0; i < 16; i++) edges.push([rsTopS + i, rsTopS + ((i + 1) % 16)]);
      const rsSkS = pts.length;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        pts.push([
          rwCx + Math.cos(a) * rsR_skirt,
          rwCy + Math.sin(a) * rsR_skirt,
          rsSkirt_z,
        ]);
      }
      for (let i = 0; i < 16; i++) edges.push([rsSkS + i, rsSkS + ((i + 1) % 16)]);
      for (let i = 0; i < 16; i += 4) edges.push([rsTopS + i, rsSkS + i]);
      pts.push([rwCx, rwCy, rsTop_z + 0.05]);

      const fbCx = 0.95,
        fbCy = 0.25;
      const offs: number[][] = [
        [0, 0.24],
        [0.24, 0],
        [0, -0.24],
        [-0.24, 0],
      ];
      offs.forEach(([ox, oy]) => {
        const cx = fbCx + ox,
          cy = fbCy + oy;
        const prof: number[][] = [];
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          prof.push([cx + Math.cos(a) * 0.085, cy + Math.sin(a) * 0.085]);
        }
        extrudeRing(prof, 0.1, 0.46);
      });

      function pillProf(cx: number, cy: number, w: number, h: number) {
        const segs = 12;
        const r = h / 2;
        const prof: number[][] = [];
        for (let i = 0; i < segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          let x: number;
          if (Math.cos(a) > 0) x = w / 2 - r + Math.cos(a) * r;
          else x = -(w / 2 - r) + Math.cos(a) * r;
          const y = Math.sin(a) * r;
          prof.push([cx + x, cy + y]);
        }
        return prof;
      }
      extrudeRing(pillProf(-0.16, 0.18, 0.22, 0.1), 0.06, 0.42);
      extrudeRing(pillProf(0.16, 0.18, 0.22, 0.1), 0.06, 0.42);

      const lgC = [0, -0.05, 0.4];
      const lg1 = pts.length;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        pts.push([
          lgC[0] + Math.cos(a) * 0.1,
          lgC[1] + Math.sin(a) * 0.1,
          lgC[2],
        ]);
      }
      for (let i = 0; i < 14; i++) edges.push([lg1 + i, lg1 + ((i + 1) % 14)]);
      const lg2 = pts.length;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        pts.push([
          lgC[0] + Math.cos(a) * 0.1,
          lgC[1],
          lgC[2] + Math.sin(a) * 0.1,
        ]);
      }
      for (let i = 0; i < 14; i++) edges.push([lg2 + i, lg2 + ((i + 1) % 14)]);

      function bar(p1: number[], p2: number[], depth: number) {
        const a = pts.length;
        pts.push([p1[0], p1[1], 0.4], [p2[0], p2[1], 0.4]);
        pts.push(
          [p1[0], p1[1], 0.4 - depth],
          [p2[0], p2[1], 0.4 - depth]
        );
        edges.push([a, a + 1], [a + 2, a + 3], [a, a + 2], [a + 1, a + 3]);
      }
      bar([-1.78, 0.62], [-1.45, 0.78], 0.2);
      bar([1.45, 0.78], [1.78, 0.62], 0.2);

      return pad({ points: pts, edges });
    }

    function buildPaintingTargets() {
      const pts: number[][] = [];
      const edges: number[][] = [];

      const eTop = [0, 1.4, 0];
      const eL = [-0.9, -1.1, 0.2];
      const eR = [0.9, -1.1, 0.2];
      const eBack = [0, -1.0, -0.8];
      const eStart = pts.length;
      pts.push(eTop, eL, eR, eBack);
      edges.push([eStart, eStart + 1], [eStart, eStart + 2], [eStart, eStart + 3]);
      const cb1 = [-0.45, -0.3, 0.1];
      const cb2 = [0.45, -0.3, 0.1];
      const cbStart = pts.length;
      pts.push(cb1, cb2);
      edges.push([cbStart, cbStart + 1]);

      const cv: number[][] = [
        [-0.9, 0.9, 0.05],
        [0.9, 0.9, 0.05],
        [0.9, -0.3, 0.05],
        [-0.9, -0.3, 0.05],
      ];
      const cvStart = pts.length;
      cv.forEach((p) => pts.push(p));
      edges.push(
        [cvStart, cvStart + 1],
        [cvStart + 1, cvStart + 2],
        [cvStart + 2, cvStart + 3],
        [cvStart + 3, cvStart]
      );

      const archC = [0.4, 0.2, 0.07];
      const archStart = pts.length;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (i / 10);
        pts.push([
          archC[0] + Math.cos(a) * 0.25,
          archC[1] + Math.sin(a) * 0.25,
          archC[2],
        ]);
      }
      for (let i = 0; i < 10; i++) edges.push([archStart + i, archStart + i + 1]);
      pts.push([archC[0] - 0.25, archC[1] - 0.45, archC[2]]);
      pts.push([archC[0] + 0.25, archC[1] - 0.45, archC[2]]);
      edges.push([archStart, archStart + 11]);
      edges.push([archStart + 10, archStart + 12]);

      const tierStart = pts.length;
      const tiers: number[][] = [
        [-0.7, -0.2],
        [-0.6, 0.0],
        [-0.5, 0.2],
        [-0.4, 0.4],
      ];
      tiers.forEach(([x, y], i) => {
        const w = 0.5 - i * 0.07;
        pts.push([x - w / 2, y, 0.07], [x + w / 2, y, 0.07]);
      });
      for (let i = 0; i < tiers.length; i++) {
        edges.push([tierStart + i * 2, tierStart + i * 2 + 1]);
        if (i > 0) edges.push([tierStart + (i - 1) * 2, tierStart + i * 2]);
      }

      const palC = [2.2, -1.3, 0.3];
      const palStart = pts.length;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        pts.push([
          palC[0] + Math.cos(a) * 0.7,
          palC[1] + Math.sin(a) * 0.35,
          palC[2],
        ]);
      }
      for (let i = 0; i < 18; i++) edges.push([palStart + i, palStart + ((i + 1) % 18)]);
      const thStart = pts.length;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pts.push([
          palC[0] - 0.4 + Math.cos(a) * 0.12,
          palC[1] + Math.sin(a) * 0.08,
          palC[2],
        ]);
      }
      for (let i = 0; i < 8; i++) edges.push([thStart + i, thStart + ((i + 1) % 8)]);

      const bStart = pts.length;
      pts.push([2.0, 0.6, 0.3], [3.2, 1.4, 0.3], [3.4, 1.55, 0.3]);
      edges.push([bStart, bStart + 1], [bStart + 1, bStart + 2]);
      pts.push([3.05, 1.32, 0.3], [3.15, 1.48, 0.3]);
      edges.push([bStart + 3, bStart + 4]);

      return pad({ points: pts, edges });
    }

    function buildBjjTargets() {
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

      return pad({ points: pts, edges });
    }

    function buildCookingTargets() {
      const pts: number[][] = [];
      const edges: number[][] = [];

      const hatCx = 0.0,
        hatCz = 0.0;
      const brimY = 0.2;
      const brimH = 0.45;
      const brimR = 0.55;
      const topY = 2.4;

      const brimSegs = 18;
      const brimBotS = pts.length;
      for (let i = 0; i < brimSegs; i++) {
        const a = (i / brimSegs) * Math.PI * 2;
        pts.push([hatCx + Math.cos(a) * brimR, brimY, hatCz + Math.sin(a) * brimR]);
      }
      for (let i = 0; i < brimSegs; i++)
        edges.push([brimBotS + i, brimBotS + ((i + 1) % brimSegs)]);
      const brimTopS = pts.length;
      for (let i = 0; i < brimSegs; i++) {
        const a = (i / brimSegs) * Math.PI * 2;
        pts.push([
          hatCx + Math.cos(a) * brimR,
          brimY + brimH,
          hatCz + Math.sin(a) * brimR,
        ]);
      }
      for (let i = 0; i < brimSegs; i++)
        edges.push([brimTopS + i, brimTopS + ((i + 1) % brimSegs)]);
      for (let i = 0; i < brimSegs; i += 2) edges.push([brimBotS + i, brimTopS + i]);

      const capRings = [
        { y: brimY + brimH + 0.08, r: brimR * 0.8 },
        { y: brimY + brimH + 0.55, r: brimR * 1.18 },
        { y: brimY + brimH + 1.05, r: brimR * 1.28 },
        { y: brimY + brimH + 1.55, r: brimR * 1.18 },
        { y: topY - 0.15, r: brimR * 0.85 },
      ];
      const capRingStarts: number[] = [];
      capRings.forEach(({ y, r }) => {
        const s = pts.length;
        capRingStarts.push(s);
        for (let i = 0; i < brimSegs; i++) {
          const a = (i / brimSegs) * Math.PI * 2;
          const flute = 1 + Math.cos(a * 6) * 0.04;
          pts.push([
            hatCx + Math.cos(a) * r * flute,
            y,
            hatCz + Math.sin(a) * r * flute,
          ]);
        }
        for (let i = 0; i < brimSegs; i++) edges.push([s + i, s + ((i + 1) % brimSegs)]);
      });
      for (let i = 0; i < brimSegs; i += 2) {
        edges.push([brimTopS + i, capRingStarts[0] + i]);
        for (let r = 0; r < capRingStarts.length - 1; r++) {
          edges.push([capRingStarts[r] + i, capRingStarts[r + 1] + i]);
        }
      }
      const apex = pts.length;
      pts.push([hatCx, topY, hatCz]);
      for (let i = 0; i < brimSegs; i += 3)
        edges.push([capRingStarts[capRingStarts.length - 1] + i, apex]);

      const knifeCx = -2.6;
      const knifeY = -0.95;
      const knifeProfile: number[][] = [
        [-1.5, 0.0],
        [-1.4, 0.1],
        [-0.4, 0.12],
        [0.3, 0.1],
        [0.4, 0.16],
        [0.55, 0.16],
        [1.3, 0.13],
        [1.35, 0.05],
        [1.35, -0.05],
        [1.3, -0.13],
        [0.55, -0.16],
        [0.4, -0.16],
        [0.3, -0.1],
        [-0.3, -0.18],
        [-0.9, -0.14],
        [-1.2, -0.06],
      ];
      const knifeDepth = 0.1;
      function extrudeProfile(
        profile: number[][],
        cx: number,
        cy: number,
        depth: number
      ) {
        const n = profile.length;
        const front = pts.length;
        profile.forEach(([x, y]) => pts.push([cx + x, cy + y, depth / 2]));
        const back = pts.length;
        profile.forEach(([x, y]) => pts.push([cx + x, cy + y, -depth / 2]));
        for (let i = 0; i < n; i++) edges.push([front + i, front + ((i + 1) % n)]);
        for (let i = 0; i < n; i++) edges.push([back + i, back + ((i + 1) % n)]);
        const stride = Math.max(1, Math.floor(n / 12));
        for (let i = 0; i < n; i += stride) edges.push([front + i, back + i]);
        return { front, back, n };
      }
      extrudeProfile(knifeProfile, knifeCx, knifeY, knifeDepth);

      [0.75, 1.05].forEach((rx) => {
        const rivetS = pts.length;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          pts.push([
            knifeCx + rx + Math.cos(a) * 0.05,
            knifeY + Math.sin(a) * 0.05,
            knifeDepth / 2 + 0.005,
          ]);
        }
        for (let i = 0; i < 6; i++) edges.push([rivetS + i, rivetS + ((i + 1) % 6)]);
      });

      const panCx = 2.5,
        panCz = 0.0,
        panY = -0.7;
      const panR = 1.05;
      const panH = 0.4;
      const panSegs = 16;

      const panBotS = pts.length;
      for (let i = 0; i < panSegs; i++) {
        const a = (i / panSegs) * Math.PI * 2;
        pts.push([panCx + Math.cos(a) * panR, panY, panCz + Math.sin(a) * panR]);
      }
      for (let i = 0; i < panSegs; i++)
        edges.push([panBotS + i, panBotS + ((i + 1) % panSegs)]);

      const panTopS = pts.length;
      for (let i = 0; i < panSegs; i++) {
        const a = (i / panSegs) * Math.PI * 2;
        pts.push([
          panCx + Math.cos(a) * panR * 1.05,
          panY + panH,
          panCz + Math.sin(a) * panR * 1.05,
        ]);
      }
      for (let i = 0; i < panSegs; i++)
        edges.push([panTopS + i, panTopS + ((i + 1) % panSegs)]);

      for (let i = 0; i < panSegs; i += 2) edges.push([panBotS + i, panTopS + i]);

      const panCenterIdx = pts.length;
      pts.push([panCx, panY, panCz]);
      for (let i = 0; i < panSegs; i += 4) edges.push([panBotS + i, panCenterIdx]);

      const handleStart = panCx + panR * 1.05;
      const handleEnd = handleStart + 1.55;
      const hY1 = panY + panH * 0.55;
      const hY2 = panY + panH * 0.85;
      const hZ1 = -0.08;
      const hZ2 = 0.08;
      const hS = pts.length;
      pts.push([handleStart, hY1, hZ1]);
      pts.push([handleEnd, hY1, hZ1]);
      pts.push([handleEnd, hY2, hZ1]);
      pts.push([handleStart, hY2, hZ1]);
      pts.push([handleStart, hY1, hZ2]);
      pts.push([handleEnd, hY1, hZ2]);
      pts.push([handleEnd, hY2, hZ2]);
      pts.push([handleStart, hY2, hZ2]);
      edges.push([hS, hS + 1], [hS + 1, hS + 2], [hS + 2, hS + 3], [hS + 3, hS]);
      edges.push(
        [hS + 4, hS + 5],
        [hS + 5, hS + 6],
        [hS + 6, hS + 7],
        [hS + 7, hS + 4]
      );
      edges.push([hS, hS + 4], [hS + 1, hS + 5], [hS + 2, hS + 6], [hS + 3, hS + 7]);

      const holeC = [handleEnd - 0.18, (hY1 + hY2) / 2, 0];
      const holeS = pts.length;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pts.push([
          holeC[0] + Math.cos(a) * 0.06,
          holeC[1] + Math.sin(a) * 0.06,
          hZ1 + 0.005,
        ]);
      }
      for (let i = 0; i < 8; i++) edges.push([holeS + i, holeS + ((i + 1) % 8)]);

      return pad({ points: pts, edges });
    }

    function buildVentureTargets() {
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

      return pad({ points: pts, edges });
    }

    function buildFootballTargets() {
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

      return pad({ points: pts, edges });
    }

    const TARGETS: Record<string, { points: number[][]; edges: number[][] }> = {
      bjj: buildBjjTargets(),
      cooking: buildCookingTargets(),
      painting: buildPaintingTargets(),
      gaming: buildGamingTargets(),
      venture: buildVentureTargets(),
      football: buildFootballTargets(),
    };

    let MAX_EDGES = 0;
    Object.values(TARGETS).forEach((t) => {
      MAX_EDGES = Math.max(MAX_EDGES, t.edges.length);
    });

    function setEdgesForTarget(id: string) {
      const t = TARGETS[id];
      const edges = t.edges;
      for (let e = 0; e < MAX_EDGES; e++) {
        if (e < edges.length) {
          edgeIndices[e * 2] = edges[e][0];
          edgeIndices[e * 2 + 1] = edges[e][1];
        } else {
          edgeIndices[e * 2] = 0;
          edgeIndices[e * 2 + 1] = 0;
        }
      }
      if (linesMesh) {
        linesMesh.geometry.index.needsUpdate = true;
        linesMesh.geometry.setDrawRange(0, edges.length * 2);
      }
    }

    function startMorph(toId: string) {
      if (!TARGETS[toId]) return;
      if (toId === currentId && !morphing) return;
      nextTargets = TARGETS[toId].points;
      currentTargets = [];
      for (let i = 0; i < N; i++) {
        currentTargets.push([
          pointPositions[i * 3],
          pointPositions[i * 3 + 1],
          pointPositions[i * 3 + 2],
        ]);
      }
      morphStart = performance.now();
      morphing = true;

      setTimeout(() => setEdgesForTarget(toId), morphDur * 0.5);

      currentId = toId;
    }

    function makeGlowSprite() {
      const size = 64;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      g.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
      g.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    }

    let pMatRef: any = null;
    let lMatRef: any = null;
    const POINT_BASE_SIZE = 0.14;

    function applyThemePalette() {
      const css = getComputedStyle(document.documentElement);
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      const lineHex = css.getPropertyValue('--chrome-2').trim() || '#bcc0ca';
      const pointHex = css.getPropertyValue('--text').trim() || '#f5f5f5';
      if (lMatRef) {
        lMatRef.opacity = dark ? 0.4 : 0.55;
        lMatRef.color.set(lineHex);
        lMatRef.needsUpdate = true;
      }
      if (pMatRef) {
        pMatRef.color.set(pointHex);
        pMatRef.opacity = 1.0;
      }
    }

    // Narrow stages: pull back so the widest model fits, and raise it above the copy.
    function frameCamera(w: number, h: number) {
      const aspect = w / h;
      if (aspect < 1.2) {
        camera.position.set(0, 0.3, Math.min(16, 8.6 / aspect));
        camera.lookAt(0, -1.1, 0);
      } else {
        camera.position.set(0, 0.3, 8);
        camera.lookAt(0, 0, 0);
      }
    }

    function initThree() {
      const w = canvas!.clientWidth,
        h = canvas!.clientHeight;
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      frameCamera(w, h);

      pointPositions = new Float32Array(N * 3);
      currentTargets = TARGETS[currentId].points.map((p: number[]) => p.slice());
      for (let i = 0; i < N; i++) {
        pointPositions[i * 3] = currentTargets[i][0];
        pointPositions[i * 3 + 1] = currentTargets[i][1];
        pointPositions[i * 3 + 2] = currentTargets[i][2];
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        map: makeGlowSprite(),
        size: POINT_BASE_SIZE,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        alphaTest: 0.001,
      });
      pMatRef = pMat;
      pointsMesh = new THREE.Points(pGeo, pMat);
      scene.add(pointsMesh);

      const lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
      edgeIndices = new Uint16Array(MAX_EDGES * 2);
      const idxAttr = new THREE.BufferAttribute(edgeIndices, 1);
      lGeo.setIndex(idxAttr);
      setEdgesForTarget(currentId);
      const lMat = new THREE.LineBasicMaterial({
        color: 0x4fb872,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      lMatRef = lMat;
      linesMesh = new THREE.LineSegments(lGeo, lMat);
      scene.add(linesMesh);

      applyThemePalette();

      return true;
    }

    const themeObs = new MutationObserver(applyThemePalette);
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    function resizeRenderer() {
      if (!renderer) return;
      const w = canvas!.clientWidth,
        h = canvas!.clientHeight;
      if (canvas!.width !== w || canvas!.height !== h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        frameCamera(w, h);
        camera.updateProjectionMatrix();
      }
    }
    window.addEventListener('resize', resizeRenderer);

    let userRotY = 0,
      userRotX = 0;
    let targetRotY = 0,
      targetRotX = 0;
    let dragVelY = 0,
      dragVelX = 0;
    let isDragging = false,
      lastX = 0,
      lastY = 0;
    let userInteracted = false;
    let autoIdleStrength = 1;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      isDragging = true;
      userInteracted = true;
      const p = 'touches' in e ? e.touches[0] : (e as MouseEvent);
      lastX = p.clientX;
      lastY = p.clientY;
      dragVelY = 0;
      dragVelX = 0;
      canvas!.style.cursor = 'grabbing';
      e.preventDefault();
    }
    function onPointerMove(e: MouseEvent | TouchEvent) {
      if (!isDragging) return;
      const p = 'touches' in e ? e.touches[0] : (e as MouseEvent);
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;
      const sens = 0.008;
      targetRotY += dx * sens;
      targetRotX += dy * sens;
      targetRotX = Math.max(-1.0, Math.min(1.0, targetRotX));
      dragVelY = dx * sens;
      dragVelX = dy * sens;
      e.preventDefault();
    }
    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      canvas!.style.cursor = 'grab';
    }
    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    setHobbyRef.current = (id: string) => {
      if (running) startMorph(id);
      else currentId = id;
    };

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const t = (now - t0) / 1000;

      if (morphing) {
        const k = Math.min(1, (now - morphStart) / morphDur);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        for (let i = 0; i < N; i++) {
          const a = currentTargets[i],
            b = nextTargets[i] || nextTargets[nextTargets.length - 1];
          const phase = (i % 7) * 0.04;
          const ke = Math.min(1, Math.max(0, e - phase));
          const ee =
            ke < 0.5 ? 4 * ke * ke * ke : 1 - Math.pow(-2 * ke + 2, 3) / 2;
          pointPositions[i * 3] = a[0] + (b[0] - a[0]) * ee;
          pointPositions[i * 3 + 1] = a[1] + (b[1] - a[1]) * ee;
          pointPositions[i * 3 + 2] = a[2] + (b[2] - a[2]) * ee;
        }
        if (k >= 1) morphing = false;
      } else {
        const targets = TARGETS[currentId].points;
        for (let i = 0; i < N; i++) {
          const tg = targets[i];
          const wob = 0.012;
          pointPositions[i * 3] = tg[0] + Math.sin(t * 0.6 + i * 0.3) * wob;
          pointPositions[i * 3 + 1] = tg[1] + Math.cos(t * 0.5 + i * 0.27) * wob;
          pointPositions[i * 3 + 2] = tg[2] + Math.sin(t * 0.4 + i * 0.21) * wob;
        }
      }

      pointsMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.position.needsUpdate = true;

      // Subtle pulse on point size — gives the constellation a slow breath.
      if (pMatRef) {
        pMatRef.size = POINT_BASE_SIZE + Math.sin(t * 0.9) * 0.012;
      }

      if (scene) {
        if (!isDragging) {
          targetRotY += dragVelY;
          targetRotX += dragVelX;
          targetRotX = Math.max(-1.0, Math.min(1.0, targetRotX));
          dragVelY *= 0.94;
          dragVelX *= 0.94;
          if (userInteracted)
            autoIdleStrength = Math.max(0, autoIdleStrength - 0.02);
        }
        userRotY += (targetRotY - userRotY) * 0.12;
        userRotX += (targetRotX - userRotX) * 0.12;
        const autoY = Math.sin(t * 0.3) * 0.32 * autoIdleStrength;
        const autoX = Math.sin(t * 0.22) * 0.08 * autoIdleStrength;
        scene.rotation.y = userRotY + autoY;
        scene.rotation.x = userRotX + autoX;
      }

      renderer.render(scene, camera);
    }

    let bootTimer: number | undefined;
    function bootThree() {
      if (running) return;
      if (canvas!.clientWidth === 0) {
        bootTimer = window.setTimeout(bootThree, 120);
        return;
      }
      if (!initThree()) {
        console.warn('Three.js not loaded');
        return;
      }
      running = true;
      animate();
    }
    bootThree();
    const onLoad = () => {
      if (!running) bootThree();
    };
    window.addEventListener('load', onLoad);

    return () => {
      cancelAnimationFrame(raf);
      if (bootTimer !== undefined) window.clearTimeout(bootTimer);
      window.removeEventListener('resize', resizeRenderer);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('load', onLoad);
      themeObs.disconnect();
      try {
        renderer && renderer.dispose && renderer.dispose();
      } catch {
        /* noop */
      }
    };
  }, []);

  // Trigger morph + intersection-observe enter on tag changes
  useEffect(() => {
    setHobbyRef.current(activeId);
  }, [activeId]);

  // Track whether the tab strip overflows, and which edges hide more tabs.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      setOverflows(max > 4);
      strip.toggleAttribute('data-more-start', strip.scrollLeft > 4);
      strip.toggleAttribute('data-more-end', strip.scrollLeft < max - 4);
    };
    update();
    strip.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(strip);
    return () => {
      strip.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  // Keep the selected tab centred in the strip. Scrolls the strip only, never the page.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !tab) return;
    strip.scrollTo({
      left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activeId]);

  // Step to the next pursuit while cycling, but only when the stage is on screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!cycling || !stage) return;
    let inView = false;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(stage);
    const id = window.setInterval(() => {
      if (!inView || document.hidden) return;
      if (document.documentElement.classList.contains('chat-open')) return;
      setActiveId((cur) => {
        const i = hobbies.findIndex((h) => h.id === cur);
        return hobbies[(i + 1) % hobbies.length].id;
      });
    }, CYCLE_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [cycling]);

  return (
    <section id="offhours" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="t-display-lg grad-title" data-reveal="title">
            Off-hours
          </h2>
          <p data-reveal data-i="2">What fills the week away from the keyboard. Drag the model to turn it.</p>
        </div>

        <div className="stage hobby-stage" data-scrub ref={stageRef}>
          <div className="hobby-top swap-in" key={`top-${active.id}`}>
            <span className="t-title">{active.name}</span>
            <span className="t-small">{active.caption}</span>
          </div>
          <canvas
            ref={canvasRef}
            className="hobby-canvas"
            aria-hidden
            onPointerDown={() => setAuto(false)}
          ></canvas>
          <div className="hobby-bottom swap-in late" key={`bottom-${active.id}`}>
            <p className="t-body-lg hobby-copy">{active.copy}</p>
            <span className="t-mono">{active.tempo}</span>
          </div>
        </div>

        <div
          ref={stripRef}
          className="segmented"
          data-reveal
          data-i="2"
          data-cycling={cycling ? '' : undefined}
          role="tablist"
          aria-label="Off-hours pursuits"
          style={{ marginTop: 'var(--space-5)' }}
          onPointerDown={() => setAuto(false)}
        >
          {hobbies.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={h.id === activeId}
              onClick={() => {
                setAuto(false);
                setActiveId(h.id);
              }}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffHours;
