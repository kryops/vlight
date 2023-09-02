import { useEffect, useReducer, useRef, useState } from 'react'
import { MasterData, MasterDataMaps } from '@vlight/types'
import { shallowEqual } from '@vlight/utils'

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
  }, [])

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
  const [_state, setState] = useState(apiState[key])

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
  // We do not return _state here as it may lag behind when the key changes
  return apiState[key]!
}

/**
 * React Hook that returns a sub-state and re-renders on updates.
 */
export function useApiStateEntry<
  TKey extends keyof ApiState,
  TSubKey extends keyof ApiState[TKey],
>(key: TKey, subKey: TSubKey): ApiState[TKey][TSubKey] {
  const [_state, setState] = useState((apiState as any)[key][subKey])
  useEffect(() => {
    function eventHandler() {
      setState((apiState as any)[key][subKey])
    }

    apiStateEmitter.on(key, eventHandler)

    return () => {
      apiStateEmitter.off(key, eventHandler)
    }
  }, [key, subKey])

  return (apiState as any)[key][subKey]
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

export interface UseApiStateSelectorOptions {
  /** Only event to listen to. */
  event?: keyof ApiState
  /** Controls whether to also listen to the universe event. */
  includeUniverse?: boolean
}

/**
 * React Hook that returns the value selected from the API state,
 * only re-rendering on changes (except for the DMX universe).
 *
 * Does a shallow equality check on array and object values
 */
export function useApiStateSelector<T>(
  selector: (apiState: ApiState, oldValue: T | undefined) => T,
  options?: UseApiStateSelectorOptions
) {
  const [currentState, setCurrentState] = useState(
    selector(apiState, undefined)
  )
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  useEffect(() => {
    const listener = (eventNameOrData: any) => {
      if (eventNameOrData === 'universe' && !options?.includeUniverse) return

      setCurrentState(oldValue => {
        const newValue = selectorRef.current(apiState, oldValue)
        return shallowEqual(newValue, oldValue) ? oldValue : newValue
      })
    }

    if (options?.event) apiStateEmitter.on(options?.event, listener)
    else apiStateEmitter.onAny(listener)
    return () => {
      if (options?.event) apiStateEmitter.off(options?.event, listener)
      else apiStateEmitter.offAny(listener)
    }
  }, [options?.includeUniverse, options?.event])

  return currentState
}

/**
 * React Hook that returns the current DMX universe and re-renders on changes.
 *
 * NOTE: This Hook may re-render up to 20 times per second.
 */
export const useDmxUniverse = (): number[] => useApiState('universe')
