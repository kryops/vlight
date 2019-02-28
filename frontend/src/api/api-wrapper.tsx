import { ApiOutMessage } from '@vlight/api'
import React, { useRef, useState } from 'react'

import { ChannelUniverseContext, DmxUniverseContext } from '../api'
import { useWebSocket } from '../hooks/websocket'
import { LoadingScreen } from '../ui/main/loading-screen'

import { ApiState, processApiMessages } from './processing'

export const ApiWrapper: React.SFC = ({ children }) => {
  // we need to use a ref here because using the state variable
  // in the socket message handler will always give us the initial value
  const ref = useRef<ApiState>({
    universe: undefined,
    channels: undefined,
  })
  const [apiState, setApiState] = useState<ApiState>(ref.current)

  const connecting = useWebSocket<ApiOutMessage>(messages => {
    const newState = processApiMessages(messages, ref.current)
    ref.current = newState
    setApiState(newState)
  })

  if (connecting) {
    return <LoadingScreen />
  }

  return (
    <DmxUniverseContext.Provider value={apiState.universe}>
      <ChannelUniverseContext.Provider value={apiState.channels}>
        {children}
      </ChannelUniverseContext.Provider>
    </DmxUniverseContext.Provider>
  )
}
