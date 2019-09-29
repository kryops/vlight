import { useEffect, useState } from 'react'

import { masterDataMaps } from '../api/masterdata'
import { ApiState } from '../api/worker/processing'
import { apiStateEmitter, apiState, workerState } from '../api/api-state'

function identity<T>(arg: T): T {
  return arg
}

export function useApiConnecting(): boolean {
  const [state, setState] = useState(workerState.connecting)
  useEffect(() => {
    function eventHandler() {
      setState(workerState.connecting)
    }

    apiStateEmitter.onAny(eventHandler)

    return () => {
      apiStateEmitter.offAny(eventHandler)
    }
  }, [])

  return state
}

export function useApiState<
  TKey extends keyof ApiState,
  TResult = NonNullable<ApiState[TKey]>
>(
  key: TKey,
  mappingFn: (value: ApiState[TKey]) => TResult = identity as any
): TResult {
  const [state, setState] = useState(mappingFn(apiState[key]))
  useEffect(() => {
    function eventHandler() {
      setState(mappingFn(apiState[key]))
    }

    apiStateEmitter.on(key, eventHandler)

    return () => {
      apiStateEmitter.off(key, eventHandler)
    }
  }, [key, mappingFn])

  return state
}

export function useApiStateEntry<
  TKey extends keyof ApiState,
  TSubKey extends keyof ApiState[TKey]
>(key: TKey, subKey: TSubKey): ApiState[TKey][TSubKey] {
  const [state, setState] = useState(apiState[key][subKey])
  useEffect(() => {
    function eventHandler() {
      setState(apiState[key][subKey])
    }

    apiStateEmitter.on(key, eventHandler)

    return () => {
      apiStateEmitter.off(key, eventHandler)
    }
  }, [key, subKey])

  return state
}

export const useMasterData = () => useApiState('masterData')

export const useMasterDataMaps = () => {
  // refresh the component when the master data changes
  useMasterData()
  return masterDataMaps
}

export const useDmxUniverse = () => useApiState('universe')
