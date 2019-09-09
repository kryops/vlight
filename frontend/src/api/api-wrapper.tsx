import React, { useMemo, useState, useEffect } from 'react'

import { LoadingScreen } from '../ui/main/loading-screen'

import {
  AppState,
  AppStateContext,
  DmxUniverseContext,
  MasterDataContext,
} from './context'
import { ApiState } from './worker/processing'
import { ApiWorkerState, ApiWorkerCommand } from './worker/api.worker'
import { updateMasterData } from './masterdata'

import { apiWorker } from '.'

export const ApiWrapper: React.SFC = ({ children }) => {
  const [connecting, setConnecting] = useState(true)
  const [apiState, setApiState] = useState<ApiState>({
    masterData: undefined,
    universe: undefined,
    channels: undefined,
    fixtures: {},
    fixtureGroups: {},
    memories: {},
  })

  const appState = useMemo<AppState>(
    () => ({
      channels: apiState.channels || [],
      fixtures: apiState.fixtures,
      fixtureGroups: apiState.fixtureGroups,
      memories: apiState.memories,
    }),
    [
      apiState.channels,
      apiState.fixtures,
      apiState.fixtureGroups,
      apiState.memories,
    ]
  )

  useEffect(() => {
    function messageListener(event: MessageEvent) {
      const message: ApiWorkerState = event.data
      if (message.state) {
        setApiState(prevState => {
          const newState = { ...prevState }

          // partial update 2 levels deep
          Object.entries(message.state).forEach(([key, value]) => {
            const k = key as keyof ApiState
            if (
              typeof message.state[k] === 'object' &&
              !Array.isArray(message.state[k])
            ) {
              ;(newState[k] as any) = {
                ...prevState[k],
                ...message.state[k],
              }
            } else {
              ;(newState[k] as any) = value!
            }
          })

          // update masterData maps here to sync with the masterData context update
          if (message.state.masterData)
            updateMasterData(message.state.masterData)

          return newState
        })
      }
      setConnecting(message.connecting)
    }

    apiWorker.addEventListener('message', messageListener)

    // request current state
    const message: ApiWorkerCommand = { type: 'state' }
    apiWorker.postMessage(message)

    return () => {
      apiWorker.removeEventListener('message', messageListener)
    }
  }, [])

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
