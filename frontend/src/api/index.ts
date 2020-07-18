import { ApiInMessage } from '@vlight/api'
import { FixtureState, IdType, MemoryState, EntityName } from '@vlight/entities'

import { socketProcessingInterval, useSocketUpdateThrottling } from '../config'
import { logger } from '../util/shared'

import { updateFixtureState } from './fixture'
import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
  getApiFixtureGroupStateMessage,
  getApiMemoryStateMessage,
  getApiRemoveEntityMessage,
} from './protocol'
import { ApiWorkerCommand } from './worker/api.worker'

export const apiWorker = new Worker('./worker/api.worker.ts', {
  type: 'module',
})

export function sendApiMessage(message: ApiInMessage): void {
  logger.trace('Sending WebSocket message', message)
  const command: ApiWorkerCommand = { type: 'message', message }
  apiWorker.postMessage(command)
}

export function setChannel(channel: number, value: number): void {
  sendApiMessage(getApiChannelMessage(channel, value))
}

export function setFixtureState(id: IdType, state: FixtureState): void {
  sendApiMessage(getApiFixtureStateMessage(id, state))
}

export function setFixtureGroupState(id: IdType, state: FixtureState): void {
  sendApiMessage(getApiFixtureGroupStateMessage(id, state))
}

export function changeFixtureState(
  id: IdType,
  oldState: FixtureState,
  newState: Partial<FixtureState>
): void {
  sendApiMessage(
    getApiFixtureStateMessage(id, updateFixtureState(oldState, newState))
  )
}

export function changeFixtureGroupState(
  id: IdType,
  oldState: FixtureState,
  newState: Partial<FixtureState>
): void {
  sendApiMessage(
    getApiFixtureGroupStateMessage(id, updateFixtureState(oldState, newState))
  )
}

export function changeMemoryState(id: IdType, state: MemoryState): void {
  sendApiMessage(getApiMemoryStateMessage(id, state))
}

export function removeEntity(entity: EntityName, id: IdType): void {
  sendApiMessage(getApiRemoveEntityMessage(entity, id))
}

export function initApiWorker(): void {
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
      logger.trace(`API request throttling at ${updatesPerSecond} fps`)
      if (currentSecond !== lastSecond + 1) {
        logger.debug('API request throttling skipped multiple seconds')
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
