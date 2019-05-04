import { FixtureState, IdType } from '@vlight/entities'

import { addUniverse, createUniverse, setUniverseChannel, Universe } from '..'

import { fixtures, fixtureTypes } from '../../database'
import { logWarn } from '../../util/log'

import { mapFixtureStateToChannels, getInitialFixtureState } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<IdType, FixtureState> = new Map()

export function initFixtures() {
  fixtureUniverse = createUniverse()

  fixtures.forEach(({ id, type }) => {
    const fixtureType = fixtureTypes.get(type)

    fixtureStates.set(
      id,
      getInitialFixtureState(fixtureType && fixtureType.mapping)
    )
  })

  addUniverse(fixtureUniverse)
}

export function setFixtureState(id: IdType, state: FixtureState): boolean {
  const fixture = fixtures.get(id)
  if (!fixture) {
    logWarn('no fixture found for ID', id)
    return false
  }
  fixtureStates.set(id, state)

  const fixtureType = fixtureTypes.get(fixture.type)!
  const channel = fixture.channel

  let changed = false

  mapFixtureStateToChannels(fixtureType, state).forEach((value, index) => {
    if (setUniverseChannel(fixtureUniverse, channel + index, value)) {
      changed = true
    }
  })

  return changed
}
