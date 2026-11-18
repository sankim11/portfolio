import { prefersReducedMotion } from './reducedMotion';

/** Delay between staggered siblings (data-i="1", "2", …). */
const STAGGER_MS = 90;

/**
 * Marks every [data-reveal] element with data-in once it scrolls into view
 * (optionally staggered by data-i), including elements React mounts later.
 * An attribute, not a class, so React re-renders never wipe it.
 *
 * Returns a cleanup function.
 */
export function initReveal(): () => void {
  const show = (el: Element) => {
    const i = Number((el as HTMLElement).dataset.i || 0);
    if (i > 0) window.setTimeout(() => el.setAttribute('data-in', ''), i * STAGGER_MS);
    else el.setAttribute('data-in', '');
  };

  const instant = prefersReducedMotion() || !('IntersectionObserver' in window);
  const io = instant
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            show(e.target);
            io?.unobserve(e.target);
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

  const take = (el: Element) => {
    if (io) io.observe(el);
    else el.setAttribute('data-in', '');
  };
  const scan = (root: ParentNode) =>
    root.querySelectorAll('[data-reveal]:not([data-in])').forEach(take);

  scan(document);
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches('[data-reveal]:not([data-in])')) take(n);
        scan(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io?.disconnect();
    mo.disconnect();
  };
}
