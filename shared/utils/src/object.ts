export function mergeObjects<T extends Record<string, any>>(
  a: T | undefined,
  b: Partial<T> | Record<string, any> | undefined
): T {
  const result = { ...a } as Record<string, any>

  if (b) {
    for (const [key, value] of Object.entries(b)) {
      if (a?.[key] === value) continue
      result[key] =
        a?.[key] !== null &&
        value !== null &&
        typeof a?.[key] === 'object' &&
        typeof value === 'object' &&
        !Array.isArray(a?.[key]) &&
        !Array.isArray(value)
          ? mergeObjects(a[key], value)
          : value
    }
  }

  return result as T
}
