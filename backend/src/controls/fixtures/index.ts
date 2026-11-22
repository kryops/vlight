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
  isUniverseChannelFading,
  Universe,
  removeUniverse,
  setUniverseChannels,
  stopUniverseChannelFades,
} from '../../services/universe'
import { controlRegistry } from '../registry'
import { registerApiMessageHandler } from '../../services/api/registry'

import { getInitialFixtureState } from './mapping'

/** The outgoing DMX universes for all fixture groups. */
let fixtureUniverse: Universe

/** A map containing the states of all fixture controls. */
export const fixtureStates: Map<IdType, FixtureState> = new Map()

function isAnyFixtureOn() {
  for (const fixtureState of fixtureStates.values()) {
    if (fixtureState.on) return true
  }

  return false
}

/**
 * Sets the given state to the outgoing fixture DMX universe.
 *
 * @param fade fade time in seconds
 * @returns whether anything was changed.
 */
function setFixtureStateToUniverse(
  fixture: Fixture,
  state: FixtureState,
  fade?: number
): boolean {
  const { type, channel } = fixture
  const fixtureType = masterDataMaps.fixtureTypes.get(type)
  if (!fixtureType || !state) return false

  const values = mapFixtureStateToChannels(fixtureType, state).map(
    (value, index): [number, number] => [channel + index, value]
  )
  return setUniverseChannels(fixtureUniverse, values, {
    fade,
    onFinished: removeUniverseIfUnused,
  })
}

/** Removes the fixture universe if all fixtures are turned off and nothing is fading anymore. */
function removeUniverseIfUnused() {
  if (!isAnyFixtureOn() && !isUniverseChannelFading(fixtureUniverse)) {
    removeUniverse(fixtureUniverse)
  }
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

  if (isAnyFixtureOn()) {
    addUniverse(fixtureUniverse)
  } else {
    removeUniverse(fixtureUniverse)
  }
}

/**
 * @param fade fade time in seconds
 */
function setFixtureState(
  id: IdType,
  state: Partial<FixtureState>,
  merge = false,
  fade?: number
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

  // The universe is added first so that turning on can be faded
  if (newState.on) addUniverse(fixtureUniverse)
  const changed = setFixtureStateToUniverse(fixture, newState, fade)
  if (!newState.on) removeUniverseIfUnused()

  return changed
}

function handleApiMessage(message: ApiFixtureStateMessage) {
  forEach(message.id, id =>
    setFixtureState(id, message.state, message.merge, message.fade)
  )
  return true
}

function reload(reloadState?: boolean) {
  stopUniverseChannelFades(fixtureUniverse)
  removeUniverse(fixtureUniverse)
  fixtureUniverse.fill(0)

  const oldFixtureStates = new Map(fixtureStates)
  fixtureStates.clear()

  setFixtureStatesFrom(
    reloadState
      ? dictionaryToMap(getPersistedState().fixtures)
      : oldFixtureStates
  )
}

export function init(): void {
  const start = Date.now()
  fixtureUniverse = createUniverse()

  const persistedState = dictionaryToMap(getPersistedState().fixtures)
  setFixtureStatesFrom(persistedState)

  controlRegistry.register({ reload })
  registerApiMessageHandler('fixture', handleApiMessage)

  howLong(start, 'initFixtures')
}
