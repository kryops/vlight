import { useCallback } from 'react'
import { FixtureState } from '@vlight/types'

import { memoInProduction } from '../../../util/development'

import { Fader } from './fader'

export interface FixtureStateFaderProps {
  channelType: string
  value: number
  colorPicker: boolean
  onChange: (partialState: Partial<FixtureState>) => void
}

export const FixtureStateFader = memoInProduction(
  ({ channelType, value, colorPicker, onChange }: FixtureStateFaderProps) => {
    const changeFn = useCallback(
      (newValue: number) =>
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
