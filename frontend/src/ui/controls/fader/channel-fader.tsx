import React, { useCallback } from 'react'

import { memoInProduction } from '../../../util/development'

import { Fader } from '.'

export interface ChannelFaderProps {
  channel: number
  value: number
  onChange: (channel: number, value: number) => void
}

export const ChannelFader = memoInProduction(
  ({ channel, value, onChange }: ChannelFaderProps) => {
    const changeHandler = useCallback(
      (value: number) => onChange(channel, value),
      [channel, onChange]
    )
    return (
      <Fader
        key={channel}
        max={255}
        step={1}
        label={channel.toString()}
        value={value}
        onChange={changeHandler}
      />
    )
  }
)
