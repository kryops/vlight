import {
  FixtureState,
  IdType,
  Fixture,
  ApiFixtureStateMessage,
} from '@vlight/types'
import { mergeFixtureStates, mapFixtureStateToChannels } from '@vlight/controls'
import { dictionaryToMap, logger, forEach } from '@vlight/utils'

import { masterDataMaps, masterData } from '../../services/masterdata'
import { getPersistedState } from '../../services/state'
import { howLong } from '../../util/time'
import {
  addUniverse,
  createUniverse,
  setUniverseChannel,
  Universe,
  removeUniverse,
} from '../../services/universe'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

import { getInitialFixtureState } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<IdType, FixtureState> = new Map()

function setFixtureStateToUniverse(
  fixture: Fixture,
  state: FixtureState
): boolean {
  const { type, channel } = fixture
  const fixtureType = masterDataMaps.fixtureTypes.get(type)
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
  masterData.fixtures.forEach(fixture => {
    const { id, type } = fixture
    const fixtureType = masterDataMaps.fixtureTypes.get(type)
    const state =
      oldFixtureStates.get(id) ?? getInitialFixtureState(fixtureType?.mapping)

    fixtureStates.set(id, state)
    setFixtureStateToUniverse(fixture, state)
  })
}

function setFixtureState(
  id: IdType,
  state: Partial<FixtureState>,
  merge = false
): boolean {
  const fixture = masterDataMaps.fixtures.get(id)
  if (!fixture) {
    logger.warn('no fixture found for ID', id)
    return false
  }

  const mapping = masterDataMaps.fixtureTypes.get(fixture.type)?.mapping

  const newState = mergeFixtureStates(
    merge ? fixtureStates.get(id) : undefined,
    state,
    mapping
  )

  fixtureStates.set(id, newState)
  return setFixtureStateToUniverse(fixture, newState)
}

function handleApiMessage(message: ApiFixtureStateMessage) {
  forEach(message.id, id => setFixtureState(id, message.state, message.merge))
  return true
}

function reload() {
  removeUniverse(fixtureUniverse)
  fixtureUniverse.fill(0)
  addUniverse(fixtureUniverse)

  const oldFixtureStates = new Map(fixtureStates)
  fixtureStates.clear()

  setFixtureStatesFrom(oldFixtureStates)
}

export function init(): void {
  const start = Date.now()
  fixtureUniverse = createUniverse()

  const persistedState = dictionaryToMap(getPersistedState().fixtures)
  setFixtureStatesFrom(persistedState)

  addUniverse(fixtureUniverse)

  controlRegistry.register({ reload })
  registerApiMessageHandler('fixture', handleApiMessage)

  howLong(start, 'initFixtures')
}
