import { IdType, LiveChase } from '@vlight/types'

import { deleteLiveChase, setLiveChaseState } from '../../api'
import {
  iconDelete,
  iconList,
  iconMultiple,
  iconRandom,
  iconRename,
  iconSameColor,
  iconSameState,
  iconSingle,
} from '../../ui/icons'
import { memoInProduction } from '../../util/development'
import { Button } from '../../ui/buttons/button'
import {
  showDialog,
  showDialogWithReturnValue,
  showPromptDialog,
} from '../../ui/overlays/dialog'
import { buttonCancel, buttonOk, yesNo } from '../../ui/overlays/buttons'
import { useEvent } from '../../hooks/performance'
import { centeredText } from '../../ui/css/basic-styles'
import { FixtureListEditor } from '../../ui/forms/fixture-list-input'

interface ColorModeDescriptor {
  mode: LiveChase['colorMode']
  description: string
  icon: string
}

const colorModes: ColorModeDescriptor[] = [
  {
    mode: 'random',
    description: 'Colors are applied randomly',
    icon: iconRandom,
  },
  {
    mode: 'same-color',
    description:
      'The same color (but not state) is applied to all active members',
    icon: iconSameColor,
  },
  {
    mode: 'same-state',
    description: 'The same state is applied to all active members',
    icon: iconSameState,
  },
]

export interface LiveChaseWidgetBottomControlsProps {
  id: IdType
  state: LiveChase
  title: string | undefined
}

/**
 * Component to render the bottom control buttons for a live chase
 */
export const LiveChaseWidgetBottomControls = memoInProduction(
  ({ id, state, title }: LiveChaseWidgetBottomControlsProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)

    const editFixtureList = useEvent(async () => {
      const result = await showDialogWithReturnValue<string[]>(
        onChange => (
          <FixtureListEditor
            value={state.members}
            onChange={onChange}
            ordering
          />
        ),
        [buttonOk, buttonCancel],
        {
          title: `Members for chase ${state.name ?? id}`,
          showCloseButton: true,
        }
      )
      if (result) update({ members: result })
    })

    const colorMode =
      colorModes.find(it => it.mode === state.colorMode) ?? colorModes[0]

    const switchColorMode = useEvent(() => {
      const index = colorModes.indexOf(colorMode)
      const nextMode =
        colorModes[index === colorModes.length - 1 ? 0 : index + 1]

      update({ colorMode: nextMode.mode })
    })

    const toggleSingle = useEvent(() => update({ single: !state.single }))

    const rename = useEvent(async () => {
      const name = await showPromptDialog({
        title: 'Rename Live Chase',
        label: 'Name',
        initialValue: state.name,
      })
      if (name) {
        update({ name })
      }
    })

    const promptDelete = useEvent(async () => {
      if (await showDialog(`Delete Live Chase "${title}"?`, yesNo)) {
        deleteLiveChase(id)
      }
    })

    return (
      <div className={centeredText}>
        <Button
          icon={iconList}
          title="Toggle fixture list"
          transparent
          onClick={editFixtureList}
        />
        <Button
          icon={state.single ? iconSingle : iconMultiple}
          title={
            state.single
              ? 'Single Mode: Will turn off other single-mode chases when activated'
              : 'Multiple Mode: Will run in addition to other chases'
          }
          transparent
          onClick={toggleSingle}
        />
        <Button
          icon={colorMode.icon}
          title={colorMode.description}
          transparent
          onClick={switchColorMode}
        />
        <Button icon={iconRename} title="Rename" transparent onClick={rename} />
        <Button
          icon={iconDelete}
          title="Delete"
          transparent
          onClick={promptDelete}
        />
      </div>
    )
  }
)
