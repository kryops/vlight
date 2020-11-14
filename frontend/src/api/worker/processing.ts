import {
  ApiOutMessage,
  ApiStateMessage,
  LiveMemory,
  MasterData,
} from '@vlight/types'
import { logger, assertNever, forEach, mergeObjects } from '@vlight/utils'
import { mergeFixtureStates, mergeMemoryStates } from '@vlight/controls'

import { getUniverseIndex } from '../util'

let stateVersion = 0

export type ApiState = {
  [key in keyof Omit<ApiStateMessage, 'type'>]: ApiStateMessage[key] extends
    | any[]
    | MasterData
    ? ApiStateMessage[key] | undefined
    : ApiStateMessage[key]
} & {
  version?: number
}

function processChannelDeltaMap(
  universe: number[] | undefined,
  message: { [channel: number]: number }
) {
  const newUniverse = [...(universe ?? [])]
  for (const [channel, value] of Object.entries(message)) {
    newUniverse[getUniverseIndex(+channel)] = value
  }
  return newUniverse
}

function processApiMessage(message: ApiOutMessage, state: Partial<ApiState>) {
  switch (message.type) {
    case 'state':
      const { type, ...rest } = message

      // type checking
      const partialState: ApiState = rest

      Object.assign(state, partialState)
      state.version = ++stateVersion

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
      }

      forEach(
        message.id,
        id =>
          (state.fixtures![id] = mergeFixtureStates(
            message.merge ? state.fixtures![id] : undefined,
            message.state
          ))
      )
      break

    case 'fixture-group':
      state.fixtureGroups = {
        ...state.fixtureGroups,
      }

      forEach(
        message.id,
        id =>
          (state.fixtureGroups![id] = mergeFixtureStates(
            message.merge ? state.fixtureGroups![id] : undefined,
            message.state
          ))
      )
      break

    case 'memory':
      state.memories = {
        ...state.memories,
      }
      forEach(
        message.id,
        id =>
          (state.memories![id] = mergeMemoryStates(
            message.merge ? state.memories![id] : undefined,
            message.state
          ))
      )
      break

    case 'live-memory':
      state.liveMemories = {
        ...state.liveMemories,
        [message.id]: message.merge
          ? mergeObjects(state.liveMemories?.[message.id], message.state)
          : (message.state as LiveMemory),
      }
      break

    default:
      assertNever(message)
      logger.error('Invalid API message received:', message)
  }
}

export function processApiMessages(
  messages: ApiOutMessage[],
  apiState: ApiState | undefined
): ApiState {
  logger.debug(`Processing ${messages.length} API messages`)

  const newState = { ...apiState }

  for (const message of messages) {
    processApiMessage(message, newState)
  }

  return newState as ApiState
}
