import { useMemo } from 'react'
import { isTruthy, isUnique } from '@vlight/utils'
import { mapFixtureList } from '@vlight/controls'

import { useMasterData, useMasterDataMaps } from './api'

export const useCommonFixtureMapping = (fixtureStrings: string[]): string[] => {
  const masterData = useMasterData()
  const masterDataMaps = useMasterDataMaps()

  const commonMapping = useMemo(
    () => {
      const fixtureIds = mapFixtureList(fixtureStrings, {
        masterData,
        masterDataMaps,
      })

      const fixtures = fixtureIds
        .map(id => masterDataMaps.fixtures.get(id))
        .filter(isTruthy)
      const commonFixtureTypes = fixtures
        .map(({ type }) => masterDataMaps.fixtureTypes.get(type))
        .filter(isTruthy)
        .filter(isUnique)
      return commonFixtureTypes
        .flatMap(({ mapping }) => mapping)
        .filter(isUnique)
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      fixtureStrings,
      masterData,
      masterDataMaps,
      // to re-create the mapping when transitive dependencies change
      masterData.fixtures,
      masterData.fixtureTypes,
      masterData.fixtureGroups,
    ]
  )
  /* eslint-enable react-hooks/exhaustive-deps */

  return commonMapping
}
