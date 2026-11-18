/* eslint-disable @typescript-eslint/no-explicit-any -- three.js is loaded as a global script */
// Particle sculptures for the Off-hours stage.
//
// Each pursuit is drawn as thousands of glowing particles scattered along the
// edges of its wireframe, plus a little loose dust for depth. Particles nearer
// or farther than the focal plane swell and fade like out-of-focus highlights,
// a band of light sweeps across now and then, and the pointer pushes the dust
// aside. Changing shape makes the sculpture burst into a swirl and re-form.

import { SHAPES, type Shape } from './hobbyShapes';
import { prefersReducedMotion } from './motion';

export type Sculpture = {
  setShape: (id: string) => void;
  dispose: () => void;
};

const MORPH_MS = 1900;
const FOV = 40;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uProj;
  uniform float uFocus;
  uniform float uAperture;
  uniform float uSize;
  uniform float uSweep;
  uniform float uStill;
  uniform vec3 uPointer;
  uniform float uPointerOn;
  attribute vec3 aFrom;
  attribute vec4 aRand;
  varying float vAlpha;
  varying float vTint;
  varying float vGlow;

  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Each particle leaves a little later than the last, so the shape unravels.
    float m = clamp((uMorph - aRand.w * 0.35) / 0.65, 0.0, 1.0);
    vec3 p = mix(aFrom, position, ease(m));

    // Mid-flight the dust swirls round the vertical axis and flies outward.
    float burst = sin(m * 3.14159265);
    float ang = burst * (1.5 + aRand.x * 1.3);
    float c = cos(ang);
    float s = sin(ang);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p += aRand.xyz * burst * 1.15;

    // At rest every particle breathes on its own small orbit.
    p += (1.0 - uStill) * 0.03 * vec3(
      sin(uTime * 0.6 + aRand.x * 6.2832),
      cos(uTime * 0.5 + aRand.y * 6.2832),
      sin(uTime * 0.4 + aRand.z * 6.2832)
    );

    vec4 world = modelMatrix * vec4(p, 1.0);

    // The pointer parts the dust.
    vec2 away = world.xy - uPointer.xy;
    float push = uPointerOn * smoothstep(1.15, 0.0, length(away));
    world.xy += normalize(away + vec2(0.0001)) * push * 0.5;
    world.z += push * 0.35 * aRand.z;

    vec4 mv = viewMatrix * world;
    float depth = -mv.z;

    // Depth of field: off the focal plane a particle grows and thins out.
    float coc = abs(depth - uFocus) * uAperture;
    float size = uSize * (0.55 + aRand.w * 0.9) * (1.0 + coc * 7.0);
    gl_PointSize = max(1.0, size * uProj / depth);
    gl_Position = projectionMatrix * mv;

    vAlpha = (0.5 + 0.5 * aRand.w) / (1.0 + coc * coc * 36.0);
    vGlow = smoothstep(1.0, 0.0, abs(world.x - uSweep));
    vTint = aRand.y * 0.5 + 0.5;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTint;
  varying float vGlow;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, r);
    vec3 col = mix(uColorA, uColorB, vTint);
    col = mix(col, uColorC, vGlow * 0.85);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity * (1.0 + vGlow * 1.1));
  }
