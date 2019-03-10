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
  const masterChannelValue = state.channels[ChannelMapping.master] || 0

  return mapping.map(channelType => {
    if (!state.on) {
      return 0
    }

    const rawValue = state.channels[channelType] || 0
    return hasMasterChannel
      ? rawValue
      : Math.round(rawValue * (masterChannelValue / 255))
  })
}
