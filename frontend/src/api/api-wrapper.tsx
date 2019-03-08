import { ApiOutMessage } from '@vlight/api'
import React, { useMemo, useRef, useState } from 'react'

import { useWebSocket } from '../hooks/websocket'
import { LoadingScreen } from '../ui/main/loading-screen'

import {
  AppState,
  AppStateContext,
  DmxUniverseContext,
  MasterDataContext,
} from './index'
import { ApiState, processApiMessages } from './processing'

export const ApiWrapper: React.SFC = ({ children }) => {
  // we need to use a ref here because using the state variable
  // in the socket message handler will always give us the initial value
  const ref = useRef<ApiState>({
    masterData: undefined,
    universe: undefined,
    channels: undefined,
    fixtures: {},
  })
  const [apiState, setApiState] = useState<ApiState>(ref.current)

  const connecting = useWebSocket<ApiOutMessage>(messages => {
    const newState = processApiMessages(messages, ref.current)
    ref.current = newState
    setApiState(newState)
  })

  const appState = useMemo<AppState>(
    () => ({ channels: apiState.channels || [], fixtures: apiState.fixtures }),
    [apiState.channels, apiState.fixtures]
  )

  if (connecting || apiState.masterData === undefined) {
    return <LoadingScreen />
  }

  return (
    <MasterDataContext.Provider value={apiState.masterData}>
      <DmxUniverseContext.Provider value={apiState.universe}>
        <AppStateContext.Provider value={appState}>
          {children}
        </AppStateContext.Provider>
      </DmxUniverseContext.Provider>
    </MasterDataContext.Provider>
  )
}
