import { FixtureChannelState, FixtureState } from '@vlight/types'
import { getChannelStateNames } from '@vlight/controls'

import { FaderHotkeys } from '../../../hooks/fader-hotkeys'

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

  /**
   * Named state tables for this channel (one per fixture type).
   *
   * If set, the name of the current state is displayed as sub-label.
   */
  states?: FixtureChannelState[][]

  /** Keys to move the fader up and down while they are held. */
  hotkeys?: FaderHotkeys

  onChange: (partialState: Partial<FixtureState>) => void
}

/**
 * Fader component to control the property of a fixture state.
 */
export const FixtureStateFader = ({
  channelType,
  value,
  colorPicker,
  states,
  hotkeys,
  onChange,
}: FixtureStateFaderProps) => {
  const stateNames = states ? getChannelStateNames(states, value ?? 0) : []

  const changeFn = (newValue: number) =>
    onChange({
      channels: {
        [channelType]: newValue,
      },
    })
  return (
    <Fader
      max={255}
      step={1}
      label={channelType.toUpperCase()}
      subLabel={
        stateNames.length > 1 ? '(mixed)' : (stateNames[0] ?? undefined)
      }
      subLabelTitle={stateNames.length > 1 ? stateNames.join(' / ') : undefined}
      value={value ?? 0}
      onChange={changeFn}
      colorPicker={colorPicker}
      hotkeys={hotkeys}
    />
  )
}
