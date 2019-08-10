import { FixtureState, IdType, Fixture } from '@vlight/entities'

import { fixtures, fixtureTypes } from '../../database'
import { getPersistedState } from '../../database/state'
import { logWarn } from '../../util/log'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
} from '../index'

import { mapFixtureStateToChannels, getInitialFixtureState } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<IdType, FixtureState> = new Map()

function setFixtureStateToUniverse(
  fixture: Fixture,
  state: FixtureState
): boolean {
  const { type, channel } = fixture
  const fixtureType = fixtureTypes.get(type)
  if (!fixtureType || !state) return false

  let changed = false
  mapFixtureStateToChannels(fixtureType, state).forEach((value, index) => {
    if (setUniverseChannel(fixtureUniverse, channel + index, value)) {
      changed = true
    }
  })
  return changed
}

export function initFixtures() {
  fixtureUniverse = createUniverse()

  fixtures.forEach(fixture => {
    const { id, type } = fixture
    const fixtureType = fixtureTypes.get(type)
    const state =
      getPersistedState().fixtures[id] ||
      getInitialFixtureState(fixtureType && fixtureType.mapping)

    fixtureStates.set(id, state)
    setFixtureStateToUniverse(fixture, state)
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
  return setFixtureStateToUniverse(fixture, state)
}