`;

/** Where a sculpture may sit, in world units: centred a little above the middle. */
const SAFE = { y: 0.42, halfWidth: 3.5, halfHeight: 1.5 };

/** Roughly normal-distributed random number. */
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.82;

/** Scatters `count` particles along a shape's edges, with a little loose dust. */
function sample(shape: Shape, count: number): Float32Array {
  const { points, edges } = shape;
  const lengths: number[] = [];
  let total = 0;
  for (const [a, b] of edges) {
    const pa = points[a];
    const pb = points[b];
    total += pa && pb ? Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]) : 0;
    lengths.push(total);
  }

  // Fit the shape into the safe area between the stage title and its caption,
  // so tall shapes (the chef's hat) and wide ones (the green) are framed alike.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [a, b] of edges)
    for (const pt of [points[a], points[b]]) {
      if (!pt) continue;
      minX = Math.min(minX, pt[0]);
      maxX = Math.max(maxX, pt[0]);
      minY = Math.min(minY, pt[1]);
      maxY = Math.max(maxY, pt[1]);
    }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const fit = Math.min(
    SAFE.halfWidth / Math.max(0.01, (maxX - minX) / 2),
    SAFE.halfHeight / Math.max(0.01, (maxY - minY) / 2),
    1.25
  );

  const out = new Float32Array(count * 3);
  const dust = Math.floor(count * 0.06);
  for (let i = 0; i < count; i++) {
    const o = i * 3;
    if (i < dust || total === 0) {
      // Loose dust drifting in the air around the sculpture.
      const a = Math.random() * Math.PI * 2;
      const r = Math.cbrt(Math.random());
      out[o] = Math.cos(a) * r * 4.4;
      out[o + 1] = (Math.random() * 2 - 1) * 2.1 * r;
      out[o + 2] = Math.sin(a) * r * 2.6;
      continue;
    }
    // Pick an edge in proportion to its length, then a spot along it.
    const pick = Math.random() * total;
    let lo = 0;
    let hi = lengths.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] < pick) lo = mid + 1;
      else hi = mid;
    }
    const [ia, ib] = edges[lo];
    const pa = points[ia];
    const pb = points[ib];
    const t = Math.random();
    // Most particles hug the edge; a quarter form a soft halo around it.
    const spread = Math.random() < 0.26 ? 0.075 : 0.016;
    out[o] = (pa[0] + (pb[0] - pa[0]) * t - cx) * fit + gauss() * spread;
    out[o + 1] = (pa[1] + (pb[1] - pa[1]) * t - cy) * fit + SAFE.y + gauss() * spread;
    out[o + 2] = (pa[2] + (pb[2] - pa[2]) * t) * fit + gauss() * spread;
  }
  return out;
}

export function createSculpture(
  canvas: HTMLCanvasElement,
  opts: { initial: string; onGrab?: () => void }
): Sculpture | null {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded');
    return null;
  }

  const still = prefersReducedMotion();
  const count = canvas.clientWidth < 760 ? 8000 : 14000;

  const cache = new Map<string, Float32Array>();
  const shapeFor = (id: string) => {
    let s = cache.get(id);
    if (!s) {
      s = sample((SHAPES[id] ?? SHAPES[opts.initial])(), count);
      cache.set(id, s);
    }
    return s;
  };

  // ---- scene ----
  let renderer: any;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  const group = new THREE.Group();
  scene.add(group);

  // Particles start as a scattered cloud and gather into the first shape.
  const from = new Float32Array(count * 3);
  const to = new Float32Array(shapeFor(opts.initial));
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 4;
    from[i * 3] = Math.cos(a) * r;
    from[i * 3 + 1] = (Math.random() * 2 - 1) * 3;
    from[i * 3 + 2] = Math.sin(a) * r;
    rand[i * 4] = Math.random() * 2 - 1;
    rand[i * 4 + 1] = Math.random() * 2 - 1;
    rand[i * 4 + 2] = Math.random() * 2 - 1;
    rand[i * 4 + 3] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  const toAttr = new THREE.BufferAttribute(to, 3);
  const fromAttr = new THREE.BufferAttribute(from, 3);
  geometry.setAttribute('position', toAttr);
  geometry.setAttribute('aFrom', fromAttr);
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: still ? 1 : 0 },
    uProj: { value: 500 },
    uFocus: { value: 8 },
    uAperture: { value: 0.055 },
    uSize: { value: 0.026 },
    uSweep: { value: -20 },
    uStill: { value: still ? 1 : 0 },
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uPointerOn: { value: 0 },
    uColorA: { value: new THREE.Color('#f5f5f5') },
    uColorB: { value: new THREE.Color('#c0cef2') },
    uColorC: { value: new THREE.Color('#feeae1') },
    uOpacity: { value: 0.42 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  // ---- theme: light dust on dark, ink dust on light ----
  const applyTheme = () => {
    const css = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    uniforms.uColorA.value.set(token('--text', '#f5f5f5'));
    uniforms.uColorB.value.set(token('--sheen-3', '#c0cef2'));
    uniforms.uColorC.value.set(token('--sheen-2', '#feeae1'));
    uniforms.uOpacity.value = light ? 0.5 : 0.42;
    material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.needsUpdate = true;
  };
  applyTheme();
  const themeObs = new MutationObserver(applyTheme);
  themeObs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ---- sizing: narrow stages pull the camera back and raise the sculpture ----
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (camera.aspect < 1.2) {
      camera.position.set(0, 0.3, Math.min(17, 9.5 / camera.aspect));
      camera.lookAt(0, -1.1, 0);
    } else {
      camera.position.set(0, 0.3, 8);
      camera.lookAt(0, 0, 0);
    }
    camera.updateProjectionMatrix();
    uniforms.uFocus.value = camera.position.length();
    // World size → device pixels at unit depth.
    uniforms.uProj.value = (h * dpr) / (2 * Math.tan((FOV * Math.PI) / 360));
  };
  resize();
  const sizeObs = new ResizeObserver(resize);
  sizeObs.observe(canvas);

  // ---- interaction ----
  let rotY = 0;
  let rotX = 0;
  let targetY = 0;
  let targetX = 0;
  let velY = 0;
  let velX = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let sway = 1; // the idle sway fades out once someone takes hold
  let grabbed = false;
  let pointerOn = 0;
  let pointerWant = 0;

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();

  const onDown = (e: PointerEvent) => {
    dragging = true;
    grabbed = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = 0;
    velX = 0;
    canvas.style.cursor = 'grabbing';
    opts.onGrab?.();
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uPointer.value.copy(hit);
      pointerWant = dragging ? 0 : 1;
    }
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    targetY += dx * 0.008;
    targetX = Math.max(-1, Math.min(1, targetX + dy * 0.008));
    velY = dx * 0.008;
    velX = dy * 0.008;
  };
  const onUp = () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  };
  const onLeave = () => {
    pointerWant = 0;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ---- morphing ----
  let morph = still ? 1 : 0;
  let morphing = false;
  let started = false; // the first gather waits until the stage is on screen
  let currentId = opts.initial;

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const setShape = (id: string) => {
    if (id === currentId && started) return;
    currentId = id;
    const next = shapeFor(id);
    if (!started) {
      // Still waiting to gather for the first time: just retarget.
      to.set(next);
      toAttr.needsUpdate = true;
      return;
    }
    // Start from wherever each particle is now, so an interrupted change never jumps.
    for (let i = 0; i < count; i++) {
      const m = Math.min(1, Math.max(0, (morph - rand[i * 4 + 3] * 0.35) / 0.65));
      const e = ease(m);
      const o = i * 3;
      from[o] += (to[o] - from[o]) * e;
      from[o + 1] += (to[o + 1] - from[o + 1]) * e;
      from[o + 2] += (to[o + 2] - from[o + 2]) * e;
    }
    to.set(next);
    fromAttr.needsUpdate = true;
    toAttr.needsUpdate = true;
    morph = still ? 1 : 0;
    morphing = !still;
  };

  // ---- loop: only runs while the stage is on screen ----
  let raf = 0;
  let visible = false;
  let last = performance.now();
  let time = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!still) time += dt;

    if (morphing) {
      morph = Math.min(1, morph + (dt * 1000) / MORPH_MS);
      if (morph >= 1) morphing = false;
    }

    if (!dragging) {
      targetY += velY;
      targetX = Math.max(-1, Math.min(1, targetX + velX));
      velY *= 0.94;
      velX *= 0.94;
      if (grabbed) sway = Math.max(0, sway - 0.02);
    }
    rotY += (targetY - rotY) * 0.12;
    rotX += (targetX - rotX) * 0.12;
    group.rotation.y = rotY + (still ? 0 : Math.sin(time * 0.3) * 0.42 * sway);
    group.rotation.x = rotX + (still ? 0 : Math.sin(time * 0.22) * 0.07 * sway);

    pointerOn += (pointerWant - pointerOn) * 0.08;
    uniforms.uPointerOn.value = pointerOn;
    uniforms.uTime.value = time;
    uniforms.uMorph.value = morph;
    // A band of light crosses the sculpture, then rests off stage.
    uniforms.uSweep.value = still ? -20 : ((time * 1.5) % 16) - 8;

    renderer.render(scene, camera);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (!visible) return;
      if (!started) {
        started = true;
        morphing = !still;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    { threshold: 0.15 }
  );
  io.observe(canvas);

  return {
    setShape,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      sizeObs.disconnect();
      themeObs.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
