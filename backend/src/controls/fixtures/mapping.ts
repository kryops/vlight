import { FixtureState, FixtureType } from '@vlight/entities'
import { ChannelMapping } from '@vlight/shared'

export function mapFixtureStateToChannels(
  type: FixtureType,
  state: FixtureState
): number[] {
  const mapping = type.mapping

  const masterChannelValue = state.channels[ChannelMapping.master] ?? 255

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    // TODO this is not optimal either, but allows better mixing than setting the other channels to their max value
    if (channelType === ChannelMapping.master)
      return masterChannelValue === 0 ? 0 : 255

    const rawValue = state.channels[channelType] ?? 0
    return Math.round(rawValue * (masterChannelValue / 255))
  })
}

export function getInitialFixtureState(mapping?: string[]): FixtureState {
  const colors = [ChannelMapping.red, ChannelMapping.green, ChannelMapping.blue]
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
