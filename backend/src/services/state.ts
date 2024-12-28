import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import {
  Dictionary,
  FixtureChannels,
  FixtureState,
  LiveChase,
  LiveMemory,
  MemoryState,
} from '@vlight/types'
import { mapToDictionary, logger } from '@vlight/utils'

import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { liveMemories, memoryStates } from '../controls/memories'
import { howLong } from '../util/time'
import { reloadControls } from '../controls'
import { liveChases } from '../controls/chases/live-chases'

import {
  statePersistenceFlushInterval,
  project,
  configDirectoryPath,
} from './config'
import { broadcastApplicationStateToApiClients } from './api'
import { registerApiMessageHandler } from './api/registry'
import { getDmxMaster, getDmxMasterFade } from './universe'

/** The state that is persisted to disk. */
export interface PersistedState {
  channels: FixtureChannels
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
  memories: Dictionary<MemoryState>
  liveMemories: Dictionary<LiveMemory>
  liveChases: Dictionary<LiveChase>
  dmxMaster: number
  dmxMasterFade: number
}

const stateConfigFileName = 'state'

function getEmptyPersistedState(): PersistedState {
  return {
    channels: {},
    fixtures: {},
    fixtureGroups: {},
    memories: {},
    liveMemories: {},
    liveChases: {},
    dmxMaster: 255,
    dmxMasterFade: 0,
  }
}

/** The currently persisted state. */
let persistedState: PersistedState = getEmptyPersistedState()

/**
 * The state is serialized into a string and compared with this string to see if it has changed.
 */
let persistedStateString: string

function isNotInitialState({ initial }: FixtureState | MemoryState) {
  return !initial
}

/**
 * Returns the current state of all controls.
 */
function getCurrentState(): PersistedState {
  const channels = Array.from(channelUniverse).reduce((acc, cur, index) => {
    if (cur > 0) acc[index.toString()] = cur
    return acc
  }, {} as FixtureChannels)
  return {
    channels,
    fixtures: mapToDictionary(fixtureStates, isNotInitialState),
    fixtureGroups: mapToDictionary(fixtureGroupStates, isNotInitialState),
    memories: mapToDictionary(memoryStates, isNotInitialState),
    liveMemories: mapToDictionary(liveMemories),
    liveChases: mapToDictionary(liveChases),
    dmxMaster: getDmxMaster(),
    dmxMasterFade: getDmxMasterFade(),
  }
}

/**
 * Serializes the state into a string.
 *
 * Creates JavaScript code that can just be required when loading the persisted state.
 */
function serializeState(value: any) {
  return `module.exports = ${JSON.stringify(value, null, 2)};\n`
}

/**
 * Persists the current state if it has changed.
 */
async function checkAndPersistCurrentState() {
  const currentState = getCurrentState()
  const currentStateString = serializeState(currentState)
  if (currentStateString === persistedStateString) return

  logger.debug('Persisting application state')

  const projectDirectory = join(configDirectoryPath, project)

  try {
    await stat(projectDirectory)
  } catch {
    await mkdir(projectDirectory)
  }

  await writeFile(join(projectDirectory, 'state.js'), currentStateString)

  persistedStateString = currentStateString
}

/**
 * Returns the current persisted state.
 */
export function getPersistedState(): PersistedState {
  return persistedState
}

/**
 * Resets the persisted state and reloads all controls.
 *
 * NOTE: Some controls are not contained in the master data, but only saved as state
 * (e.g. live memories, live chases). These controls are deleted when resetting the state.
 */
export function resetState(): void {
  persistedState = getEmptyPersistedState()
  reloadControls(true)
  broadcastApplicationStateToApiClients()
}

export function initPersistedState(): void {
  const start = Date.now()
  try {
    const statePath = join(configDirectoryPath, project, stateConfigFileName)
    persistedState = {
      ...getEmptyPersistedState(),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ...require(statePath),
    }
  } catch {
    // do nothing
  }

  persistedStateString = serializeState(persistedState)

  registerApiMessageHandler('reset-state', () => {
    resetState()
    // do not broadcast this message; the complete state is broadcast anyway
    return false
  })

  setInterval(checkAndPersistCurrentState, statePersistenceFlushInterval)
  howLong(start, 'initPersistedState')
}
