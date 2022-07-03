import { ComponentType, useEffect, useState, PropsWithChildren } from 'react'
import { addToMutableArray, removeFromMutableArray } from '@vlight/utils'

export interface OverlayProps {
  onClose?: () => void
}

const overlays: ComponentType<OverlayProps>[] = []

let overlaysChanged: (() => void) | null = null

/**
 * Renders the given component as an overlay.
 */
export function addOverlay(component: ComponentType<OverlayProps>) {
  addToMutableArray(overlays, component)
  overlaysChanged?.()
}

/**
 * Removes an overlay previously added via {@link addOverlay}.
 */
export function removeOverlay(component: ComponentType<OverlayProps>) {
  removeFromMutableArray(overlays, component)
  overlaysChanged?.()
}

/**
 * Wrapper component that renders all overlays registered via {@link addOverlay}
 */
export const OverlayContainer = ({ children }: PropsWithChildren<{}>) => {
  const [, setCounter] = useState(0)

  useEffect(() => {
    overlaysChanged = () => setCounter(count => count + 1)

    return () => {
      overlaysChanged = null
    }
  }, [])

  return (
    <>
      {children}
      {overlays.map((Overlay, index) => (
        <Overlay key={index} onClose={() => removeOverlay(Overlay)} />
      ))}
    </>
  )
}
