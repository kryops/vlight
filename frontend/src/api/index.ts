import {
  ApiInMessage,
  FixtureState,
  IdType,
  MemoryState,
  EntityName,
  EntityType,
  LiveMemory,
  LiveChase,
} from '@vlight/types'
import { logger } from '@vlight/utils'

import { socketProcessingInterval, useSocketUpdateThrottling } from '../config'

import {
  getApiChannelMessage,
  getApiFixtureStateMessage,
  getApiFixtureGroupStateMessage,
  getApiMemoryStateMessage,
  getApiRemoveEntityMessage,
  getApiEditEntityMessage,
  getApiSetEntitiesMessage,
  getResetStateMessage,
  getApiLiveMemoryMessage,
  getApiLiveChaseMessage,
} from './protocol'
import { ApiWorkerCommand } from './worker/api.worker'

export const apiWorker = new Worker(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore cannot change module type, as otherwise the webpack configuration won't compile
  new URL('./worker/api.worker.ts', import.meta.url)
)

export function sendApiMessage(message: ApiInMessage): void {
  logger.trace('Sending WebSocket message', message)
  const command: ApiWorkerCommand = { type: 'message', message }
  apiWorker.postMessage(command)
}

export function setChannel(channel: number, value: number): void {
  sendApiMessage(getApiChannelMessage([channel], value))
}

export function setChannels(channels: number[], value: number): void {
  sendApiMessage(getApiChannelMessage(channels, value))
}

export function setFixtureState(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge = false
): void {
  sendApiMessage(getApiFixtureStateMessage(id, state, merge))
}

export function setFixtureGroupState(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge = false
): void {
  sendApiMessage(getApiFixtureGroupStateMessage(id, state, merge))
}

export function setMemoryState(
  id: IdType | IdType[],
  state: Partial<MemoryState>,
  merge = false
): void {
  sendApiMessage(getApiMemoryStateMessage(id, state, merge))
}

export function setLiveMemoryState(
  id: IdType,
  state: Partial<LiveMemory>,
  merge = false
): void {
  sendApiMessage(getApiLiveMemoryMessage(id, state, merge))
}

export function setLiveChaseState(
  id: IdType,
  state: Partial<LiveChase>,
  merge = false
): void {
  sendApiMessage(getApiLiveChaseMessage(id, state, merge))
}

export function removeEntity(entity: EntityName, id: IdType): void {
  sendApiMessage(getApiRemoveEntityMessage(entity, id))
}

export function editEntity<T extends EntityName>(
  entity: T,
  entry: EntityType<T>
): void {
  sendApiMessage(getApiEditEntityMessage(entity, entry))
}

export function setEntities<T extends EntityName>(
  entity: T,
  entries: EntityType<T>[]
): void {
  sendApiMessage(getApiSetEntitiesMessage(entity, entries))
}

export function resetState(): void {
  sendApiMessage(getResetStateMessage())
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
