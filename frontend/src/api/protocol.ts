import {
  ApiChannelMessage,
  ApiFixtureStateMessage,
  ApiFixtureGroupStateMessage,
} from '@vlight/api'
import { FixtureState, IdType } from '@vlight/entities'

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
