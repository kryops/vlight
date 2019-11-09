import { FixtureState, FixtureType } from '@vlight/entities'

/**
 * Sync with client ChannelMapping!
 */
export enum ChannelMapping {
  red = 'r',
  green = 'g',
  blue = 'b',
  master = 'm',
}

export function mapFixtureStateToChannels(
  type: FixtureType,
  state: FixtureState
): number[] {
  const mapping = type.mapping

  const hasMasterChannel = mapping.includes(ChannelMapping.master)
  const masterChannelValue = state.channels[ChannelMapping.master] ?? 0

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    const rawValue = state.channels[channelType] ?? 0
    return hasMasterChannel || channelType === ChannelMapping.master
      ? rawValue
      : Math.round(rawValue * (masterChannelValue / 255))
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
