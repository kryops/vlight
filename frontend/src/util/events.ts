import { removeFromMutableArray } from './array'

type EventListener = (e: Event) => void
interface GlobalEventListener {
  actualListener: EventListener
  subscribedListeners: EventListener[]
}

const globalListeners: Map<
  EventTarget,
  Map<string, GlobalEventListener>
> = new Map()

export function addGlobalEventListener(
  target: EventTarget,
  event: string,
  fn: EventListener
) {
  let listenersForTarget = globalListeners.get(target)!
  if (!listenersForTarget) {
    listenersForTarget = new Map()
    globalListeners.set(target, listenersForTarget)
  }

  const listenersForEvent = listenersForTarget.get(event)

  if (listenersForEvent) {
    listenersForEvent.subscribedListeners.push(fn)
  } else {
    const newListeners: GlobalEventListener = {
      actualListener: e =>
        newListeners.subscribedListeners.forEach(listener => listener(e)),
      subscribedListeners: [fn],
    }
    listenersForTarget.set(event, newListeners)
    target.addEventListener(event, newListeners.actualListener, false)
  }
}

export function removeGlobalEventListener(
  target: EventTarget,
  event: string,
  fn: EventListener
) {
  const listenersForTarget = globalListeners.get(target)
  if (!listenersForTarget) {
    return
  }

  const listenersForEvent = listenersForTarget.get(event)
  if (!listenersForEvent) {
    return
  }

  removeFromMutableArray(listenersForEvent.subscribedListeners, fn)

  if (listenersForEvent.subscribedListeners.length === 0) {
    target.removeEventListener(event, listenersForEvent.actualListener, false)
    listenersForTarget.delete(event)
  }
}
