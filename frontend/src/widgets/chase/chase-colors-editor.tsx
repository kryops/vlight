import { css } from '@linaria/core'
import { ChannelType } from '@vlight/controls'
import { ChaseColor } from '@vlight/types'
import { useState } from 'react'

import { Button } from '../../ui/buttons/button'
import { Clickable } from '../../ui/components/clickable'
import { editorTitle } from '../../ui/css/editor-styles'
import { iconAdd, iconDelete } from '../../ui/icons'
import { baseline } from '../../ui/styles'
import { cx } from '../../util/styles'

import { ChaseColorEditor } from './chase-color-editor'
import { getChasePreviewColor } from './utils'

const colorsContainer = css`
  display: flex;
  align-items: center;
  margin: ${baseline(2)} ${baseline(-0.5)};
  flex-wrap: wrap;
`

const colorContainer = css`
  height: ${baseline(8)};
  flex: 1 1 0;
  margin: ${baseline(1)} ${baseline(0.5)};
  min-width: ${baseline(30)};
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const colorContainer_active = css`
  height: ${baseline(12)};
  margin-top: 0;
  margin-bottom: 0;
`

const removeButton = css`
  background: rgba(0, 0, 0, 0.2) !important;
  align-self: stretch;
  display: flex;
  align-items: center;
`

export interface ChaseColorsEditorProps {
  /**
   * Members of the chase as fixture list strings.
   */
  members: string[]

  /**
   * The colors to edit.
   */
  colors: ChaseColor[]

  /**
   * Initial color index to select.
   *
   * Defaults to 0.
   */
  initialIndex?: number

  /**
   * Indicates whether a draft or the actual chase colors are being edited.
   */
  isDraft?: boolean

  onChange: (newValue: ChaseColor[]) => void
}

/**
 * Dialog content edit the colors of a chase.
 */
export function ChaseColorsEditor({
  colors,
  members,
  onChange,
  initialIndex,
  isDraft,
}: ChaseColorsEditorProps) {
  const [localState, setLocalState] = useState(colors)
  const [selectedIndex, setSelectedIndex] = useState(initialIndex ?? 0)

  const effectiveIndex = Math.min(localState.length - 1, selectedIndex)
  const selectedColor: ChaseColor | undefined = localState[effectiveIndex]

  const onChangeWrapper = (newColors: ChaseColor[]) => {
    setLocalState(newColors)
    onChange(newColors)
  }

  return (
    <>
      <h3 className={editorTitle}>
        {isDraft ? 'Edit Chase Colors Draft' : 'Edit Chase Colors'}
      </h3>
      <div className={colorsContainer}>
        {localState.map((color, index) => (
          <Clickable
            key={index}
            className={cx(
              colorContainer,
              index === effectiveIndex && colorContainer_active
            )}
            style={{
              background: getChasePreviewColor(color),
            }}
            onClick={() => setSelectedIndex(index)}
          >
            {localState.length > 1 && (
              <Button
                icon={iconDelete}
                title="Remove Color"
                transparent
                className={removeButton}
                onClick={event => {
                  event?.stopPropagation()
                  onChangeWrapper(localState.filter(it => it !== color))
                  if (index < selectedIndex) setSelectedIndex(selectedIndex - 1)
                }}
              />
            )}
          </Clickable>
        ))}
        <Button
          icon={iconAdd}
          transparent
          onClick={() => {
            onChangeWrapper([
              ...localState,
              {
                channels: {
                  [ChannelType.Master]: 255,
                  [ChannelType.Red]: 255,
                },
              },
            ])
            setSelectedIndex(localState.length)
          }}
        />
      </div>
      {selectedColor && (
        <ChaseColorEditor
          members={members}
          color={selectedColor}
          onChange={newColor =>
            onChangeWrapper(
              newColor === null
                ? localState.filter((_, index) => index !== effectiveIndex)
                : localState.map((color, index) =>
                    index === effectiveIndex ? newColor : color
                  )
            )
          }
        />
      )}
    </>
  )
}
