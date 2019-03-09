interface CompareProps {
  [key: string]: any
}

/**
 * Does a shallow comparison on two React `props` objects, but ignores functions.
 *
 * NOTE: Beware that this can provoke stale state values if the callbacks access
 * outside variables!
 *
 * @param a
 * @param b
 * @return {boolean} `true` if a and b are equal, `false` otherwise
 */
export function compareWithoutFunctions(
  a: CompareProps,
  b: CompareProps
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }

  for (const key of aKeys) {
    const aValue = a[key]
    if (typeof aValue === 'function') {
      continue
    }
    const bValue = b[key]
    if (aValue !== bValue) {
      return false
    }
  }

  return true
}
