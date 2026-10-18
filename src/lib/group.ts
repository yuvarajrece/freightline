/** Groups items into a map keyed by the value returned for each item. Items with a null key are skipped. */
export function groupBy<T>(items: T[], keyOf: (item: T) => string | null): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    if (key === null) continue;
    const bucket = grouped.get(key);
    if (bucket) bucket.push(item);
    else grouped.set(key, [item]);
  }
  return grouped;
}
