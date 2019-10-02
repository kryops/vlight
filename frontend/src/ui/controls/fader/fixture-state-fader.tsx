import React, { useCallback } from 'react'
import { IdType, FixtureState } from '@vlight/entities'

import { memoInProduction } from '../../../util/development'

import { Fader } from '.'

export interface FixtureStateFaderProps {
  id: IdType
  channelType: string
  value: number
  stateRef: React.MutableRefObject<FixtureState>
  colorPicker: boolean
  changeFn: (
    id: IdType,
    oldState: FixtureState,
    newState: Partial<FixtureState>
  ) => void
}

export const FixtureStateFader = memoInProduction(
  ({
    id,
    stateRef,
    channelType,
    colorPicker,
    changeFn,
  }: FixtureStateFaderProps) => {
    const onChange = useCallback(
      value =>
        changeFn(id, stateRef.current, {
          channels: {
            [channelType]: value,
          },
        }),
      [id, stateRef, channelType, changeFn]
    )
    return (
      <Fader
        max={255}
        step={1}
        label={channelType.toUpperCase()}
        value={stateRef.current.channels[channelType] ?? 0}
        onChange={onChange}
        colorPicker={colorPicker}
      />
    )
  }
)
