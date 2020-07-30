import React, { useState } from 'react'
import { MemorySceneState, MemoryScene, FixtureState } from '@vlight/entities'
import { css } from 'linaria'

import { ColorPicker } from '../../../../ui/controls/colorpicker'
import {
  fixtureStateToColor,
  ColorPickerColor,
} from '../../../../ui/controls/colorpicker/util'
import { Fader } from '../../../../ui/controls/fader'
import { faderContainer } from '../../../../ui/css/fader-container'
import { cx } from '../../../../util/styles'

const container = css`
  padding-bottom: 0;
`

export interface MemorySceneStateEditorProps {
  scene: MemoryScene
  state: MemorySceneState
  onChange: (newValue: MemorySceneState) => void
}

export function MemorySceneStateEditor({
  scene,
  state,
  onChange,
}: MemorySceneStateEditorProps) {
  const [localState, setLocalState] = useState(state)
  // TODO get mapping from scene

  if (Array.isArray(localState)) {
    // TODO support gradient
    return <div>(gradients not supported yet)</div>
  } else {
    const { r, g, b } = fixtureStateToColor(localState)

    const changeChannels = (
      newChannels: FixtureState['channels'] | ColorPickerColor
    ) => {
      const newState = {
        ...localState,
        channels: { ...localState.channels, ...newChannels },
      }
      setLocalState(newState)
      onChange(newState)
    }

    const renderFader = (channelType: string, index = 0) => (
      <Fader
        key={index}
        max={255}
        step={1}
        label={channelType.toUpperCase()}
        value={localState.channels[channelType] ?? 0}
        onChange={newValue => changeChannels({ [channelType]: newValue })}
        colorPicker={false}
      />
    )

    // TODO switch between colorpicker and faders
    return (
      <div className={cx(faderContainer, container)}>
        {renderFader('m')}
        <ColorPicker r={r} g={g} b={b} onChange={changeChannels} />
      </div>
    )
  }
}
