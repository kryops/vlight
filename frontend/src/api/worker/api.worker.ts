import { ApiInMessage, ApiOutMessage } from '@vlight/types'
import { logger, assertNever } from '@vlight/utils'

import {
  useSocketUpdateThrottling,
  socketProcessingInterval,
} from '../../config'

import { ApiState, processApiMessages } from './processing'

/*
 * Web worker that communicates with the backend and sends throttled updates to the frontend.
 */

export interface ApiWorkerState {
  state: Partial<ApiState> | undefined
  connecting: boolean
}

export type ApiWorkerCommand =
  /** Command to send the complete state to the frontend. */
  | { type: 'state' }
  /** Command to send all state updates to the frontend immediately. */
  | { type: 'update' }
  /** Command to send a message to the backend. */
  | { type: 'message'; message: ApiInMessage }
  /** Command to add or remove a consumer of the DMX universe. */
  | { type: 'universe-subscription'; subscribe: boolean }

/** WebSocket connection to the backend */
let socket: WebSocket | undefined

/** Indicates whether the WebSocket is currently connecting. */
let connecting: boolean
/** The current API state that has been synchronized with the backend. */
let apiState: ApiState | undefined
/** The API state that has been synchronized to the client. */
let clientApiState: ApiState | undefined
/** Messages from the backend that have not been processed. */
let messageQueue: ApiOutMessage[] = []
/** The last time a heartbeat was received from the server. */
let lastHeartBeat: number | undefined
/** Number of frontend consumers that currently need DMX universe updates. */
let universeSubscribers = 0
/** Whether we are waiting for the full universe after subscribing. */
let awaitingUniverse = false
/** Pending unsubscribe from universe updates, if any. */
let universeUnsubscribeTimeout: ReturnType<typeof setTimeout> | undefined
/** How long to wait before actually unsubscribing from universe updates. */
const universeUnsubscribeDelay = 1000
/** Pending reconnect attempt, if any. */
let reconnectTimeout: ReturnType<typeof setTimeout> | undefined

/** Sends the complete state to the frontend. */
function sendState() {
  const message: ApiWorkerState = { state: apiState, connecting }
  // TypeScript wants DOM API, but we are in a Web Worker
  const postMessageFn = postMessage as any
  postMessageFn(message)
}

/** Processes the message queue to update the current state. */
function processMessageQueue() {
  if (!messageQueue.length) return
  apiState = processApiMessages(messageQueue, apiState)
  messageQueue = []
}

/**
 * Sends all state updates to the client, in the shape of a partial state object.
 */
function sendClientUpdate() {
  if (clientApiState === apiState) return

  // We only send the changed state up to save cost on serializing.
  // On the other side the references will always change, so only here we know what did not change
  // without doing a deep compare
  const changedState: Partial<ApiState> = apiState
    ? // we always send the plain values, as they will get overridden
      // if they do not change even after a full state flush otherwise
      {
        dmxMaster: apiState.dmxMaster,
        dmxMasterFade: apiState.dmxMasterFade,
        paused: apiState.paused,
      }
    : {}
  Object.entries(apiState ?? {}).forEach(([key, value]) => {
    const k = key as keyof ApiState
    if (!clientApiState || clientApiState[k] !== value) {
      // partial update 2 levels deep
      if (
        clientApiState &&
        typeof apiState?.[k] === 'object' &&
        !Array.isArray(apiState?.[k]) &&
        // if any of these keys change, we always want it all
        k !== 'masterData' &&
        k !== 'rawMasterData'
      ) {
        changedState[k] = {} as any
        Object.entries(apiState[k] as any).forEach(([key2, value2]) => {
          if ((clientApiState![k] as any)[key2] !== value2) {
            ;(changedState[k] as any)[key2] = value2
          }
        })
      } else {
        changedState[k] = value as any
      }
    }
  })

  const message: ApiWorkerState = { state: changedState, connecting }
  logger.debug('Sending changed state', changedState, connecting)
  // TypeScript wants DOM API, but we are in a Web Worker
  const postMessageFn = postMessage as any
  postMessageFn(message)

  clientApiState = apiState
}

function connectWebSocket() {
  reconnectTimeout = undefined
  disposeSocket()
  socket = new WebSocket(`ws://${self.location.host}/websocket`)
  // start the timeout right away, so a connection that hangs before
  // delivering its first heartbeat still fails over
  lastHeartBeat = Date.now()

  socket.onopen = () => {
    logger.info('WebSocket connection established')
    connecting = false
    // subscriptions do not survive a reconnect
    if (universeSubscribers > 0) sendUniverseSubscription(true)
    sendState()
  }

  socket.onmessage = event => {
    try {
      const message = JSON.parse(event.data) as ApiOutMessage
      logger.trace('WebSocket message', message)

      if (message.type === 'heartbeat') {
        lastHeartBeat = Date.now()
      } else {
        messageQueue.push(message)

        if (message.type === 'universe' && awaitingUniverse) {
          // first universe after subscribing: don't wait for the next throttled update
          awaitingUniverse = false
          processMessageQueue()
          sendClientUpdate()
        }
      }
    } catch (e) {
      logger.error(
        'WebSocket message parse error',
        e,
        'message was:',
        event.data
      )
    }
  }

  socket.onclose = handleClose

  socket.onerror = e => logger.error('WebSocket error', e)
}

/** Detaches and closes the current socket so it cannot trigger further events. */
function disposeSocket() {
  if (!socket) return
  socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null
  try {
    socket.close()
  } catch {
    // ignore
  }
  socket = undefined
}

function handleClose() {
  logger.warn('WebSocket connection was closed, reconnecting...')
  disposeSocket()
  if (reconnectTimeout) clearTimeout(reconnectTimeout)
  connecting = true
  apiState = undefined
  clientApiState = undefined
  lastHeartBeat = undefined
  if (universeUnsubscribeTimeout) {
    clearTimeout(universeUnsubscribeTimeout)
    universeUnsubscribeTimeout = undefined
  }
  sendState()
  reconnectTimeout = setTimeout(connectWebSocket, 1000)
}

function sendUniverseSubscription(subscribe: boolean) {
  if (socket?.readyState !== WebSocket.OPEN) return
  awaitingUniverse = subscribe
  const message: ApiInMessage = { type: 'universe-subscription', subscribe }
  socket.send(JSON.stringify(message))
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
    case 'universe-subscription':
      if (command.subscribe) {
        universeSubscribers++
        if (universeUnsubscribeTimeout) {
          // still subscribed on the backend: just cancel the pending unsubscribe
          clearTimeout(universeUnsubscribeTimeout)
          universeUnsubscribeTimeout = undefined
        } else if (universeSubscribers === 1) {
          sendUniverseSubscription(true)
        }
      } else if (universeSubscribers > 0 && --universeSubscribers === 0) {
        // Delay unsubscribing, as components often unmount and mount again right away
        // (e.g. on navigation), which would make the backend resend the whole universe
        universeUnsubscribeTimeout = setTimeout(() => {
          universeUnsubscribeTimeout = undefined
          sendUniverseSubscription(false)
        }, universeUnsubscribeDelay)
      }
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

setInterval(() => {
  if (!lastHeartBeat || Date.now() - lastHeartBeat < 5000) return

  logger.error('No heartbeat received, reconnecting...')
  handleClose()
}, 2000)

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
