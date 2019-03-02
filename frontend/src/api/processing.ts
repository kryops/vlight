import { ApiOutMessage } from '@vlight/api'
import { MasterData } from '@vlight/entities'

import { logError, logTrace } from '../util/log'

export interface ApiState {
  masterData: MasterData | undefined
  universe: number[] | undefined
  channels: number[] | undefined
}

function processChannelDeltaMap(
  universe: number[] | undefined,
  message: { [channel: number]: number }
) {
  const newUniverse = [...(universe || [])]
  for (const [channel, value] of Object.entries(message)) {
    newUniverse[+channel - 1] = value
  }
  return newUniverse
}

function processApiMessage(message: ApiOutMessage, state: ApiState) {
  switch (message.type) {
    case 'state':
      state.masterData = message.masterData
      state.universe = message.universe
      state.channels = message.channels
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

    default:
      logError('Invalid API message received:', message)
  }
}

export function processApiMessages(
  messages: ApiOutMessage[],
  apiState: ApiState
) {
  logTrace(`Processing ${messages.length} API messages`)

  const newState = { ...apiState }

  for (const message of messages) {
    processApiMessage(message, newState)
  }

  return newState
}
