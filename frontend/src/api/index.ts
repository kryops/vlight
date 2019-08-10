import { ApiInMessage } from '@vlight/api'
import { FixtureState, IdType } from '@vlight/entities'

import { logTrace } from '../util/log'
import { socketProcessingInterval, useSocketUpdateThrottling } from '../config'

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

export function initApiWorker() {
  if (!useSocketUpdateThrottling) return

  const updateMessage: ApiWorkerCommand = { type: 'update' }

  let lastUpdate = Date.now()
  let lastSecond = Math.floor(lastUpdate / 1000)
  let updatesPerSecond = 0

  const requestUpdate = () => {
    const now = Date.now()
    // limit to 20fps
    if (now - lastUpdate < 50) return
    apiWorker.postMessage(updateMessage)
    const currentSecond = Math.floor(now / 1000)
    if (currentSecond !== lastSecond) {
      logTrace(`API request throttling at ${updatesPerSecond} fps`)
      if (currentSecond !== lastSecond + 1) {
        logTrace('API request throttling skipped multiple seconds')
      }
      lastSecond = currentSecond
      updatesPerSecond = 0
    }
    updatesPerSecond++
    lastUpdate = now
  }

  if ('requestIdleCallback' in window) {
    const requestIdleUpdate = () => {
      requestUpdate()
      window.requestIdleCallback!(requestIdleUpdate)
    }
    window.requestIdleCallback!(requestIdleUpdate)

    // backup: We want at least 2 fps even if we're busy
    setInterval(requestUpdate, 500)
  } else {
    setInterval(requestUpdate, socketProcessingInterval)
  }
}
