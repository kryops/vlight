import { ApiInMessage } from '@vlight/api'
import React from 'react'

import { isDevelopment } from '../config'
import { logWarn } from '../util/log'

export const DmxUniverseContext = React.createContext<number[] | undefined>(
  undefined
)

export const ChannelUniverseContext = React.createContext<number[] | undefined>(
  undefined
)

let socket: WebSocket | undefined

export function sendApiMessage(message: ApiInMessage) {
  if (!socket) {
    logWarn('Tried to send socket message but was not connected', message)
  } else {
    socket.send(JSON.stringify(message))
  }
}

export function setSocket(newSocket: WebSocket | undefined) {
  socket = newSocket

  if (isDevelopment) {
    ;(window as any).socket = socket
  }
}
