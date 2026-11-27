/**
 * At most `perMinute` searches for one visitor in any 60 seconds. A refused search is not counted, so a visitor is
 * served again as soon as their oldest counted search is a minute old. Kept in memory by one running server copy.
 */
export function createVisitorLimit(perMinute: number, now: () => number = Date.now) {
  const recent = new Map<string, number[]>();
  const MAX_VISITORS = 10_000;
  return {
    allow(visitor: string): boolean {
      const t = now();
      const times = (recent.get(visitor) ?? []).filter((at) => t - at < 60_000);
      if (times.length >= perMinute) {
        recent.set(visitor, times);
        return false;
      }
      times.push(t);
      recent.delete(visitor);
      recent.set(visitor, times);
      // Bounded memory: the visitor seen longest ago is forgotten first.
      if (recent.size > MAX_VISITORS) recent.delete(recent.keys().next().value as string);
      return true;
    },
  };
}
