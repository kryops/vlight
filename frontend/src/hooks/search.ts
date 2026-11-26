import { useCallback, useState } from 'react'

/**
 * Checks whether a label matches a search query.
 *
 * Case-insensitive; all whitespace-separated terms must be contained.
 */
export function matchesSearch(
  label: string | undefined,
  query: string
): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const lowerLabel = (label ?? '').toLowerCase()
  return terms.every(term => lowerLabel.includes(term))
}

export interface SearchState {
  query: string
  setQuery: (query: string) => void
  /** Whether a non-empty search query is set. */
  active: boolean
  /** Checks whether a label matches the current query. */
  matches: (label: string | undefined) => boolean
}

/**
 * React Hook for a page-local search query to filter widgets by name.
 */
export function useSearch(): SearchState {
  const [query, setQuery] = useState('')
  const matches = useCallback(
    (label: string | undefined) => matchesSearch(label, query),
    [query]
  )
  return { query, setQuery, active: query.trim() !== '', matches }
}
