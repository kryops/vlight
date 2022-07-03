import { useEffect, useReducer, useRef, useState } from 'react'
import { MasterData, MasterDataMaps } from '@vlight/types'

import { masterDataMaps } from '../api/masterdata'
import { ApiState } from '../api/worker/processing'
import { apiStateEmitter, apiState, workerState } from '../api/api-state'

/**
 * React Hook that returns whether the WebSocket to the backend is currently connecting.
 */
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

/**
 * React Hook that returns the complete API state and re-renders on updates.
 *
 * NOTE: As this includes the universe state, it may re-render up to 20 times a second.
 * Consider excluding the `universe` state if you do not need it.
 *
 * If you only need a single state property, prefer {@link useApiState}.
 */
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

/**
 * React Hook that returns a single state property and re-renders on updates.
 *
 * If you only need the state of a single sub-property of the given key,
 * use {@link useApiStateEntry} instead.
 */
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

/**
 * React Hook that returns a sub-state and re-renders on updates.
 */
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

/**
 * React Hook that returns the (pre-processed) master data and re-renders on updates.
 *
 * If you need access by ID, prefer {@link useMasterDataMaps}.
 * If you need both, prefer {@link useMasterDataAndMaps}.
 */
export const useMasterData = (): MasterData => useApiState('masterData')

/**
 * React Hook that returns the raw (non pre-processed) master data and re-renders on updates.
 */
export const useRawMasterData = (): MasterData => useApiState('rawMasterData')

/**
 * React Hook that returns the (pre-processed) master data as maps and re-renders on updates.
 *
 * If you need to iterate over all entries, prefer {@link useMasterData}.
 * If you need both, prefer {@link useMasterDataAndMaps}.
 */
export const useMasterDataMaps = (): MasterDataMaps => {
  // refresh the component when the master data changes
  useMasterData()
  return masterDataMaps
}

interface MasterDataWithMaps {
  masterData: MasterData
  masterDataMaps: MasterDataMaps
}

/**
 * React Hook that returns the (pre-processed) master data as arrays as well as
 * maps and re-renders on updates.
 */
export function useMasterDataAndMaps(): MasterDataWithMaps {
  const masterData = useMasterData()
  return { masterData, masterDataMaps }
}

/**
 * React Hook that returns the current DMX universe and re-renders on changes.
 *
 * NOTE: This Hook may re-render up to 20 times per second.
 */
export const useDmxUniverse = (): number[] => useApiState('universe')
