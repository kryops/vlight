import { css } from '@linaria/core'
import { ChannelType } from '@vlight/controls'
import { ChaseColor } from '@vlight/types'
import { highestRandomValue } from '@vlight/utils'
import { useEffect, useState } from 'react'

import { useCommonFixtureMapping } from '../../hooks/fixtures'
import { Button } from '../../ui/buttons/button'
import { ColorPicker } from '../../ui/controls/colorpicker'
import { colorPickerColors } from '../../ui/controls/colorpicker/util'
import { ValueOrRandomFader } from '../../ui/controls/fader/value-or-random-fader'
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
    color ?? { channels: { [ChannelType.Master]: 255, [ChannelType.Red]: 255 } }
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

  const renderFader = (channelType: string, index = 0) => (
    <ValueOrRandomFader
      max={255}
      step={1}
      key={channelType + index}
      label={channelType.toUpperCase()}
      value={localState?.channels[channelType] ?? 0}
      onChange={newValue =>
        onChangeWrapper({
          ...localState,
          channels: { ...localState?.channels, [channelType]: newValue },
        })
      }
    />
  )

  const colorPickerCapable = colorPickerColors.every(c => mapping.includes(c))

  const r = highestRandomValue(localState?.channels[ChannelType.Red] ?? 0)
  const g = highestRandomValue(localState?.channels[ChannelType.Green] ?? 0)
  const b = highestRandomValue(localState?.channels[ChannelType.Blue] ?? 0)

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
          onClick={() => {
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
