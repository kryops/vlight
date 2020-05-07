import { FixtureState, IdType, Fixture } from '@vlight/entities'

import { fixtures, fixtureTypes } from '../../services/database'
import { getPersistedState } from '../../services/state'
import { logWarn } from '../../util/log'
import { dictionaryToMap } from '../../util/shared'
import { howLong } from '../../util/time'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
  removeUniverse,
} from '../../services/universe'

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

function setFixtureStatesFrom(oldFixtureStates: Map<IdType, FixtureState>) {
  fixtures.forEach(fixture => {
    const { id, type } = fixture
    const fixtureType = fixtureTypes.get(type)
    const state =
      oldFixtureStates.get(id) ?? getInitialFixtureState(fixtureType?.mapping)

    fixtureStates.set(id, state)
    setFixtureStateToUniverse(fixture, state)
  })
}

export function initFixtures() {
  const start = Date.now()
  fixtureUniverse = createUniverse()

  const persistedState = dictionaryToMap(getPersistedState().fixtures)
  setFixtureStatesFrom(persistedState)

  addUniverse(fixtureUniverse)
  howLong(start, 'initFixtures')
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

export function reloadFixtures() {
  removeUniverse(fixtureUniverse)
  fixtureUniverse.fill(0)
  addUniverse(fixtureUniverse)

  const oldFixtureStates = new Map(fixtureStates)
  fixtureStates.clear()

  setFixtureStatesFrom(oldFixtureStates)
}
