import { useEffect, useRef, useState } from 'react'

import { setSocket } from '../api'
import { socketProcessingInterval } from '../config'
import { logError, logInfo, logTrace, logWarn } from '../util/log'

import { useInterval } from './interval'

interface InstanceRef<T> {
  socket: WebSocket | undefined
  messageQueue: T[]
}

export function useWebSocket<T>(
  /**
   * **NOTE**: If you have to use any variables from outside
   * here, define them via `useRef()`!
   * State variables will be stale because we never re-run the effect!
   */
  messageQueueHandler: (messages: T[]) => void
): boolean {
  const instance = useRef<InstanceRef<T>>({
    socket: undefined,
    messageQueue: [],
  })
  const [connecting, setConnecting] = useState(true)

  useInterval(() => {
    if (!instance.current.messageQueue.length) {
      return
    }
    messageQueueHandler(instance.current.messageQueue)
    instance.current.messageQueue = []
  }, socketProcessingInterval)

  useEffect(function connectWebSocket() {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)

    instance.current.socket = socket
    setSocket(socket)

    socket.onopen = () => {
      logInfo('WebSocket connection established')
      setConnecting(false)
    }

    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        logTrace('WebSocket message', message)
        instance.current.messageQueue.push(message)
      } catch (e) {
        logError('WebSocket message parse error', e, 'message was:', event.data)
      }
    }

    socket.onclose = () => {
      logWarn('WebSocket connection was closed, reconnecting...')
      setConnecting(true)
      setTimeout(connectWebSocket, 1000)
    }

    socket.onerror = e => logError('WebSocket error', e)

    return () => {
      socket.close()
      setSocket(undefined)
    }
  }, [])

  return connecting
}
