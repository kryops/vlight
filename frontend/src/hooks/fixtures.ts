import {
  mapFixtureList,
  getCommonFixtureMapping,
  getCommonChannelStates,
} from '@vlight/controls'
import { FixtureChannelState, IdType } from '@vlight/types'

import { useMasterDataAndMaps } from './api'
import { useDeepEqualMemo, useShallowEqualMemo } from './performance'

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
 * React Hook that returns the channel state tables of all fixture types
 * of the given fixture list strings, grouped by channel type.
 */
export const useCommonChannelStates = (
  fixtureStrings: string[]
): Record<string, FixtureChannelState[][]> => {
  const masterDataAndMaps = useMasterDataAndMaps()
  return useDeepEqualMemo(
    getCommonChannelStates(fixtureStrings, masterDataAndMaps)
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
