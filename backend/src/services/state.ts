import { promises } from 'fs'
import { join } from 'path'

import { Dictionary, FixtureState, MemoryState } from '@vlight/entities'

import { mapToDictionary } from '../util/shared'
import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { memoryStates } from '../controls/memories'
import { logTrace } from '../util/log'
import { howLong } from '../util/time'

import {
  statePersistenceFlushInterval,
  project,
  configDirectoryPath,
} from './config'

const { writeFile } = promises

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

function serializeState(value: any) {
  return `module.exports = ${JSON.stringify(value, null, 2)};\n`
}

async function checkAndPersistCurrentState() {
  const currentState = getCurrentState()
  const currentStateString = serializeState(currentState)
  if (currentStateString === persistedStateString) return

  logTrace('Persisting application state')

  await writeFile(
    join(configDirectoryPath, project, 'state.js'),
    currentStateString
  )

  persistedStateString = currentStateString
}

export function getPersistedState(): PersistedState {
  return persistedState
}

export function initPersistedState() {
  const start = Date.now()
  try {
    const statePath = join(configDirectoryPath, project, stateConfigFileName)
    persistedState = require(statePath)
  } catch {
    // do nothing
  }

  persistedStateString = serializeState(persistedState)

  setInterval(checkAndPersistCurrentState, statePersistenceFlushInterval)
  howLong(start, 'initPersistedState')
}
