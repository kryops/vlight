import { ChaseColor, IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'
import { isTruthy } from '@vlight/utils'
import { ChannelType } from '@vlight/controls'

import { setLiveChaseState } from '../../api'
import {
  iconAdd,
  iconDelete,
  iconOk,
  iconSpeedBurst,
  iconTime,
} from '../../ui/icons'
import { baseline, primaryShade } from '../../ui/styles'
import { memoInProduction } from '../../util/development'
import { showDialog } from '../../ui/overlays/dialog'
import { buttonCancel, buttonOk } from '../../ui/overlays/buttons'
import { Button } from '../../ui/buttons/button'
import { cx } from '../../util/styles'
import { useEvent } from '../../hooks/performance'

import { getChasePreviewColor } from './utils'
import { ChaseColorsEditor } from './chase-colors-editor'

const colorContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const draftContainer = css`
  margin-left: ${baseline()};
  border: 1px dashed ${primaryShade(0)};
  padding: ${baseline()};
`

const colorStyle = css`
  flex: 1 1 auto;
  height: ${baseline(8)};
  width: ${baseline(12)};
  margin-bottom: ${baseline()};
  cursor: pointer;
`

export interface LiveChaseWidgetColorControlsProps {
  id: IdType
  state: LiveChase
}

/**
 * Component to render the color controls for a live chase
 */
export const LiveChaseWidgetColorControls = memoInProduction(
  ({ id, state }: LiveChaseWidgetColorControlsProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)

    const applyDraft = (draft: ChaseColor[]) =>
      update({ colors: draft, colorsDraft: null })

    const applyCurrentDraft = useEvent(() =>
      applyDraft(state.colorsDraft ?? [])
    )

    const openColorDialog = async ({
      colors,
      initialIndex,
      isDraft,
    }: {
      colors: ChaseColor[]
      initialIndex: number
      isDraft?: boolean
    }) => {
      const draftValue = 'draft'
      const applyValue = 'apply'
      const deleteValue = 'delete'

      let newColors: ChaseColor[] = colors
      const result = await showDialog<
        true | null | typeof draftValue | typeof applyValue | typeof deleteValue
      >(
        <ChaseColorsEditor
          colors={colors}
          members={state.members}
          initialIndex={initialIndex}
          isDraft={isDraft}
          onChange={value => (newColors = value)}
        />,
        [
          buttonOk,
          isDraft
            ? ({
                label: 'Apply instantly',
                value: applyValue,
                icon: iconSpeedBurst,
              } as const)
            : ({
                label: 'Set as Draft',
                value: draftValue,
                icon: iconTime,
              } as const),
          isDraft &&
            ({
              label: 'Delete Draft',
              value: deleteValue,
              icon: iconDelete,
            } as const),
          buttonCancel,
        ].filter(isTruthy),
        { showCloseButton: true }
      )
      if (!result) return

      if (result === applyValue) {
        applyDraft(newColors)
      } else if (result === deleteValue) {
        update({ colorsDraft: null })
      } else {
        update(
          result === draftValue || isDraft
            ? { colorsDraft: newColors }
            : { colors: newColors }
        )
      }
    }

    const removeColor = useEvent(
      (
        event: { stopPropagation: () => void } | undefined,
        color: ChaseColor
      ) => {
        event?.stopPropagation()
        return update({
          colors: state.colors.filter(it => it !== color),
        })
      }
    )

    const addColor = useEvent(() =>
      openColorDialog({
        colors: [
          ...state.colors,
          {
            channels: {
              [ChannelType.Master]: 255,
              [ChannelType.Red]: 255,
            },
          },
        ],
        initialIndex: state.colors.length,
      })
    )

    return (
      <>
        <div className={colorContainer}>
          {state.colors.map((color, index) => (
            <div
              key={index}
              className={colorStyle}
              style={{
                background: getChasePreviewColor(color),
              }}
              onClick={() =>
                openColorDialog({
                  colors: state.colors,
                  initialIndex: index,
                })
              }
            >
              {state.colors.length > 1 && state.colors.length < 4 && (
                <Button<ChaseColor>
                  icon={iconDelete}
                  title="Remove Color"
                  transparent
                  onClick={removeColor}
                  onClickArg={color}
                />
              )}
            </div>
          ))}
          <Button icon={iconAdd} transparent onClick={addColor} />
        </div>
        {state.colorsDraft && (
          <div className={cx(colorContainer, draftContainer)}>
            {state.colorsDraft.map((color, index) => (
              <div
                key={index}
                className={colorStyle}
                style={{
                  background: getChasePreviewColor(color),
                }}
                onClick={() =>
                  openColorDialog({
                    colors: state.colorsDraft ?? [],
                    initialIndex: index,
                    isDraft: true,
                  })
                }
              />
            ))}
            <Button
              icon={iconOk}
              transparent
              title="Apply draft"
              onClick={applyCurrentDraft}
            />
          </div>
        )}
      </>
    )
  }
)
