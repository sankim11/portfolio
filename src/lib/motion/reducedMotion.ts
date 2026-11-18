/** True when the visitor has asked their system for less motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
