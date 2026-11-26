import { FixtureMappingPrefix } from './enums'

/** Separates the fixture ID and the (1-based) segment number in segment member IDs. */
export const segmentSeparator = '@'

/**
 * Returns the member ID for the given fixture segment.
 *
 * @param segment 1-based segment number
 */
export function getSegmentMemberId(fixtureId: string, segment: number): string {
  return `${fixtureId}${segmentSeparator}${segment}`
}

export interface ParsedSegmentMemberId {
  fixtureId: string
  /** 1-based segment number. */
  segment: number
}

/**
 * Parses a segment member ID (`foobar@2`).
 *
 * Returns `undefined` if the given ID is not in the segment format.
 * Does not check whether the fixture or segment exist.
 */
export function parseSegmentMemberId(
  id: string
): ParsedSegmentMemberId | undefined {
  const index = id.lastIndexOf(segmentSeparator)
  if (index <= 0) return undefined
  const segmentString = id.slice(index + 1)
  if (!/^\d+$/.test(segmentString)) return undefined
  return {
    fixtureId: id.slice(0, index),
    segment: Number(segmentString),
  }
}

/**
 * Splits off the `segments:` prefix of a fixture mapping string.
 */
export function splitSegmentsPrefix(mapping: string): {
  segments: boolean
  base: string
} {
  if (!mapping.startsWith(FixtureMappingPrefix.Segments)) {
    return { segments: false, base: mapping }
  }
  return {
    segments: true,
    base: mapping.slice(FixtureMappingPrefix.Segments.length),
  }
}
