import { FixtureState } from '@vlight/types'
import { ChannelType } from '@vlight/controls'

export function getInitialFixtureState(mapping?: string[]): FixtureState {
  const colors = [ChannelType.Red, ChannelType.Green, ChannelType.Blue]
  if (mapping && colors.every(c => mapping.includes(c))) {
    return {
      initial: true,
      on: false,
      channels: {
        [ChannelType.Master]: 255,
        [ChannelType.Red]: 255,
        [ChannelType.Green]: 255,
        [ChannelType.Blue]: 255,
      },
    }
  }
  return {
    initial: true,
    on: false,
    channels: {
      [ChannelType.Master]: 255,
    },
  }
}
