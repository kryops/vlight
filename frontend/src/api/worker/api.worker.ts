import { ApiInMessage, ApiOutMessage } from '@vlight/api'

import {
  useSocketUpdateThrottling,
  socketProcessingInterval,
} from '../../config'
import { logger, assertNever } from '../../util/shared'

import { ApiState, processApiMessages } from './processing'

export interface ApiWorkerState {
  state: Partial<ApiState>
  connecting: boolean
}

export type ApiWorkerCommand =
  | { type: 'state' }
  | { type: 'update' }
  | { type: 'message'; message: ApiInMessage }

let socket: WebSocket | undefined

let connecting: boolean
let apiState: ApiState
let clientApiState: ApiState
let messageQueue: ApiOutMessage[] = []

function sendState() {
  const message: ApiWorkerState = { state: apiState, connecting }
  // TypeScript wants DOM API, but we are in a Web Worker
  const postMessageFn = postMessage as any
  postMessageFn(message)
}

function processMessageQueue() {
  if (!messageQueue.length) return
  apiState = processApiMessages(messageQueue, apiState)
  messageQueue = []
}

function sendClientUpdate() {
  if (clientApiState === apiState) return

  // We only send the changed state up to save cost on serializing.
  // On the other side the references will always change, so only here we know what did not change
  // without doing a deep compare
  const changedState: Partial<ApiState> = {}
  Object.entries(apiState).forEach(([key, value]) => {
    const k = key as keyof ApiState
    if (!clientApiState || clientApiState[k] !== value) {
      // partial update 2 levels deep
      if (
        clientApiState &&
        typeof apiState[k] === 'object' &&
        !Array.isArray(apiState[k]) &&
        k !== 'masterData' &&
        k !== 'rawMasterData' // if masterData changes, we always want it all
      ) {
        changedState[k] = {} as any
        Object.entries(apiState[k] as any).forEach(([key2, value2]) => {
          if ((clientApiState[k] as any)[key2] !== value2) {
            ;(changedState[k] as any)[key2] = value2
          }
        })
      } else {
        changedState[k] = value as any
      }
    }
  })

  const message: ApiWorkerState = { state: changedState, connecting }
  logger.trace('Sending changed state', message)
  // TypeScript wants DOM API, but we are in a Web Worker
  const postMessageFn = postMessage as any
  postMessageFn(message)

  clientApiState = apiState
}

function connectWebSocket() {
  socket = new WebSocket(`ws://${self.location.host}/ws`)

  socket.onopen = () => {
    logger.info('WebSocket connection established')
    connecting = false
    sendState()
  }

  socket.onmessage = event => {
    try {
      const message = JSON.parse(event.data)
      logger.trace('WebSocket message', message)
      messageQueue.push(message)
    } catch (e) {
      logger.error(
        'WebSocket message parse error',
        e,
        'message was:',
        event.data
      )
    }
  }

  socket.onclose = () => {
    logger.warn('WebSocket connection was closed, reconnecting...')
    connecting = true
    sendState()
    setTimeout(connectWebSocket, 1000)
  }

  socket.onerror = e => logger.error('WebSocket error', e)
}

function sendApiMessage(message: ApiInMessage) {
  logger.trace('Sending WebSocket message', message)
  if (!socket) {
    logger.warn('Tried to send socket message but was not connected', message)
  } else {
    socket.send(JSON.stringify(message))

    // Most messages get an immediate response, so we make sure
    // the client gets it even when busy
    setTimeout(() => {
      processMessageQueue()
      sendClientUpdate()
    }, 50)
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
    case 'update':
      processMessageQueue()
      sendClientUpdate()
      break
    default:
      assertNever(command)
  }
})

connectWebSocket()

if (useSocketUpdateThrottling) {
  // we process the queue at least 10 times/sec in the background
  // so we won't have to do as much work when a slow client requests an update
  setInterval(processMessageQueue, 100)
} else {
  setInterval(() => {
    processMessageQueue()
    sendClientUpdate()
  }, socketProcessingInterval)
}
