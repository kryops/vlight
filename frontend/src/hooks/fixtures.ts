import { mapFixtureList, getCommonFixtureMapping } from '@vlight/controls'
import { IdType } from '@vlight/types'

import { useMasterDataAndMaps } from './api'

/**
 * React Hook that returns the common channel mapping of the given fixture list strings.
 *
 * If your component already uses the `useMasterDataAndMaps` Hook, prefer
 * calling {@link getCommonFixtureMapping} directly.
 */
export const useCommonFixtureMapping = (fixtureStrings: string[]): string[] => {
  const masterDataAndMaps = useMasterDataAndMaps()
  return getCommonFixtureMapping(fixtureStrings, masterDataAndMaps)
}

/**
 * React Hook that maps fixture list strings to actual fixture IDs.
 */
export function useFixtureList(fixtures: string[]): IdType[] {
  const masterDataAndMaps = useMasterDataAndMaps()
  return mapFixtureList(fixtures, masterDataAndMaps)
}
