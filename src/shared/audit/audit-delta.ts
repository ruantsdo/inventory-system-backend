export function getDelta<T extends Record<string, unknown>>(
  original: T,
  updated: T
): { before: Partial<T>; after: Partial<T> } {
  const before: Partial<T> = {};
  const after: Partial<T> = {};

  const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);

  for (const key of allKeys) {
    const k = key as keyof T;
    if (original[k] !== updated[k]) {
      before[k] = original[k];
      after[k] = updated[k];
    }
  }

  return { before, after };
}
