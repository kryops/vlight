import { promises } from 'fs'
import { join } from 'path'

import { Dictionary, FixtureState, MemoryState } from '@vlight/types'
import { mapToDictionary, logger } from '@vlight/utils'

import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { memoryStates } from '../controls/memories'
import { howLong } from '../util/time'
import { reloadControls } from '../controls'

import {
  statePersistenceFlushInterval,
  project,
  configDirectoryPath,
} from './config'
import { broadcastApplicationStateToApiClients } from './api'
import { registerApiMessageHandler } from './api/registry'

const { writeFile } = promises

export interface PersistedState {
  channels: Dictionary<number>
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
  memories: Dictionary<MemoryState>
}

const stateConfigFileName = 'state'

function getEmptyPersistedState(): PersistedState {
  return {
    channels: {},
    fixtures: {},
    fixtureGroups: {},
    memories: {},
  }
}

let persistedState: PersistedState = getEmptyPersistedState()
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

function serializeState(value: any) {
  return `module.exports = ${JSON.stringify(value, null, 2)};\n`
}

async function checkAndPersistCurrentState() {
  const currentState = getCurrentState()
  const currentStateString = serializeState(currentState)
  if (currentStateString === persistedStateString) return

  logger.debug('Persisting application state')

  await writeFile(
    join(configDirectoryPath, project, 'state.js'),
    currentStateString
  )

  persistedStateString = currentStateString
}

export function getPersistedState(): PersistedState {
  return persistedState
}

export function resetState(): void {
  persistedState = getEmptyPersistedState()
  reloadControls(true)
  broadcastApplicationStateToApiClients()
}

export function initPersistedState(): void {
  const start = Date.now()
  try {
    const statePath = join(configDirectoryPath, project, stateConfigFileName)
    persistedState = require(statePath)
  } catch {
    // do nothing
  }

  persistedStateString = serializeState(persistedState)

  registerApiMessageHandler('reset-state', () => {
    resetState()
    return false
  })

  setInterval(checkAndPersistCurrentState, statePersistenceFlushInterval)
  howLong(start, 'initPersistedState')
}
