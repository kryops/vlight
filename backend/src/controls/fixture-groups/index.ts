import { IdType, FixtureState, FixtureGroup, Fixture } from '@vlight/entities'
import { ApiFixtureGroupStateMessage } from '@vlight/api'

import { masterDataMaps, masterData } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import {
  Universe,
  createUniverse,
  addUniverse,
  setUniverseChannel,
  removeUniverse,
} from '../../services/universe'
import { logWarn } from '../../util/log'
import { dictionaryToMap } from '../../util/shared'
import { howLong } from '../../util/time'
import { isUnique, isTruthy } from '../../util/shared'
import {
  getInitialFixtureState,
  mapFixtureStateToChannels,
} from '../fixtures/mapping'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

const universes: Map<IdType, Universe> = new Map()
export const fixtureGroupStates: Map<IdType, FixtureState> = new Map()

function getAllFixturesOfGroup(fixtureGroup: FixtureGroup): Fixture[] {
  return fixtureGroup.fixtures
    .map(id => masterDataMaps.fixtures.get(id))
    .filter(isTruthy)
}

function getFixtureGroupMapping(fixtureGroup: FixtureGroup) {
  return getAllFixturesOfGroup(fixtureGroup)
    .flatMap(fixture => {
      const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)
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
    const fixtureType = masterDataMaps.fixtureTypes.get(type)!
    mapFixtureStateToChannels(fixtureType, state).forEach((value, index) => {
      if (setUniverseChannel(universe, channel + index, value)) {
        changed = true
      }
    })
  }
  return changed
}

function initFixtureGroup(
  fixtureGroup: FixtureGroup,
  oldFixtureGroupStates: Map<IdType, FixtureState>
) {
  const { id } = fixtureGroup
  const universe = createUniverse()
  universes.set(id, universe)
  const initialState =
    oldFixtureGroupStates.get(id) ??
    getInitialFixtureState(getFixtureGroupMapping(fixtureGroup))

  if (initialState.on) addUniverse(universe)

  fixtureGroupStates.set(id, initialState)
  setFixtureGroupStateToUniverse(fixtureGroup, initialState)
}

function setFixtureGroupState(id: IdType, state: FixtureState): boolean {
  const fixtureGroup = masterDataMaps.fixtureGroups.get(id)
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

function handleApiMessage(message: ApiFixtureGroupStateMessage) {
  setFixtureGroupState(message.id, message.state)
  return true
}

function reload() {
  const oldFixtureGroupStates = new Map(fixtureGroupStates)
  fixtureGroupStates.clear()

  for (const universe of universes.values()) {
    removeUniverse(universe)
  }
  universes.clear()

  masterData.fixtureGroups.forEach(fixtureGroup =>
    initFixtureGroup(fixtureGroup, oldFixtureGroupStates)
  )
}

export function init(): void {
  const start = Date.now()
  const persistedState = dictionaryToMap(getPersistedState().fixtureGroups)
  masterData.fixtureGroups.forEach(fixtureGroup =>
    initFixtureGroup(fixtureGroup, persistedState)
  )

  controlRegistry.register({ reload })
  registerApiMessageHandler('fixture-group', handleApiMessage)

  howLong(start, 'initFixtureGroups')
}
