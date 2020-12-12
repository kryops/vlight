import { ChaseColor } from '@vlight/types'
import { highestRandomValue, lowestRandomValue } from '@vlight/utils'

import { getFixtureStateColor } from '../../util/fixtures'

export function getChasePreviewColor(color: ChaseColor): string {
  const high =
    getFixtureStateColor({
      on: true,
      channels: {
        m: color.channels.m ? highestRandomValue(color.channels.m) : 255,
        r: color.channels.r ? highestRandomValue(color.channels.r) : 0,
        g: color.channels.g ? highestRandomValue(color.channels.g) : 0,
        b: color.channels.b ? highestRandomValue(color.channels.b) : 0,
      },
    }) ?? 'black'
  const low =
    getFixtureStateColor({
      on: true,
      channels: {
        m: color.channels.m ? lowestRandomValue(color.channels.m) : 255,
        r: color.channels.r ? lowestRandomValue(color.channels.r) : 0,
        g: color.channels.g ? lowestRandomValue(color.channels.g) : 0,
        b: color.channels.b ? lowestRandomValue(color.channels.b) : 0,
      },
    }) ?? 'black'

  if (high === low) return high
  return `linear-gradient(to top, ${low}, ${high})`
}
