import { ChaseColor, IdType, LiveChase } from '@vlight/types'
import {
  ensureBetween,
  highestRandomValue,
  lowestRandomValue,
} from '@vlight/utils'

import { setLiveChaseState } from '../../api'
import { getFixtureStateColor } from '../../util/fixtures'

import {
  liveChaseFastMinSpeed,
  liveChaseMaxSpeed,
  liveChaseMinSpeed,
} from './constants'

/**
 * Maps a chase color to a CSS color string or gradient
 * (containing the min-max range for random values).
 */
export function getChasePreviewColor(color: ChaseColor): string {
  const high =
    getFixtureStateColor({
      on: true,
      channels: Object.fromEntries(
        Object.entries(color.channels).map(([mapping, value]) => [
          mapping,
          value ? highestRandomValue(value) : mapping === 'm' ? 255 : 0,
        ])
      ),
    }) ?? 'black'
  const low =
    getFixtureStateColor({
      on: true,
      channels: Object.fromEntries(
        Object.entries(color.channels).map(([mapping, value]) => [
          mapping,
          value ? lowestRandomValue(value) : mapping === 'm' ? 255 : 0,
        ])
      ),
    }) ?? 'black'

  if (high === low) return high
  return `linear-gradient(to top in srgb-linear, ${low}, ${high})`
}

export function isLiveChaseCurrentlyFast(state: LiveChase): boolean {
  return (
    state.speed <= liveChaseFastMinSpeed &&
    (!state.fade || state.fade <= liveChaseFastMinSpeed)
  )
}

export function updateLiveChaseSpeed(
  id: IdType,
  state: LiveChase,
  speed: number
): void {
  if (state.fadeLockedToSpeed && state.fade) {
    setLiveChaseState(
      id,
      {
        speed,
        fade: ensureBetween(
          (speed * state.fade) / state.speed,
          liveChaseMaxSpeed,
          liveChaseMinSpeed
        ),
      },
      true
    )
  } else {
    setLiveChaseState(id, { speed }, true)
  }
}
