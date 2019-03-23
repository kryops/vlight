import { useEffect } from 'react'

import {
  addGlobalEventListener,
  removeGlobalEventListener,
} from '../util/events'

import { useCurrentRef } from './ref'

export function useGlobalEvents<T extends Event>(
  target: EventTarget,
  events: string[],
  fn: (e: T) => void
) {
  const fnRef = useCurrentRef(fn)
  useEffect(() => {
    const listener = (e: Event) => fnRef.current(e as T)
    events.forEach(event => addGlobalEventListener(target, event, listener))

    return () => {
      events.forEach(event =>
        removeGlobalEventListener(target, event, listener)
      )
    }
  }, [target, fnRef, ...events]) // eslint-disable-line react-hooks/exhaustive-deps
}
