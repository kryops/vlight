import { ApiChannelMessage, ApiFixtureStateMessage } from '@vlight/api'
import { FixtureState } from '@vlight/entities'

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
  id: number,
  state: FixtureState
): ApiFixtureStateMessage {
  return {
    type: 'fixture',
    id,
    state,
  }
}
