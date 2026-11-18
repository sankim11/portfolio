// Particle sculptures for the Off-hours stage.
//
// Each pursuit is drawn as thousands of glowing particles scattered along the
// edges of its wireframe, plus a little loose dust for depth. Particles nearer
// or farther than the focal plane swell and fade like out-of-focus highlights,
// a band of light sweeps across now and then, and the pointer pushes the dust
// aside. Changing shape makes the sculpture burst into a swirl and re-form.
//
// This module pulls in three.js, so it is loaded on demand (see OffHours.tsx).

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import type { HobbyId } from '../../data/hobbies';
import { prefersReducedMotion } from '../../lib/motion';
import { sample } from './sample';
import { FRAGMENT, VERTEX } from './shaders';
import { SHAPES } from './shapes';

export type Sculpture = {
  setShape: (id: HobbyId) => void;
  dispose: () => void;
};

type Options = {
  initial: HobbyId;
  /** Called when the visitor takes hold of the sculpture. */
  onGrab?: () => void;
};

const MORPH_MS = 1900;
const FOV = 40;
const PARTICLES = { desktop: 14000, phone: 8000 };
/** Share of the morph each particle's start is staggered by (matches the shader). */
const STAGGER = 0.35;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createSculpture(canvas: HTMLCanvasElement, opts: Options): Sculpture | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    return null; // no WebGL: the stage keeps its text and simply has no sculpture
  }
  renderer.setClearColor(0x000000, 0);

  const still = prefersReducedMotion();
  const count = canvas.clientWidth < 760 ? PARTICLES.phone : PARTICLES.desktop;

  const sampled = new Map<HobbyId, Float32Array>();
  const shapeFor = (id: HobbyId) => {
    let s = sampled.get(id);
    if (!s) {
      s = sample(SHAPES[id](), count);
      sampled.set(id, s);
    }
    return s;
  };

  // ---- scene ----
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  const group = new Group();
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

  const geometry = new BufferGeometry();
  const toAttr = new BufferAttribute(to, 3);
  const fromAttr = new BufferAttribute(from, 3);
  geometry.setAttribute('position', toAttr);
  geometry.setAttribute('aFrom', fromAttr);
  geometry.setAttribute('aRand', new BufferAttribute(rand, 4));

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: still ? 1 : 0 },
    uProj: { value: 500 },
    uFocus: { value: 8 },
    uAperture: { value: 0.055 },
    uSize: { value: 0.026 },
    uSweep: { value: -20 },
    uStill: { value: still ? 1 : 0 },
    uPointer: { value: new Vector3() },
    uPointerOn: { value: 0 },
    uColorA: { value: new Color('#f5f5f5') },
    uColorB: { value: new Color('#c0cef2') },
    uColorC: { value: new Color('#feeae1') },
    uOpacity: { value: 0.42 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new Points(geometry, material);
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
    material.blending = light ? NormalBlending : AdditiveBlending;
    material.needsUpdate = true;
  };
  applyTheme();
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
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
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(canvas);

  // ---- interaction ----
  const rotation = { y: 0, x: 0, targetY: 0, targetX: 0, velY: 0, velX: 0 };
  const drag = { active: false, lastX: 0, lastY: 0 };
  let sway = 1; // the idle sway fades out once someone takes hold
  let grabbed = false;
  let pointerOn = 0;
  let pointerWant = 0;

  const raycaster = new Raycaster();
  const focalPlane = new Plane(new Vector3(0, 0, 1), 0);
  const ndc = new Vector2();
  const hit = new Vector3();

  const onDown = (e: PointerEvent) => {
    drag.active = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    rotation.velY = 0;
    rotation.velX = 0;
    grabbed = true;
    canvas.style.cursor = 'grabbing';
    opts.onGrab?.();
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(focalPlane, hit)) uniforms.uPointer.value.copy(hit);
      pointerWant = drag.active ? 0 : 1;
    }
    if (!drag.active) return;
    const dx = (e.clientX - drag.lastX) * 0.008;
    const dy = (e.clientY - drag.lastY) * 0.008;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    rotation.targetY += dx;
    rotation.targetX = Math.max(-1, Math.min(1, rotation.targetX + dy));
    rotation.velY = dx;
    rotation.velX = dy;
  };
  const onUp = () => {
    drag.active = false;
    canvas.style.cursor = '';
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

  const setShape = (id: HobbyId) => {
    if (id === currentId && started) return;
    currentId = id;
    const next = shapeFor(id);
    if (!started) {
      to.set(next); // still waiting to gather for the first time: just retarget
      toAttr.needsUpdate = true;
      return;
    }
    // Start from wherever each particle is now, so an interrupted change never jumps.
    for (let i = 0; i < count; i++) {
      const m = Math.min(1, Math.max(0, (morph - rand[i * 4 + 3] * STAGGER) / (1 - STAGGER)));
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

    if (!drag.active) {
      rotation.targetY += rotation.velY;
      rotation.targetX = Math.max(-1, Math.min(1, rotation.targetX + rotation.velX));
      rotation.velY *= 0.94;
      rotation.velX *= 0.94;
      if (grabbed) sway = Math.max(0, sway - 0.02);
    }
    rotation.y += (rotation.targetY - rotation.y) * 0.12;
    rotation.x += (rotation.targetX - rotation.x) * 0.12;
    group.rotation.y = rotation.y + (still ? 0 : Math.sin(time * 0.3) * 0.42 * sway);
    group.rotation.x = rotation.x + (still ? 0 : Math.sin(time * 0.22) * 0.07 * sway);

    pointerOn += (pointerWant - pointerOn) * 0.08;
    uniforms.uPointerOn.value = pointerOn;
    uniforms.uTime.value = time;
    uniforms.uMorph.value = morph;
    // A band of light crosses the sculpture, then rests off stage.
    uniforms.uSweep.value = still ? -20 : ((time * 1.5) % 16) - 8;

    renderer.render(scene, camera);
  };

  const visibility = new IntersectionObserver(
    ([entry]) => {
      cancelAnimationFrame(raf);
      if (!entry.isIntersecting) return;
      if (!started) {
        started = true;
        morphing = !still;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    { threshold: 0.15 }
  );
  visibility.observe(canvas);

  return {
    setShape,
    dispose() {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      sizeObserver.disconnect();
      themeObserver.disconnect();
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
