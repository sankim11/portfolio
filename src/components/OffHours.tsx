import { useEffect, useRef, useState } from 'react';

type Hobby = {
  id: string;
  no: string;
  name: string;
  caption: string;
  copy: string;
  tempo: string;
  mood: string;
};

const hobbies: Hobby[] = [
  {
    id: 'gaming',
    no: '01',
    name: 'Gaming',
    caption: 'Plate · I — Console, hex grid, raid map',
    copy: "Rainbow Six Siege, Civilization VII, Arc Raiders, Assassin’s Creed. Systems thinking applied to itemization, macro play, and raid call-outs.",
    tempo: 'evenings · weekly',
    mood: 'gaming',
  },
  {
    id: 'painting',
    no: '02',
    name: 'Painting',
    caption: 'Plate · II — Hanging Gardens & Petra, in study',
    copy: 'Realistic landscapes in acrylic and oil. Currently working on the Hanging Gardens of Babylon and Petra. Color theory rewires how I think about UI palettes.',
    tempo: 'daily · 1 hr',
    mood: 'painting',
  },
  {
    id: 'gym',
    no: '03',
    name: 'Gym',
    caption: 'Plate · III — Barbell, plates, lift',
    copy: 'Three sessions a week. Compound lifts and accessories — discipline practiced under load, the metronome of the week.',
    tempo: '3 / week',
    mood: 'gym',
  },
  {
    id: 'muay-thai',
    no: '04',
    name: 'Muay Thai',
    caption: 'Plate · IV — Eight limbs, four sessions',
    copy: 'Four times a week. Bag work, pad rounds, the occasional spar. Sharpens timing, posture, and humility in equal measure.',
    tempo: '4 / week',
    mood: 'muay-thai',
  },
  {
    id: 'cooking',
    no: '05',
    name: 'Cooking',
    caption: "Plate · V — Chef's hat, knife, pan",
    copy: 'Pasta from scratch, every kind of meat, asian, brazilian, and whatever I find scrolling. The kitchen is where I prototype with my hands.',
    tempo: 'daily · 1 hr',
    mood: 'cooking',
  },
];

