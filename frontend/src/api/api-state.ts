import Emittery from 'emittery'
import { MasterData } from '@vlight/entities'

import { ApiWorkerState, ApiWorkerCommand } from './worker/api.worker'
import { ApiState } from './worker/processing'
import { updateMasterData } from './masterdata'

import { apiWorker } from '.'

export const apiState: ApiState = {
  masterData: undefined,
  universe: undefined,
  channels: undefined,
  fixtures: {},
  fixtureGroups: {},
  memories: {},
}

export const workerState = {
  connecting: true,
}

export const apiStateEmitter = new Emittery()

function messageListener(event: MessageEvent) {
  const message: ApiWorkerState = event.data
  workerState.connecting = message.connecting
  if (message.state) {
    // partial update 2 levels deep
    Object.entries(message.state).forEach(([key, value]) => {
      const k = key as keyof ApiState
      if (
        typeof message.state[k] === 'object' &&
        !Array.isArray(message.state[k])
      ) {
        ;(apiState[k] as any) = {
          ...apiState[k],
          ...message.state[k],
        }
      } else {
        ;(apiState[k] as any) = value!
      }

      // update masterData maps here to sync with the masterData context update
      if (k === 'masterData') updateMasterData(value as MasterData)

      apiStateEmitter.emit(k)
    })
  }
}

apiWorker.addEventListener('message', messageListener)

// request current state
const message: ApiWorkerCommand = { type: 'state' }
apiWorker.postMessage(message)
