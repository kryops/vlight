import { MemorySceneState } from '@vlight/entities'

import { getFixtureStateColor } from './fixtures'

export function getMemorySceneStatePreviewBackground(
  state: MemorySceneState
): string {
  if (Array.isArray(state)) {
    return 'transparent' // TODO support gradient
  } else {
    return getFixtureStateColor(state) ?? 'transparent'
  }
}
