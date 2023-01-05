import { FixtureState } from '@vlight/types'

import { memoInProduction } from '../../../util/development'
import { useEvent } from '../../../hooks/performance'

import { Fader } from './fader'

export interface FixtureStateFaderProps {
  /** Channel type to control. */
  channelType: string

  /** Value between 0-255. */
  value: number

  /**
   * Controls whether the fader is part of a color picker.
   *
   * Changes the margins so the content will not jump when switching between
   * the color picker and the faders.
   */
  colorPicker: boolean

  onChange: (partialState: Partial<FixtureState>) => void
}

/**
 * Fader component to control the property of a fixture state.
 */
export const FixtureStateFader = memoInProduction(
  ({ channelType, value, colorPicker, onChange }: FixtureStateFaderProps) => {
    const changeFn = useEvent((newValue: number) =>
      onChange({
        channels: {
          [channelType]: newValue,
        },
      })
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
