import { useMemo } from 'react'

import { isTruthy, isUnique } from '../util/shared'

import { useMasterData, useMasterDataMaps } from './api'

export const useCommonFixtureMapping = (fixtureIds: string[]): string[] => {
  const masterData = useMasterData()
  const { fixtures, fixtureTypes } = useMasterDataMaps()

  const commonMapping = useMemo(
    () => {
      const groupFixtures = fixtureIds
        .map(id => fixtures.get(id))
        .filter(isTruthy)
      const commonFixtureTypes = groupFixtures
        .map(({ type }) => fixtureTypes.get(type))
        .filter(isTruthy)
        .filter(isUnique)
      return commonFixtureTypes
        .flatMap(({ mapping }) => mapping)
        .filter(isUnique)
    },
    [fixtureIds, masterData] // eslint-disable-line
  )

  return commonMapping
}
