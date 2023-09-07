import { MemorySceneState } from '@vlight/types'
import {
  getFinalGradient,
  interpolateGradientPositions,
} from '@vlight/controls'

import { getFixtureStateColor } from './fixtures'

/**
 * Maps a memory scene state to a CSS color or gradient.
 */
export function getMemorySceneStatePreviewBackground(
  state: MemorySceneState
): string {
  if (Array.isArray(state)) {
    const gradient = getFinalGradient(state)
    const positions = interpolateGradientPositions(
      gradient.map(entry => entry.position)
    )
    const gradientStops = gradient.map((entry, index) => {
      const color =
        getFixtureStateColor({
          on: true,
          channels: entry.channels,
        }) ?? 'transparent'
      return `${color} ${positions[index]}%`
    })
    return `linear-gradient(to right, ${gradientStops.join(', ')})`
  } else {
    return getFixtureStateColor(state) ?? 'transparent'
  }
}
