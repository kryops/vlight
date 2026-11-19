import { ComponentType, PropsWithChildren, useSyncExternalStore } from 'react'

export interface OverlayProps {
  onClose?: () => void
}

let currentOverlays: ComponentType<OverlayProps>[] = []
const listeners = new Set<() => void>()
const overlayKeys = new WeakMap<ComponentType<OverlayProps>, number>()
let nextOverlayKey = 0

function notify() {
  listeners.forEach(listener => listener())
}

export function addOverlay(component: ComponentType<OverlayProps>) {
  overlayKeys.set(component, nextOverlayKey++)
  currentOverlays = [...currentOverlays, component]
  notify()
}

export function removeOverlay(component: ComponentType<OverlayProps>) {
  currentOverlays = currentOverlays.filter(it => it !== component)
  notify()
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getOverlays() {
  return currentOverlays
}

export const OverlayContainer = ({ children }: PropsWithChildren) => {
  const overlays = useSyncExternalStore(subscribe, getOverlays)

  return (
    <>
      {children}
      {overlays.map(Overlay => (
        <Overlay
          key={overlayKeys.get(Overlay)}
          onClose={() => removeOverlay(Overlay)}
        />
      ))}
    </>
  )
}
