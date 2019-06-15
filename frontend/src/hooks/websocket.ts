import { useEffect, useRef, useState } from 'react'

import { socketProcessingInterval } from '../config'
import { logError, logInfo, logTrace, logWarn } from '../util/log'

import { useInterval } from './interval'
import { useCurrentRef } from './ref'

interface InstanceRef<T> {
  socket: WebSocket | undefined
  messageQueue: T[]
}

export function useWebSocket<T>(
  messageQueueHandler: (messages: T[]) => void
): boolean {
  const handlerRef = useCurrentRef(messageQueueHandler)
  const instanceRef = useRef<InstanceRef<T>>({
    socket: undefined,
    messageQueue: [],
  })
  const [connecting, setConnecting] = useState(true)

  useInterval(() => {
    if (!instanceRef.current.messageQueue.length) {
      return
    }
    handlerRef.current(instanceRef.current.messageQueue)
    instanceRef.current.messageQueue = []
  }, socketProcessingInterval)

  useEffect(function connectWebSocket() {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)

    instanceRef.current.socket = socket
    // setSocket(socket)

    socket.onopen = () => {
      logInfo('WebSocket connection established')
      setConnecting(false)
    }

    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        logTrace('WebSocket message', message)
        instanceRef.current.messageQueue.push(message)
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
      // setSocket(undefined)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return connecting
}
