import {
  ApiInMessage,
  FixtureState,
  IdType,
  MemoryState,
  EntityName,
  EntityType,
  LiveMemory,
  LiveChase,
  LiveMovement,
  SequenceControl,
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
  getApiLiveChaseStepMessage,
  getApiLiveMovementMessage,
  getApiDmxMasterMessage,
  getApiPauseMessage,
  getApiButtonMessage,
  getApiSequenceMessage,
  DmxMasterMessageArgs,
} from './protocol'
import { ApiWorkerCommand } from './worker/api.worker'

export const apiWorker = new Worker(
  // @ts-ignore import.meta is not allowed with the CommonJS module type
  new URL('./worker/api.worker.ts', import.meta.url),
  { type: 'module' }
)

/**
 * Sends a message to the backend through the web worker.
 */
export function sendApiMessage(message: ApiInMessage): void {
  logger.trace('Sending WebSocket message', message)
  const command: ApiWorkerCommand = { type: 'message', message }
  apiWorker.postMessage(command)
}

/**
 * Subscribes to DMX universe updates from the backend until the returned
 * function is called. The backend only sends universe updates
 * while at least one subscription is active.
 */
export function subscribeToUniverse(): () => void {
  const command = (subscribe: boolean): ApiWorkerCommand => ({
    type: 'universe-subscription',
    subscribe,
  })
  apiWorker.postMessage(command(true))
  let active = true
  return () => {
    if (!active) return
    active = false
    apiWorker.postMessage(command(false))
  }
}

/**
 * Changes the value of a single DMX channel.
 */
export function setChannel(channel: number, value: number): void {
  sendApiMessage(getApiChannelMessage([channel], value))
}

/**
 * Changes the value of multiple DMX channels.
 */
export function setChannels(channels: number[], value: number): void {
  sendApiMessage(getApiChannelMessage(channels, value))
}

/**
 * Changes the state of a fixture.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setFixtureState(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge = false
): void {
  sendApiMessage(getApiFixtureStateMessage(id, state, merge))
}

/**
 * Changes the state of a fixture group.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setFixtureGroupState(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge = false
): void {
  sendApiMessage(getApiFixtureGroupStateMessage(id, state, merge))
}

/**
 * Changes the state of a memory.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setMemoryState(
  id: IdType | IdType[],
  state: Partial<MemoryState>,
  merge = false
): void {
  sendApiMessage(getApiMemoryStateMessage(id, state, merge))
}

/**
 * Changes the state of a live memory.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setLiveMemoryState(
  id: IdType,
  state: Partial<LiveMemory>,
  merge = false
): void {
  sendApiMessage(getApiLiveMemoryMessage(id, state, merge))
}

export function deleteLiveMemory(id: IdType): void {
  sendApiMessage(getApiLiveMemoryMessage(id, null, false))
}

/**
 * Changes the state of a live chase.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setLiveChaseState(
  id: IdType,
  state: Partial<LiveChase>,
  merge = false
): void {
  sendApiMessage(getApiLiveChaseMessage(id, state, merge))
}

/**
 * Deletes a live chase.
 */
export function deleteLiveChase(id: IdType): void {
  sendApiMessage(getApiLiveChaseMessage(id, null, false))
}

/**
 * Moves a live chase forward by one step.
 */
export function setLiveChaseStep(id: IdType): void {
  sendApiMessage(getApiLiveChaseStepMessage(id))
}

/**
 * Changes the state of a live movement.
 *
 * @param merge Set to `true` to merge the new state with the existing one,
 *   allowing for partial state updates. Defaults to `false`.
 */
export function setLiveMovementState(
  id: IdType,
  state: Partial<LiveMovement>,
  merge = false
): void {
  sendApiMessage(getApiLiveMovementMessage(id, state, merge))
}

/**
 * Stops a live movement and returns its members to the center.
 */
export function resetLiveMovement(id: IdType): void {
  sendApiMessage(
    getApiLiveMovementMessage(id, { stopped: true, on: true }, true, true)
  )
}

/**
 * Deletes a live movement.
 */
export function deleteLiveMovement(id: IdType): void {
  sendApiMessage(getApiLiveMovementMessage(id, null, false))
}

/**
 * Removes a master data entry.
 */
export function removeEntity(entity: EntityName, id: IdType): void {
  sendApiMessage(getApiRemoveEntityMessage(entity, id))
}

/**
 * Edits a master data entry.
 */
export function editEntity<T extends EntityName>(
  entity: T,
  entry: EntityType<T>,
  forceAdd?: boolean
): void {
  sendApiMessage(getApiEditEntityMessage(entity, entry, forceAdd))
}

/**
 * Updates all entries of a master data entity, e.g. after reordering them.
 */
export function setEntities<T extends EntityName>(
  entity: T,
  entries: EntityType<T>[]
): void {
  sendApiMessage(getApiSetEntitiesMessage(entity, entries))
}

/**
 * Resets the state at the backend.
 */
export function resetState(): void {
  sendApiMessage(getResetStateMessage())
}

/**
 * Changes the DMX master value.
 */
export function setDmxMaster(args: DmxMasterMessageArgs): void {
  sendApiMessage(getApiDmxMasterMessage(args))
}

/**
 * Globally pauses or resumes all continuously recomputing controls
 * (live chases, moving live memory gradients, live movements).
 */
export function setPaused(paused: boolean): void {
  sendApiMessage(getApiPauseMessage(paused))
}

/**
 * Presses a programmable button, executing its down actions.
 */
export function pressButton(id: IdType): void {
  sendApiMessage(getApiButtonMessage(id, true))
}

/**
 * Releases a programmable button, reverting its down actions (if configured)
 * and executing its up actions.
 */
export function releaseButton(id: IdType): void {
  sendApiMessage(getApiButtonMessage(id, false))
}

/**
 * Controls a sequence, e.g. starting, pausing or stopping it.
 */
export function controlSequence(id: IdType, control: SequenceControl): void {
  sendApiMessage(getApiSequenceMessage(id, control))
}

/**
 * Initializes the communication with the web worker:
 * - Requests updates when the frontend is idle
 * - Requests a minimum of 2, a maximum of 20 updates per second
 */
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
