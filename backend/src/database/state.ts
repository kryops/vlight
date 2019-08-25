import { Dictionary, FixtureState } from '@vlight/entities'

import { mapToDictionary } from '../util/map'
import { channelUniverse } from '../controls/channels'
import { fixtureStates } from '../controls/fixtures'
import { fixtureGroupStates } from '../controls/fixture-groups'
import { statePersistenceFlushInterval } from '../config'
import { logTrace } from '../util/log'

import { serialize, writeEntity } from './util'

import { relativeConfigDirectoryPath } from '.'

export interface PersistedState {
  channels: Dictionary<number>
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
}

const stateConfigFileName = 'state'

let persistedState: PersistedState = {
  channels: {},
  fixtures: {},
  fixtureGroups: {},
}
let persistedStateString: string

function isNotInitialFixtureState({ initial }: FixtureState) {
  return !initial
}

function getCurrentState(): PersistedState {
  const channels = Array.from(channelUniverse).reduce(
    (acc, cur, index) => {
      if (cur > 0) acc[index.toString()] = cur
      return acc
    },
    {} as Dictionary<number>
  )
  return {
    channels,
    fixtures: mapToDictionary(fixtureStates, isNotInitialFixtureState),
    fixtureGroups: mapToDictionary(
      fixtureGroupStates,
      isNotInitialFixtureState
    ),
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
