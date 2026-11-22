import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { MasterData, MasterDataMaps } from '@vlight/types'
import { shallowEqual } from '@vlight/utils'

import { subscribeToUniverse } from '../api'
import { getMasterDataMaps } from '../api/masterdata'
import { ApiState } from '../api/worker/processing'
import { apiStateEmitter, apiState, workerState } from '../api/api-state'

type ApiStateEvent = keyof ApiState | 'connecting'

const subscriptions = new Map<
  ApiStateEvent,
  (callback: () => void) => () => void
>()

/**
 * Returns a (stable) `useSyncExternalStore` subscribe function for the given event.
 */
function subscribeTo(event: ApiStateEvent) {
  let subscribe = subscriptions.get(event)
  if (!subscribe) {
    subscribe = (callback: () => void) => apiStateEmitter.on(event, callback)
    subscriptions.set(event, subscribe)
  }
  return subscribe
}

const getConnecting = () => workerState.connecting

/**
 * React Hook that returns whether the WebSocket to the backend is currently connecting.
 */
export function useApiConnecting(): boolean {
  return useSyncExternalStore(subscribeTo('connecting'), getConnecting)
}

/**
 * React Hook that returns a single state property and re-renders on updates.
 *
 * The top-level properties of the API state are replaced (not mutated) on every update.
 *
 * If you only need the state of a single sub-property of the given key,
 * use {@link useApiStateEntry} instead.
 */
export function useApiState<TKey extends keyof ApiState>(
  key: TKey
): NonNullable<ApiState[TKey]> {
  // We assume that someone will display a loading screen further up if not all data is present
  return useSyncExternalStore(subscribeTo(key), () => apiState[key])!
}

/**
 * React Hook that returns a sub-state and re-renders on updates.
 */
export function useApiStateEntry<
  TKey extends keyof ApiState,
  TSubKey extends keyof NonNullable<ApiState[TKey]>,
>(key: TKey, subKey: TSubKey): NonNullable<ApiState[TKey]>[TSubKey] {
  return useSyncExternalStore(
    subscribeTo(key),
    () => (apiState[key] as NonNullable<ApiState[TKey]>)?.[subKey]
  )
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
export function useMasterDataMaps(): MasterDataMaps {
  return useSyncExternalStore(subscribeTo('masterData'), getMasterDataMaps)
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
  const masterDataMaps = useMasterDataMaps()
  return useMemo(
    () => ({ masterData, masterDataMaps }),
    [masterData, masterDataMaps]
  )
}

export interface UseApiStateSelectorOptions {
  /** Only event to listen to. */
  event?: keyof ApiState
  /** Controls whether to also listen to the universe event. */
  includeUniverse?: boolean
}

export interface UseApiStateSelectorWithEqualityOptions<
  T,
> extends UseApiStateSelectorOptions {
  /**
   * Custom equality check: While it returns `true`, the previous value is kept
   * and the component does not re-render.
   *
   * Defaults to a shallow equality check.
   */
  isEqual?: (a: T, b: T) => boolean
}

/**
 * React Hook that subscribes to DMX universe updates from the backend
 * while the calling component is mounted.
 */
export function useUniverseSubscription(enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    return subscribeToUniverse()
  }, [enabled])
}

/**
 * Wraps the selector so that it returns the previous value
 * as long as the new one is equal.
 */
function createEqualitySelector<T>(
  selector: (apiState: ApiState) => T,
  isEqual: (a: T, b: T) => boolean = shallowEqual
) {
  let hasValue = false
  let lastValue: T
  return () => {
    const newValue = selector(apiState)
    if (hasValue && isEqual(newValue, lastValue)) return lastValue
    hasValue = true
    lastValue = newValue
    return newValue
  }
}

/**
 * React Hook that returns the value selected from the API state,
 * only re-rendering on changes (except for the DMX universe).
 *
 * Does a shallow equality check on array and object values,
 * unless a custom {@link UseApiStateSelectorWithEqualityOptions.isEqual} is given.
 */
export function useApiStateSelector<T>(
  selector: (apiState: ApiState) => T,
  options?: UseApiStateSelectorWithEqualityOptions<T>
): T {
  const event = options?.event
  const includeUniverse = options?.includeUniverse ?? false
  const isEqual = options?.isEqual
  useUniverseSubscription(includeUniverse)

  const subscribe = useMemo(() => {
    if (event) return subscribeTo(event)
    return (callback: () => void) =>
      apiStateEmitter.onAny(({ name }) => {
        if (name === 'universe' && !includeUniverse) return
        callback()
      })
  }, [event, includeUniverse])

  const getSnapshot = useMemo(
    () => createEqualitySelector(selector, isEqual),
    [selector, isEqual]
  )

  return useSyncExternalStore(subscribe, getSnapshot)
}

/**
 * React Hook that returns the current DMX universe and re-renders on changes.
 *
 * NOTE: This Hook may re-render up to 20 times per second.
 */
export function useDmxUniverse(): number[] {
  useUniverseSubscription()
  return useApiState('universe')
}
