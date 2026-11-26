import { useMemo } from 'react'
import { css } from '@linaria/core'
import { getChannelStateName, getFixtureTypeSegments } from '@vlight/controls'

import { getFixtureAtChannel } from '../../../util/fixtures'
import { useMasterDataAndMaps } from '../../../hooks/api'

import { Fader } from './fader'

const notUsed = css`
  opacity: 0.5;
`

export interface ChannelFaderProps {
  channel: number
  value: number
  onChange: (channel: number, value: number) => void
}

/**
 * Fader specifivally for a DMX channel.
 *
 * Displays
 * - the channel number as label
 * - the channel type from the fixture mapping as sub-label
 *   (with the segment number for fixtures with segments),
 *   or the name of the current channel state if configured
 * - the fixture name in the corner if this channel is the start of a fixture
 */
export const ChannelFader = ({
  channel,
  value,
  onChange,
}: ChannelFaderProps) => {
  const changeHandler = (value: number) => onChange(channel, value)

  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const fixture = useMemo(
    () => getFixtureAtChannel(masterData, channel),
    [masterData, channel]
  )
  const { fixtureTypes } = masterDataMaps
  const fixtureType = fixture ? fixtureTypes.get(fixture.type) : undefined
  const channelOffset = fixture ? channel - fixture.channel : -1
  const channelMapping = fixtureType?.mapping[channelOffset]
  const channelStates = channelMapping
    ? fixtureType?.channelStates?.[channelMapping]
    : undefined
  const stateName = channelStates
    ? getChannelStateName(channelStates, value)
    : undefined

  const segmentIndex =
    getFixtureTypeSegments(fixtureType)?.segmentByMappingIndex[channelOffset]
  const channelLabel =
    channelMapping !== undefined
      ? channelMapping.toUpperCase() +
        (segmentIndex !== undefined ? String(segmentIndex + 1) : '')
      : undefined

  const fixtureName =
    fixture && fixtureType && fixture.channel === channel
      ? (fixture.name ?? fixtureType.name)
      : undefined

  return (
    <Fader
      key={channel}
      max={255}
      step={1}
      label={channel.toString()}
      ariaLabel={`Channel ${channel}`}
      subLabel={stateName ?? channelLabel}
      subLabelTitle={stateName ? `${channelLabel}: ${stateName}` : undefined}
      cornerLabel={fixtureName}
      cornerLabelOverflow={fixtureType ? fixtureType.mapping.length > 1 : false}
      value={value}
      onChange={changeHandler}
      className={fixture ? undefined : notUsed}
    />
  )
}
