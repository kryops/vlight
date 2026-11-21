import { Link } from 'react-router'

import { controlSequence } from '../../api'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { useApiStateSelector } from '../../hooks/api'
import { HotkeyContext } from '../../hooks/hotkey'
import { Button } from '../../ui/buttons/button'
import { iconAdd, iconConfig, iconStop } from '../../ui/icons'
import { openEntityEditor } from '../config/entities/editors'
import { entitiesPageRoute } from '../routes'

export function isAnySequenceRunning(apiState: ApiState): boolean {
  return Object.values(apiState.sequences).some(
    state => state.status === 'running'
  )
}

/** Whether any sequence is started, i.e. running or paused. */
export function isAnySequenceStarted(apiState: ApiState): boolean {
  return Object.keys(apiState.sequences).length > 0
}

export function stopAllSequences() {
  for (const id of Object.keys(apiState.sequences)) {
    controlSequence(id, 'stop')
  }
}

const addSequence = () => openEntityEditor('sequences')

/**
 * Corner actions for the sequences page:
 * - Add sequence
 * - Configure
 * - Stop all
 */
export function SequencesActions() {
  const allStopped = useApiStateSelector(
    apiState => !isAnySequenceStarted(apiState),
    { event: 'sequences' }
  )

  return (
    <HotkeyContext value={true}>
      <Button
        title="Add sequence"
        icon={iconAdd}
        transparent
        onClick={addSequence}
      />
      <Link to={entitiesPageRoute('sequences')}>
        <Button title="Configure sequences" icon={iconConfig} transparent />
      </Link>
      <Button
        icon={iconStop}
        onClick={stopAllSequences}
        disabled={allStopped}
        title="Stop all sequences"
        hotkey="i"
      >
        STOP
      </Button>
    </HotkeyContext>
  )
}
