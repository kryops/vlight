import { css } from '@linaria/core'
import { ChannelMapping } from '@vlight/controls'
import { ChaseColor } from '@vlight/types'
import { highestRandomValue } from '@vlight/utils'
import { useEffect, useState } from 'react'

import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { Button } from '../../ui/buttons/button'
import { ColorPicker } from '../../ui/controls/colorpicker'
import { colorPickerColors } from '../../ui/controls/colorpicker/util'
import { FixtureStateFader } from '../../ui/controls/fader/fixture-state-fader'
import { editorTitle } from '../../ui/css/editor-styles'
import { faderContainer } from '../../ui/css/fader-container'
import { iconDelete } from '../../ui/icons'

const colorPickerContainer = css`
  display: flex;
  justify-content: stretch;
`

const colorPickerStyle = css`
  width: auto;
  flex: 1 1 auto;
`

export interface ChaseColorEditorProps {
  members: string[]
  color?: ChaseColor
  onChange: (newValue: ChaseColor | null) => void
  onClose?: (success: boolean) => void
}

export function ChaseColorEditor({
  color,
  members,
  onChange,
  onClose,
}: ChaseColorEditorProps) {
  const [localState, setLocalState] = useState(
    color ?? { channels: { m: 255, r: 255 } }
  )

  useEffect(
    () => {
      if (!color) onChange(localState)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const mapping = useCommonFixtureMapping(members)

  const onChangeWrapper = (newColor: ChaseColor) => {
    setLocalState(newColor)
    onChange(newColor)
  }

  // TODO random / range inputs
  const renderFader = (channelType: string, index = 0) => (
    <FixtureStateFader
      key={channelType + index}
      channelType={channelType}
      value={highestRandomValue(localState?.channels[channelType] ?? 0)}
      onChange={newValue =>
        onChangeWrapper({
          ...localState,
          channels: { ...localState?.channels, ...newValue.channels },
        })
      }
      colorPicker={false}
    />
  )

  const colorPickerCapable = colorPickerColors.every(c => mapping.includes(c))

  const r = highestRandomValue(localState?.channels[ChannelMapping.Red] ?? 0)
  const g = highestRandomValue(localState?.channels[ChannelMapping.Green] ?? 0)
  const b = highestRandomValue(localState?.channels[ChannelMapping.Blue] ?? 0)

  return (
    <>
      <h3 className={editorTitle}>
        {color ? 'Edit Chase Color' : 'Add Chase Color'}
      </h3>
      {colorPickerCapable && (
        <div className={colorPickerContainer}>
          <ColorPicker
            r={r}
            g={g}
            b={b}
            onChange={colorPickerColor =>
              onChangeWrapper({
                ...localState,
                channels: { ...localState.channels, ...colorPickerColor },
              })
            }
            setDefaultHeight
            className={colorPickerStyle}
          />
        </div>
      )}
      <div className={faderContainer}>{mapping.map(renderFader)}</div>
      {color && onClose && (
        <Button
          onDown={() => {
            onChange(null)
            onClose(true)
          }}
          icon={iconDelete}
        >
          Remove Color
        </Button>
      )}
    </>
  )
}
