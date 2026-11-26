import { IdType, LiveChase } from '@vlight/types'
import { css } from '@linaria/core'

import { deleteLiveChase, setLiveChaseState } from '../../api'
import {
  iconCompactView,
  iconDelete,
  iconEdit,
  iconMultiple,
  iconSingle,
} from '../../ui/icons'
import { Button } from '../../ui/buttons/button'
import { showDialog } from '../../ui/overlays/dialog'
import { yesNo } from '../../ui/overlays/buttons'
import { centeredText } from '../../ui/css/basic-styles'
import { primaryShade } from '../../ui/styles'
import { removeReferencesFromActions } from '../../pages/config/entities/action-references'

import {
  colorModeEntries,
  getLiveChaseModeDescription,
  hasCustomLiveChaseMode,
  showLiveChaseEditDialog,
  showLiveChaseModeDialog,
} from './live-chase-dialogs'

const modeButtonContainer = css`
  position: relative;
  display: inline-block;
`

/** Small dot to indicate non-default mode options. */
const customModeIndicator = css`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${primaryShade(0)};
  pointer-events: none;
`

export interface LiveChaseWidgetBottomControlsProps {
  id: IdType
  state: LiveChase
  title: string | undefined

  /** See `onChange` of the `StatelessLiveChaseWidget`. */
  onChange?: (newState: Partial<LiveChase>) => void
}

/**
 * Component to render the bottom control buttons for a live chase
 */
export const LiveChaseWidgetBottomControls = ({
  id,
  state,
  title,
  onChange,
}: LiveChaseWidgetBottomControlsProps) => {
  const update =
    onChange ??
    ((newState: Partial<LiveChase>) => setLiveChaseState(id, newState, true))

  const edit = async () => {
    const changes = await showLiveChaseEditDialog({
      state,
      title: onChange ? 'Members' : `Edit ${title ?? 'Live Chase'}`,
      showName: !onChange,
    })
    if (changes) update(changes)
  }

  const colorMode =
    colorModeEntries.find(it => it.value === state.colorMode) ??
    colorModeEntries[0]

  const openModeDialog = () =>
    showLiveChaseModeDialog(id, state, update, { isAction: !!onChange })

  const toggleSingle = () => update({ single: !state.single })

  const promptDelete = async () => {
    if (await showDialog(`Delete Live Chase "${title}"?`, yesNo)) {
      deleteLiveChase(id)
      removeReferencesFromActions('live-chase', id)
    }
  }

  return (
    <div className={centeredText}>
      <Button
        icon={iconEdit}
        title={onChange ? 'Edit members' : 'Edit name and members'}
        transparent
        onClick={edit}
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
      <span className={modeButtonContainer}>
        <Button
          icon={colorMode.icon}
          title={getLiveChaseModeDescription(state)}
          transparent
          onClick={openModeDialog}
        />
        {hasCustomLiveChaseMode(state) && (
          <span className={customModeIndicator} />
        )}
      </span>
      {!onChange && (
        <>
          <Button
            icon={iconCompactView}
            title="Compact view: Speed burst button only"
            transparent
            onClick={() => update({ compact: true })}
          />
          <Button
            icon={iconDelete}
            title="Delete"
            transparent
            onClick={promptDelete}
          />
        </>
      )}
    </div>
  )
}
