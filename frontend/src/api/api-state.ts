import Emittery from 'emittery'
import { MasterData } from '@vlight/types'

import { ApiWorkerState, ApiWorkerCommand } from './worker/api.worker'
import { ApiState } from './worker/processing'
import { updateMasterData } from './masterdata'

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
  }
}

export const apiState: ApiState = getEmptyState()

export const workerState = {
  connecting: true,
}

export const apiStateEmitter = new Emittery()

function messageListener(event: MessageEvent) {
  const message: ApiWorkerState = event.data
  const oldConnecting = workerState.connecting
  workerState.connecting = message.connecting

  if (message.state) {
    // reset after version change
    if (message.state.version && message.state.version !== apiState.version) {
      Object.assign(apiState, getEmptyState(), message.state)
    }

    // partial update 2 levels deep
    Object.entries(message.state).forEach(([key, value]) => {
      const k = key as keyof ApiState
      if (
        typeof message.state![k] === 'object' &&
        !Array.isArray(message.state![k])
      ) {
        ;(apiState[k] as any) = {
          ...(apiState as any)[k],
          ...(message.state as any)[k],
        }
      } else {
        ;(apiState[k] as any) = value!
      }

      // update masterData maps here to sync with the masterData context update
      if (k === 'masterData') updateMasterData(value as MasterData)

      apiStateEmitter.emit(k)
    })
  }

  if (oldConnecting !== workerState.connecting) {
    apiStateEmitter.emit('connecting')
  }
}

apiWorker.addEventListener('message', messageListener)

// request current state
const message: ApiWorkerCommand = { type: 'state' }
apiWorker.postMessage(message)
