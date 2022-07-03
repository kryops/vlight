import { useEffect, useReducer, useState } from 'react'
import { MasterData, MasterDataMaps } from '@vlight/types'

import { masterDataMaps } from '../api/masterdata'
import { ApiState } from '../api/worker/processing'
import { apiStateEmitter, apiState, workerState } from '../api/api-state'

export function useApiConnecting(): boolean {
  const [state, setState] = useState(workerState.connecting)
  useEffect(() => {
    function eventHandler() {
      setState(workerState.connecting)
    }

    apiStateEmitter.on('connecting', eventHandler)

    return () => {
      apiStateEmitter.off('connecting', eventHandler)
    }
  }, [])

  return state
}

export function useCompleteApiState(except?: Array<keyof ApiState>): ApiState {
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const exceptRef = useRef(except)
  exceptRef.current = except

  useEffect(() => {
    const listener = (eventName: string) => {
      if (!exceptRef.current?.includes(eventName as any)) {
        forceUpdate()
      }
    }

    apiStateEmitter.onAny(listener)
    return () => {
      apiStateEmitter.offAny(listener)
    }
  }, [forceUpdate])

  return apiState
}

export function useApiState<TKey extends keyof ApiState>(
  key: TKey
): NonNullable<ApiState[TKey]> {
  const [state, setState] = useState(apiState[key])
  useEffect(() => {
    setState(apiState[key])

    function eventHandler() {
      setState(apiState[key])
    }

    apiStateEmitter.on(key, eventHandler)

    return () => {
      apiStateEmitter.off(key, eventHandler)
    }
  }, [key])

  // We assume that someone will display a loading screen further up if not all data is present
  return state!
}

export function useApiStateEntry<
  TKey extends keyof ApiState,
  TSubKey extends keyof ApiState[TKey]
>(key: TKey, subKey: TSubKey): ApiState[TKey][TSubKey] {
  const [state, setState] = useState((apiState as any)[key][subKey])
  useEffect(() => {
    function eventHandler() {
      setState((apiState as any)[key][subKey])
    }

    apiStateEmitter.on(key, eventHandler)

    return () => {
      apiStateEmitter.off(key, eventHandler)
    }
  }, [key, subKey])

  return state
}

export const useMasterData = (): MasterData => useApiState('masterData')
export const useRawMasterData = (): MasterData => useApiState('rawMasterData')

export const useMasterDataMaps = (): MasterDataMaps => {
  // refresh the component when the master data changes
  useMasterData()
  return masterDataMaps
}

interface MasterDataWithMaps {
  masterData: MasterData
  masterDataMaps: MasterDataMaps
}

export function useMasterDataAndMaps(): MasterDataWithMaps {
  const masterData = useMasterData()
  return { masterData, masterDataMaps }
}

export const useDmxUniverse = (): number[] => useApiState('universe')
