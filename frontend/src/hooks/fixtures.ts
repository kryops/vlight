import { mapFixtureList, getCommonFixtureMapping } from '@vlight/controls'
import { IdType } from '@vlight/types'

import { useMasterDataAndMaps } from './api'
import { useShallowEqualMemo } from './performance'

/**
 * React Hook that returns the common channel mapping of the given fixture list strings.
 */
export const useCommonFixtureMapping = (
  fixtureStrings: string[],
  limitedTo?: string[]
): string[] => {
  const masterDataAndMaps = useMasterDataAndMaps()
  const commonFixtureMapping = getCommonFixtureMapping(
    fixtureStrings,
    masterDataAndMaps
  )
  return useShallowEqualMemo(
    limitedTo
      ? commonFixtureMapping.filter(channel => limitedTo.includes(channel))
      : commonFixtureMapping
  )
}

/**
 * React Hook that maps fixture list strings to actual fixture IDs.
 */
export function useFixtureList(fixtures: string[]): IdType[] {
  const masterDataAndMaps = useMasterDataAndMaps()
  const fixtureIds = mapFixtureList(fixtures, masterDataAndMaps)
  return useShallowEqualMemo(fixtureIds)
}
