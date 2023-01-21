import { IdType, LiveChase } from '@vlight/types'

import { deleteLiveChase, setLiveChaseState } from '../../api'
import {
  iconDelete,
  iconFast,
  iconMultiple,
  iconRename,
  iconSingle,
  iconSlow,
} from '../../ui/icons'
import { memoInProduction } from '../../util/development'
import { Button } from '../../ui/buttons/button'
import { showDialog, showPromptDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'
import { useEvent } from '../../hooks/performance'

import { isLiveChaseCurrentlyFast } from './utils'

export interface LiveChaseWidgetBottomControlsProps {
  id: IdType
  state: LiveChase
  title: string | undefined
  useFastMode: boolean
  onToggleFastMode: () => void
}

/**
 * Component to render the bottom control buttons for a live chase
 */
export const LiveChaseWidgetBottomControls = memoInProduction(
  ({
    id,
    state,
    useFastMode,
    title,
    onToggleFastMode,
  }: LiveChaseWidgetBottomControlsProps) => {
    const update = (newState: Partial<LiveChase>) =>
      setLiveChaseState(id, newState, true)

    const isCurrentlyFast = isLiveChaseCurrentlyFast(state)

    const toggleFastMode = useEvent(() => {
      if (!isCurrentlyFast) return
      onToggleFastMode()
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
      <div>
        <Button
          icon={useFastMode ? iconFast : iconSlow}
          title="Toggle fast mode"
          transparent
          onClick={toggleFastMode}
          disabled={!isCurrentlyFast}
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
