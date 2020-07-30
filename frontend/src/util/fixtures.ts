import { FixtureState } from '@vlight/entities'

import { ChannelMapping } from '../../../shared/src'

export function getFixtureStateColor(
  fixtureState: FixtureState
): string | undefined {
  if (!fixtureState.on) return undefined

  const masterValue = fixtureState.channels[ChannelMapping.master] ?? 255

  const values = [
    ChannelMapping.red,
    ChannelMapping.green,
    ChannelMapping.blue,
  ].map(mapping => fixtureState.channels[mapping])

  if (values.every(x => x === 0 || x === undefined)) return undefined
  const [r, g, b] = values
  const opacity = 0.3 + (masterValue / 255) * 0.7
  return `rgba(${r ?? 0}, ${g ?? 0}, ${b ?? 0}, ${opacity})`
}