const OffHours = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<string>('gaming');
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
    let currentId = 'gaming';
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

    function buildGymTargets() {
      const pts: number[][] = [];
      const edges: number[][] = [];

      const barStart = pts.length;
      for (let i = 0; i <= 16; i++) {
        const x = -3.4 + (6.8 * i) / 16;
        pts.push([x, 0, 0]);
      }
      for (let i = 0; i < 16; i++) edges.push([barStart + i, barStart + i + 1]);

      function plate(cx: number, radius: number, n: number) {
        const s = pts.length;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          pts.push([cx, Math.cos(a) * radius, Math.sin(a) * radius]);
        }
        for (let i = 0; i < n; i++) edges.push([s + i, s + ((i + 1) % n)]);
        return s;
      }
      plate(2.4, 0.85, 16);
      plate(2.6, 0.85, 16);
      plate(2.85, 0.65, 14);
      plate(3.05, 0.45, 12);
      plate(-2.4, 0.85, 16);
      plate(-2.6, 0.85, 16);
      plate(-2.85, 0.65, 14);
      plate(-3.05, 0.45, 12);

      return pad({ points: pts, edges });
    }

    function buildMuayThaiTargets() {
      const pts: number[][] = [];
      const edges: number[][] = [];

      const bagX = 0.0,
        bagZ = 0;
      const ringYs = [-1.4, -0.9, -0.4, 0.1, 0.6, 1.05, 1.35];
      const segs = 16;
      const ringStarts: number[] = [];
      ringYs.forEach((y, idx) => {
        const s = pts.length;
        ringStarts.push(s);
        const taper = idx === 0 || idx === ringYs.length - 1 ? 0.85 : 1.0;
        const r = 0.45 * taper;
        for (let i = 0; i < segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          pts.push([bagX + Math.cos(a) * r, y, bagZ + Math.sin(a) * r]);
        }
        for (let i = 0; i < segs; i++) edges.push([s + i, s + ((i + 1) % segs)]);
      });
      for (let i = 0; i < segs; i += 4) {
        for (let r = 0; r < ringStarts.length - 1; r++) {
          edges.push([ringStarts[r] + i, ringStarts[r + 1] + i]);
        }
      }

      const chainTop = [bagX, 2.2, 0];
      const cTopIdx = pts.length;
      pts.push(chainTop);
      const chL = pts.length;
      pts.push([bagX - 0.32, 1.35, 0]);
      pts.push([bagX - 0.22, 1.65, 0]);
      pts.push([bagX - 0.12, 1.95, 0]);
      edges.push([chL, chL + 1], [chL + 1, chL + 2], [chL + 2, cTopIdx]);
      const chR = pts.length;
      pts.push([bagX + 0.32, 1.35, 0]);
      pts.push([bagX + 0.22, 1.65, 0]);
      pts.push([bagX + 0.12, 1.95, 0]);
      edges.push([chR, chR + 1], [chR + 1, chR + 2], [chR + 2, cTopIdx]);
      const hkS = pts.length;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI + (Math.PI * i) / 7;
        pts.push([bagX + Math.cos(a) * 0.16, 2.36 + Math.sin(a) * 0.16, 0]);
      }
      for (let i = 0; i < 7; i++) edges.push([hkS + i, hkS + i + 1]);
      edges.push([cTopIdx, hkS]);

      function buildGlove(centerX: number, mirror: boolean) {
        // Mitt body — vertical ovoid built from 6 horizontal rings (XZ plane)
        const mittRings = [
          { y: 0.05, r: 0.45 },
          { y: 0.25, r: 0.55 },
          { y: 0.5, r: 0.6 },
          { y: 0.7, r: 0.55 },
          { y: 0.85, r: 0.42 },
          { y: 0.95, r: 0.2 },
        ];
        const mittSegs = 14;
        const mittStarts: number[] = [];
        mittRings.forEach(({ y, r }) => {
          const s = pts.length;
          mittStarts.push(s);
          for (let i = 0; i < mittSegs; i++) {
            const a = (i / mittSegs) * Math.PI * 2;
            pts.push([centerX + Math.cos(a) * r, y, Math.sin(a) * r]);
          }
          for (let i = 0; i < mittSegs; i++)
            edges.push([s + i, s + ((i + 1) % mittSegs)]);
        });
        // Full longitudinal struts — every vertex through every ring.
        for (let i = 0; i < mittSegs; i++) {
          for (let r = 0; r < mittStarts.length - 1; r++) {
            edges.push([mittStarts[r] + i, mittStarts[r + 1] + i]);
          }
        }
        // Top apex point to round off the dome
        const apex = pts.length;
        pts.push([centerX, 1.0, 0]);
        for (let i = 0; i < mittSegs; i += 2)
          edges.push([mittStarts[mittStarts.length - 1] + i, apex]);

        // Wrist cuff — short cylinder below the mitt
        const cuffRings = [
          { y: -0.7, r: 0.32 },
          { y: -0.35, r: 0.35 },
          { y: 0.0, r: 0.4 },
        ];
        const cuffSegs = 14;
        const cuffStarts: number[] = [];
        cuffRings.forEach(({ y, r }) => {
          const s = pts.length;
          cuffStarts.push(s);
          for (let i = 0; i < cuffSegs; i++) {
            const a = (i / cuffSegs) * Math.PI * 2;
            pts.push([centerX + Math.cos(a) * r, y, Math.sin(a) * r]);
          }
          for (let i = 0; i < cuffSegs; i++)
            edges.push([s + i, s + ((i + 1) % cuffSegs)]);
        });
        for (let i = 0; i < cuffSegs; i++) {
          for (let r = 0; r < cuffStarts.length - 1; r++) {
            edges.push([cuffStarts[r] + i, cuffStarts[r + 1] + i]);
          }
        }

        // Thumb — small cone of 4 rings stacked along the X axis (rings in YZ).
        // Mirror flips the X offset so each glove's thumb points inward.
        const thumbRings = [
          { offX: 0.4, r: 0.18 },
          { offX: 0.55, r: 0.22 },
          { offX: 0.65, r: 0.2 },
          { offX: 0.75, r: 0.12 },
        ];
        const thumbCy = 0.15;
        const thumbSegs = 10;
        const thumbStarts: number[] = [];
        thumbRings.forEach(({ offX, r }) => {
          const s = pts.length;
          thumbStarts.push(s);
          const sx = mirror ? -offX : offX;
          for (let i = 0; i < thumbSegs; i++) {
            const a = (i / thumbSegs) * Math.PI * 2;
            pts.push([
              centerX + sx,
              thumbCy + Math.cos(a) * r,
              Math.sin(a) * r,
            ]);
          }
          for (let i = 0; i < thumbSegs; i++)
            edges.push([s + i, s + ((i + 1) % thumbSegs)]);
        });
        for (let i = 0; i < thumbSegs; i++) {
          for (let r = 0; r < thumbStarts.length - 1; r++) {
            edges.push([thumbStarts[r] + i, thumbStarts[r + 1] + i]);
          }
        }
      }

      buildGlove(-2.4, false);
      buildGlove(2.4, true);

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

    const TARGETS: Record<string, { points: number[][]; edges: number[][] }> = {
      gaming: buildGamingTargets(),
      painting: buildPaintingTargets(),
      gym: buildGymTargets(),
      'muay-thai': buildMuayThaiTargets(),
      cooking: buildCookingTargets(),
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
      g.addColorStop(0.0, 'rgba(255, 232, 184, 1)');
      g.addColorStop(0.35, 'rgba(201, 169, 97, 0.85)');
      g.addColorStop(1.0, 'rgba(201, 169, 97, 0)');
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
      const dark =
        document.documentElement.getAttribute('data-theme') === 'dark';
      if (lMatRef) {
        lMatRef.opacity = dark ? 0.55 : 0.7;
        lMatRef.color.setHex(dark ? 0x7dd49a : 0x00582a);
        lMatRef.needsUpdate = true;
      }
      if (pMatRef) {
        pMatRef.color.setHex(dark ? 0xffffff : 0x00582a);
        pMatRef.opacity = 1.0;
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
      camera.position.set(0, 0.3, 8);
      camera.lookAt(0, 0, 0);

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
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';

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
        const autoY = Math.sin(t * 0.15) * 0.22 * autoIdleStrength;
        const autoX = Math.sin(t * 0.12) * 0.06 * autoIdleStrength;
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

  return (
    <>
      <section
        id="offhours"
        ref={stageRef as any}
        className="hobby-stage"
        data-mood={active.mood}
        style={{
          padding: '140px 0 120px',
          transition: 'background 900ms ease',
        }}
      >
        <div className="wrap">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 60,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'baseline',
              }}
            >
              <span className="label">§.05</span>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: 'var(--fg)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                }}
              >
                Off-hours
              </h2>
            </div>
            <span className="label hidden md:inline">
              Pursuits beyond the keyboard
            </span>
          </div>

          <div
            id="hobbyStage"
            style={{
              position: 'relative',
              aspectRatio: '16 / 7',
              width: '100%',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 22,
                right: 22,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <span
                className="label"
                id="hobbyKicker"
                style={{ color: 'var(--gold)' }}
              >
                No. {active.no} / {active.name}
              </span>
              <span className="label" id="hobbyCaption">
                {active.caption}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              id="hobbyCanvas"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            ></canvas>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.18) 100%)',
              }}
            ></div>

            <div
              style={{
                position: 'absolute',
                left: 22,
                right: 22,
                bottom: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 32,
                alignItems: 'end',
                zIndex: 3,
              }}
            >
              <p
                id="hobbyCopy"
                className="font-display"
                style={{
                  fontSize: 'clamp(15px, 1.5vw, 19px)',
                  color: 'var(--fg)',
                  fontWeight: 300,
                  lineHeight: 1.45,
                  maxWidth: '56ch',
                  fontStyle: 'italic',
                  transition: 'opacity 500ms ease',
                }}
              >
                {active.copy}
              </p>
              <div style={{ textAlign: 'right' }}>
                <div className="label" style={{ marginBottom: 6 }}>
                  Tempo
                </div>
                <div
                  id="hobbyTempo"
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    color: 'var(--body)',
                    transition: 'opacity 500ms ease',
                  }}
                >
                  {active.tempo}
                </div>
              </div>
            </div>
          </div>

          <ul
            id="hobbyList"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 0,
              listStyle: 'none',
              padding: 0,
              margin: '28px 0 0',
              borderTop: '1px solid var(--line)',
            }}
          >
            {hobbies.map((h, i) => (
              <li
                key={h.id}
                className={`hobby-tag ${h.id === activeId ? 'active' : ''}`}
                data-id={h.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '22px 18px',
                  borderRight:
                    i === hobbies.length - 1 ? 'none' : '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setActiveId(h.id)}
                onClick={() => setActiveId(h.id)}
              >
                <span className="num" style={{ color: 'var(--muted)' }}>
                  {h.no}
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: 'clamp(20px, 2.2vw, 30px)',
                    fontWeight: 300,
                    letterSpacing: '-0.015em',
                    fontStyle: 'italic',
                    lineHeight: 1.05,
                    transition: 'color 400ms ease',
                  }}
                >
                  {h.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="wrap">
        <div className="hairline"></div>
      </div>
    </>
  );
};

export default OffHours;
