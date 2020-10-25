import { mapFixtureList, getCommonFixtureMapping } from '@vlight/controls'
import { IdType } from '@vlight/types'

import { useMasterDataAndMaps } from './api'

export const useCommonFixtureMapping = (fixtureStrings: string[]): string[] => {
  const masterDataAndMaps = useMasterDataAndMaps()
  return getCommonFixtureMapping(fixtureStrings, masterDataAndMaps)
}

export function useFixtureList(fixtures: string[]): IdType[] {
  const masterDataAndMaps = useMasterDataAndMaps()
  return mapFixtureList(fixtures, masterDataAndMaps)
}
