import { ApiInMessage } from '@vlight/api'
import { FixtureState, IdType } from '@vlight/entities'

import { logTrace, logWarn } from '../util/log'

import { updateFixtureState } from './fixture'
import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
  getApiFixtureGroupStateMessage,
} from './protocol'

let socket: WebSocket | undefined

export function sendApiMessage(message: ApiInMessage) {
  logTrace('Sending WebSocket message', message)
  if (!socket) {
    logWarn('Tried to send socket message but was not connected', message)
  } else {
    socket.send(JSON.stringify(message))
  }
}

export function setSocket(newSocket: WebSocket | undefined) {
  socket = newSocket

  if (process.env.NODE_ENV === 'development') {
    ;(window as any).socket = socket
  }
}

export function setChannel(channel: number, value: number) {
  sendApiMessage(getApiChannelMessage(channel, value))
}

export function setFixtureState(id: IdType, state: FixtureState) {
  sendApiMessage(getApiFixtureStateMessage(id, state))
}

export function setFixtureGroupState(id: IdType, state: FixtureState) {
  sendApiMessage(getApiFixtureGroupStateMessage(id, state))
}

export function changeFixtureState(
  id: IdType,
  oldState: FixtureState,
  newState: Partial<FixtureState>
) {
  sendApiMessage(
    getApiFixtureStateMessage(id, updateFixtureState(oldState, newState))
  )
}

export function changeFixtureGroupState(
  id: IdType,
  oldState: FixtureState,
  newState: Partial<FixtureState>
) {
  sendApiMessage(
    getApiFixtureGroupStateMessage(id, updateFixtureState(oldState, newState))
  )
}
