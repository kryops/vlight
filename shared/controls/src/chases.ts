import {
  Dictionary,
  FixtureState,
  LiveChase,
  MasterDataWithMaps,
} from '@vlight/types'
import {
  computeRandomChannels,
  computeRandomValue,
  filterArrayRandomly,
  randomArrayIndex,
} from '@vlight/utils'

import { mapFixtureList } from './fixtures'

/**
 * Creates the fixture states for a live chase,
 * applying random values where applicable.
 */
export function getLiveChaseFixtureStates(
  liveChase: LiveChase,
  { masterData, masterDataMaps }: MasterDataWithMaps
): Dictionary<FixtureState> {
  const fixtureStates: Dictionary<FixtureState> = {}

  if (!liveChase.colors.length) return fixtureStates

  const members = mapFixtureList(liveChase.members, {
    masterData,
    masterDataMaps,
  })
  const light = computeRandomValue(liveChase.light)
  const activeMembers = filterArrayRandomly(members, light)

  activeMembers.forEach(member => {
    // TODO color distribution (random, equal, relative) - now just equal
    const color = liveChase.colors[randomArrayIndex(liveChase.colors)]

    fixtureStates[member] = {
      on: true,
      channels: computeRandomChannels(color.channels),
    }
  })

  return fixtureStates
}
