import { MemorySceneState } from '@vlight/entities'
import { interpolateGradientPositions } from '@vlight/shared'

import { getFixtureStateColor } from './fixtures'

export function getMemorySceneStatePreviewBackground(
  state: MemorySceneState
): string {
  if (Array.isArray(state)) {
    const positions = interpolateGradientPositions(
      state.map(entry => entry.position)
    )
    const gradientStops = state.map((entry, index) => {
      const color = getFixtureStateColor({
        on: true,
        channels: entry.channels,
      })
      return `${color} ${positions[index]}%`
    })
    return `linear-gradient(to right, ${gradientStops.join(', ')})`
  } else {
    return getFixtureStateColor(state) ?? 'transparent'
  }
}
