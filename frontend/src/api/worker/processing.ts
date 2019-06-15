import { ApiOutMessage } from '@vlight/api'
import { Dictionary, FixtureState, MasterData } from '@vlight/entities'

import { logError, logTrace } from '../../util/log'
import { assertNever } from '../../util/typescript'
import { getUniverseIndex } from '../util'

export interface ApiState {
  masterData: MasterData | undefined
  universe: number[] | undefined
  channels: number[] | undefined
  fixtures: Dictionary<FixtureState>
  fixtureGroups: Dictionary<FixtureState>
}

function processChannelDeltaMap(
  universe: number[] | undefined,
  message: { [channel: number]: number }
) {
  const newUniverse = [...(universe || [])]
  for (const [channel, value] of Object.entries(message)) {
    newUniverse[getUniverseIndex(+channel)] = value
  }
  return newUniverse
}

function processApiMessage(message: ApiOutMessage, state: ApiState) {
  switch (message.type) {
    case 'state':
      state.masterData = message.masterData
      state.universe = message.universe
      state.channels = message.channels
      state.fixtures = message.fixtures
      state.fixtureGroups = message.fixtureGroups
      break

    case 'masterdata':
      state.masterData = message.masterData
      break

    case 'universe':
      state.universe = message.universe
      break

    case 'universe-delta':
      state.universe = processChannelDeltaMap(state.universe, message.channels)
      break

    case 'channels':
      state.channels = processChannelDeltaMap(state.channels, message.channels)
      break

    case 'fixture':
      state.fixtures = {
        ...state.fixtures,
        [message.id]: message.state,
      }
      break

    case 'fixture-group':
      state.fixtureGroups = {
        ...state.fixtureGroups,
        [message.id]: message.state,
      }
      break

    default:
      assertNever(message)
      logError('Invalid API message received:', message)
  }
}

export function processApiMessages(
  messages: ApiOutMessage[],
  apiState: ApiState
): ApiState {
  logTrace(`Processing ${messages.length} API messages`)

  const newState = { ...apiState }

  for (const message of messages) {
    processApiMessage(message, newState)
  }

  return newState
}
