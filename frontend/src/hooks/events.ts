import { useEffect } from 'react'

import {
  addGlobalEventListener,
  removeGlobalEventListener,
} from '../util/events'

export function useGlobalEvents<T extends Event>(
  target: EventTarget,
  events: string[],
  fn: (e: T) => void
) {
  useEffect(() => {
    const listener = (e: Event) => fn(e as T)
    events.forEach(event => addGlobalEventListener(target, event, listener))

    return () => {
      events.forEach(event =>
        removeGlobalEventListener(target, event, listener)
      )
    }
  }, [])
}
