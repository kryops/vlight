import { Dictionary, FixtureState, MemoryState } from '@vlight/entities'

import { mapToDictionary } from '../util/map'
import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { memoryStates } from '../controls/memories'
import { statePersistenceFlushInterval } from '../config'
import { logTrace } from '../util/log'

import { serialize, writeEntity } from './util'

import { relativeConfigDirectoryPath } from '.'

export interface PersistedState {
  channels: Dictionary<number>
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
  memories: Dictionary<MemoryState>
}

const stateConfigFileName = 'state'

let persistedState: PersistedState = {
  channels: {},
  fixtures: {},
  fixtureGroups: {},
  memories: {},
}
let persistedStateString: string

function isNotInitialState({ initial }: FixtureState | MemoryState) {
  return !initial
}

function getCurrentState(): PersistedState {
  const channels = Array.from(channelUniverse).reduce((acc, cur, index) => {
    if (cur > 0) acc[index.toString()] = cur
    return acc
  }, {} as Dictionary<number>)
  return {
    channels,
    fixtures: mapToDictionary(fixtureStates, isNotInitialState),
    fixtureGroups: mapToDictionary(fixtureGroupStates, isNotInitialState),
    memories: mapToDictionary(memoryStates, isNotInitialState),
  }
}

async function checkAndPersistCurrentState() {
  const currentState = getCurrentState()
  const currentStateString = serialize(currentState)
  if (currentStateString === persistedStateString) return

  logTrace('Persisting application state')
  await writeEntity(stateConfigFileName, currentStateString)
  persistedStateString = currentStateString
}

export function getPersistedState(): PersistedState {
  return persistedState
}

export function initPersistedState() {
  try {
    persistedState = require(relativeConfigDirectoryPath + stateConfigFileName)
  } catch {
    // do nothing
  }

  persistedStateString = serialize(persistedState)

  setInterval(checkAndPersistCurrentState, statePersistenceFlushInterval)
}
