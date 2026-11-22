import Emittery from 'emittery'
import { EntityName, MasterData } from '@vlight/types'

import { ApiWorkerState, ApiWorkerCommand } from './worker/api.worker'
import { ApiState } from './worker/processing'
import { updateMasterDataMapsFromBackend } from './masterdata'

import { apiWorker } from '.'

function getEmptyState(): ApiState {
  return {
    masterData: undefined,
    rawMasterData: undefined,
    universe: undefined,
    channels: undefined,
    fixtures: {},
    fixtureGroups: {},
    memories: {},
    liveMemories: {},
    liveChases: {},
    liveMovements: {},
    dmxMaster: 255,
    dmxMasterFade: 0,
    paused: false,
    buttons: {},
    sequences: {},
  }
}

/**
 * Current API state on the frontend that has been synchronized from the web worker.
 *
 * May contain local changes on top of the {@link backendApiState},
 * see {@link setApiStateOverlay}.
 */
export const apiState: ApiState = getEmptyState()

/**
 * Current API state as synchronized from the backend, without local changes.
 */
export const backendApiState: ApiState = getEmptyState()

export const workerState = {
  connecting: true,
}

/**
 * Event emitter that sends the keys of changed state properties.
 */
export const apiStateEmitter = new Emittery<{
  [key in keyof ApiState | 'connecting']: undefined
}>()

/**
 * Function that computes the displayed value of a state property
 * from the backend value, e.g. to display local changes instead.
 *
 * Returns the backend value itself if there are no local changes.
 */
export type ApiStateOverlay = <TKey extends keyof ApiState>(
  key: TKey,
  backendValue: ApiState[TKey]
) => ApiState[TKey]

let overlay: ApiStateOverlay | undefined

function updateDisplayedValue(key: keyof ApiState) {
  const backendValue = backendApiState[key]
  ;(apiState as any)[key] = overlay ? overlay(key, backendValue) : backendValue
}

/**
 * Sets (or removes) a function that applies local changes on top of the backend state.
 *
 * Recomputes the given state properties (defaults to all of them).
 */
export function setApiStateOverlay(
  newOverlay: ApiStateOverlay | undefined,
  keysToUpdate: (keyof ApiState)[] = Object.keys(
    backendApiState
  ) as (keyof ApiState)[]
): void {
  overlay = newOverlay
  for (const key of keysToUpdate) {
    const oldValue = apiState[key]
    updateDisplayedValue(key)
    if (apiState[key] !== oldValue) void apiStateEmitter.emit(key)
  }
}

/**
 * Optimistically replaces the raw master data entries of the given type on the client,
 * e.g. to prevent flickering while waiting for the backend to confirm a change.
 */
export function setRawMasterDataEntriesLocally(
  type: EntityName,
  entries: unknown[]
): void {
  backendApiState.rawMasterData = {
    ...backendApiState.rawMasterData!,
    [type]: entries,
  }
  updateDisplayedValue('rawMasterData')
  void apiStateEmitter.emit('rawMasterData')
}

function messageListener(event: MessageEvent) {
  const message: ApiWorkerState = event.data
  const oldConnecting = workerState.connecting
  workerState.connecting = message.connecting

  if (message.state) {
    const changedKeys = new Set<keyof ApiState>()

    // reset after version change
    if (
      message.state.version &&
      message.state.version !== backendApiState.version
    ) {
      Object.assign(backendApiState, getEmptyState(), message.state)
      for (const key of Object.keys(backendApiState)) {
        changedKeys.add(key as keyof ApiState)
      }
    }

    // partial update 2 levels deep
    Object.entries(message.state).forEach(([key, value]) => {
      const k = key as keyof ApiState
      if (
        typeof message.state![k] === 'object' &&
        !Array.isArray(message.state![k])
      ) {
        ;(backendApiState[k] as any) = Object.fromEntries(
          Object.entries({
            ...(backendApiState as any)[k],
            ...(message.state as any)[k],
          }).filter(([, value]) => value !== null)
        )
      } else {
        ;(backendApiState[k] as any) = value!
      }
      changedKeys.add(k)
    })

    // master data first, as the overlay may depend on it
    const sortedKeys = [...changedKeys].sort((a, b) =>
      a === 'masterData' ? -1 : b === 'masterData' ? 1 : 0
    )

    for (const k of sortedKeys) {
      updateDisplayedValue(k)

      // update masterData maps here to sync with the masterData context update
      if (k === 'masterData' && apiState.masterData)
        updateMasterDataMapsFromBackend(apiState.masterData as MasterData)

      void apiStateEmitter.emit(k)
    }
  }

  if (oldConnecting !== workerState.connecting) {
    void apiStateEmitter.emit('connecting')
  }
}

apiWorker.addEventListener('message', messageListener)

// request current state
const message: ApiWorkerCommand = { type: 'state' }
apiWorker.postMessage(message)
