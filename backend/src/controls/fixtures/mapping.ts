import { FixtureState } from '@vlight/types'
import { ChannelMapping } from '@vlight/controls'

export function getInitialFixtureState(mapping?: string[]): FixtureState {
  const colors = [ChannelMapping.Red, ChannelMapping.Green, ChannelMapping.Blue]
  if (mapping && colors.every(c => mapping.includes(c))) {
    return {
      initial: true,
      on: false,
      channels: {
        m: 255,
        r: 255,
        g: 255,
        b: 255,
      },
    }
  }
  return {
    initial: true,
    on: false,
    channels: {
      m: 255,
    },
  }
}
