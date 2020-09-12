import React, { useCallback } from 'react'
import { FixtureState } from '@vlight/entities'

import { memoInProduction } from '../../../util/development'

import { Fader } from '.'

export interface FixtureStateFaderProps {
  channelType: string
  value: number
  colorPicker: boolean
  onChange: (partialState: Partial<FixtureState>) => void
}

export const FixtureStateFader = memoInProduction(
  ({ channelType, value, colorPicker, onChange }: FixtureStateFaderProps) => {
    const changeFn = useCallback(
      newValue =>
        onChange({
          channels: {
            [channelType]: newValue,
          },
        }),
      [channelType, onChange]
    )
    return (
      <Fader
        max={255}
        step={1}
        label={channelType.toUpperCase()}
        value={value ?? 0}
        onChange={changeFn}
        colorPicker={colorPicker}
      />
    )
  }
)
