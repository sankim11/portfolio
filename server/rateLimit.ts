/**
 * A sliding-window rate limiter kept in memory.
 *
 * Memory is per server instance, so on serverless hosts this only slows a burst
 * from one address. Pair it with the host's own rate limiting and a spending
 * budget on the model provider.
 */
export function createRateLimiter({
  windowMs,
  max,
  maxKeys = 5000,
}: {
  windowMs: number;
  max: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, number[]>();

  /** Records a request for `key` and reports whether it is over the limit. */
  return function isLimited(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > maxKeys) hits.clear();
    return false;
  };
}
