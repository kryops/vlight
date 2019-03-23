import { ApiOutMessage } from '@vlight/api'
import React, { useMemo, useState } from 'react'

import { useWebSocket } from '../hooks/websocket'
import { LoadingScreen } from '../ui/main/loading-screen'

import {
  AppState,
  AppStateContext,
  DmxUniverseContext,
  MasterDataContext,
} from './context'
import { ApiState, processApiMessages } from './processing'

export const ApiWrapper: React.SFC = ({ children }) => {
  const [apiState, setApiState] = useState<ApiState>({
    masterData: undefined,
    universe: undefined,
    channels: undefined,
    fixtures: {},
  })

  const connecting = useWebSocket<ApiOutMessage>(messages => {
    const newState = processApiMessages(messages, apiState)
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
