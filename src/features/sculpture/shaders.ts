// GLSL for the particle sculpture. `position` is where a particle is heading;
// `aFrom` is where it set off from; `aRand` is four random numbers per particle.

export const VERTEX = /* glsl */ `
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

export const FRAGMENT = /* glsl */ `
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
