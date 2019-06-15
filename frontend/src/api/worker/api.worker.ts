import { ApiInMessage, ApiOutMessage } from '@vlight/api'

import { socketProcessingInterval } from '../../config'
import { logTrace, logWarn, logInfo, logError } from '../../util/log'
import { assertNever } from '../../util/typescript'

import { ApiState, processApiMessages } from './processing'

export interface ApiWorkerState {
  state: Partial<ApiState>
  connecting: boolean
}

export type ApiWorkerCommand =
  | { type: 'state' }
  | { type: 'message'; message: ApiInMessage }

let socket: WebSocket | undefined

let connecting: boolean
let apiState: ApiState
let messageQueue: ApiOutMessage[] = []

function sendState() {
  const message: ApiWorkerState = { state: apiState, connecting }
  // @ts-ignore
  postMessage(message)
}

function sendPartialState(state: Partial<ApiState>) {
  const message: ApiWorkerState = { state, connecting }
  logTrace('Sending changed state', message)
  // @ts-ignore
  postMessage(message)
}

function connectWebSocket() {
  socket = new WebSocket(`ws://${self.location.host}/ws`)

  socket.onopen = () => {
    logInfo('WebSocket connection established')
    connecting = false
    sendState()
  }

  socket.onmessage = event => {
    try {
      const message = JSON.parse(event.data)
      logTrace('WebSocket message', message)
      messageQueue.push(message)
    } catch (e) {
      logError('WebSocket message parse error', e, 'message was:', event.data)
    }
  }

  socket.onclose = () => {
    logWarn('WebSocket connection was closed, reconnecting...')
    connecting = true
    sendState()
    setTimeout(connectWebSocket, 1000)
  }

  socket.onerror = e => logError('WebSocket error', e)
}

function sendApiMessage(message: ApiInMessage) {
  logTrace('Sending WebSocket message', message)
  if (!socket) {
    logWarn('Tried to send socket message but was not connected', message)
  } else {
    socket.send(JSON.stringify(message))
  }
}

self.addEventListener('message', event => {
  const command: ApiWorkerCommand = event.data
  switch (command.type) {
    case 'message':
      sendApiMessage(event.data.message)
      break
    case 'state':
      sendState()
      break
    default:
      assertNever(command)
  }
})

setInterval(() => {
  if (!messageQueue.length) return

  const oldState = apiState
  const newState = processApiMessages(messageQueue, apiState)
  apiState = newState
  messageQueue = []

  // We only send the changed state up to save cost on serializing.
  // On the other side the references will always change, so only here we know what did not change
  // without doing a deep compare
  const changedState: Partial<ApiState> = {}
  Object.entries(newState).forEach(([key, value]) => {
    const k = key as keyof ApiState
    if (!oldState || oldState[k] !== value) {
      // partial update 2 levels deep
      if (
        oldState &&
        typeof newState[k] === 'object' &&
        !Array.isArray(newState[k]) &&
        k !== 'masterData'
      ) {
        changedState[k] = {} as any
        Object.entries(newState[k] as any).forEach(([key2, value2]) => {
          if ((oldState[k] as any)[key2] !== value2) {
            ;(changedState[k] as any)[key2] = value2
          }
        })
      } else {
        changedState[k] = value
      }
    }
  })
  sendPartialState(changedState)
}, socketProcessingInterval)

connectWebSocket()
