import {
  ApiChannelMessage,
  ApiFixtureStateMessage,
  ApiFixtureGroupStateMessage,
  ApiMemoryStateMessage,
} from '@vlight/api'
import { FixtureState, IdType, MemoryState } from '@vlight/entities'

export function getApiChannelMessage(
  channel: number,
  value: number
): ApiChannelMessage {
  return {
    type: 'channels',
    channels: {
      [channel]: value,
    },
  }
}

export function getApiFixtureStateMessage(
  id: IdType,
  state: FixtureState
): ApiFixtureStateMessage {
  return {
    type: 'fixture',
    id,
    state,
  }
}

export function getApiFixtureGroupStateMessage(
  id: IdType,
  state: FixtureState
): ApiFixtureGroupStateMessage {
  return {
    type: 'fixture-group',
    id,
    state,
  }
}

export function getApiMemoryStateMessage(
  id: IdType,
  state: MemoryState
): ApiMemoryStateMessage {
  return {
    type: 'memory',
    id,
    state,
  }
}
