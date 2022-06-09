import { ChaseColor } from '@vlight/types'
import { highestRandomValue, lowestRandomValue } from '@vlight/utils'

import { getFixtureStateColor } from '../../util/fixtures'

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
  return `linear-gradient(to top, ${low}, ${high})`
}
