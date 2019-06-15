import { ApiInMessage } from '@vlight/api'
import { FixtureState, IdType } from '@vlight/entities'

import { logTrace } from '../util/log'

import { updateFixtureState } from './fixture'
import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
  getApiFixtureGroupStateMessage,
} from './protocol'
// @ts-ignore
import ApiWorker, { ApiWorkerCommand } from './worker/api.worker'

export const apiWorker: Worker = new ApiWorker()

export function sendApiMessage(message: ApiInMessage) {
  logTrace('Sending WebSocket message', message)
  const command: ApiWorkerCommand = { type: 'message', message }
  apiWorker.postMessage(command)
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
