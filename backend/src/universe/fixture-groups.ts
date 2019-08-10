import { IdType, FixtureState, FixtureGroup, Fixture } from '@vlight/entities'

import { fixtureGroups, fixtures, fixtureTypes } from '../database'
import { getPersistedState } from '../database/state'
import { logWarn } from '../util/log'
import { isUnique, isTruthy } from '../util/validation'

import {
  getInitialFixtureState,
  mapFixtureStateToChannels,
} from './fixtures/mapping'

import {
  Universe,
  createUniverse,
  addUniverse,
  setUniverseChannel,
  removeUniverse,
} from '.'

const universes: Map<IdType, Universe> = new Map()
export const fixtureGroupStates: Map<IdType, FixtureState> = new Map()

function getAllFixturesOfGroup(fixtureGroup: FixtureGroup): Fixture[] {
  return fixtureGroup.fixtures.map(id => fixtures.get(id)).filter(isTruthy)
}

function getFixtureGroupMapping(fixtureGroup: FixtureGroup) {
  return getAllFixturesOfGroup(fixtureGroup)
    .flatMap(fixture => {
      const fixtureType = fixtureTypes.get(fixture.type)
      return fixtureType ? fixtureType.mapping : []
    })
    .filter(isUnique)
}

function setFixtureGroupStateToUniverse(
  fixtureGroup: FixtureGroup,
  state: FixtureState
): boolean {
  const universe = universes.get(fixtureGroup.id)
  const fixtures = getAllFixturesOfGroup(fixtureGroup)
  if (!universe) return false

  let changed = false
  for (const { type, channel } of fixtures) {
    const fixtureType = fixtureTypes.get(type)!
    mapFixtureStateToChannels(fixtureType, state).forEach((value, index) => {
      if (setUniverseChannel(universe, channel + index, value)) {
        changed = true
      }
    })
  }
  return changed
}

function initFixtureGroup(fixtureGroup: FixtureGroup) {
  let universe = createUniverse()
  universes.set(fixtureGroup.id, universe)
  const initialState =
    getPersistedState().fixtureGroups[fixtureGroup.id] ||
    getInitialFixtureState(getFixtureGroupMapping(fixtureGroup))

  if (initialState.on) addUniverse(universe)

  fixtureGroupStates.set(fixtureGroup.id, initialState)
  setFixtureGroupStateToUniverse(fixtureGroup, initialState)
}

export function initFixtureGroups() {
  fixtureGroups.forEach(initFixtureGroup)
}

export function setFixtureGroupState(id: IdType, state: FixtureState): boolean {
  const fixtureGroup = fixtureGroups.get(id)
  if (!fixtureGroup) {
    logWarn('no fixture group found for ID', id)
    return false
  }
  const oldState = fixtureGroupStates.get(id)!
  fixtureGroupStates.set(id, state)

  const universe = universes.get(id)!

  if (!oldState.on && state.on) addUniverse(universe)
  else if (oldState.on && !state.on) removeUniverse(universe)

  return setFixtureGroupStateToUniverse(fixtureGroup, state)
}
