import { ApiInMessage } from '@vlight/api'
import { MasterData } from '@vlight/entities'
import React from 'react'

import { logTrace, logWarn } from '../util/log'

export const MasterDataContext = React.createContext<MasterData | undefined>(
  undefined
)

export const DmxUniverseContext = React.createContext<number[] | undefined>(
  undefined
)

export const ChannelUniverseContext = React.createContext<number[] | undefined>(
  undefined
)

let socket: WebSocket | undefined

export function sendApiMessage(message: ApiInMessage) {
  logTrace('Sending WebSocket message', message)
  if (!socket) {
    logWarn('Tried to send socket message but was not connected', message)
  } else {
    socket.send(JSON.stringify(message))
  }
}

export function setSocket(newSocket: WebSocket | undefined) {
  socket = newSocket

  if (process.env.NODE_ENV === 'development') {
    ;(window as any).socket = socket
  }
}
