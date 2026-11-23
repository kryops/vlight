import { css } from '@linaria/core'
import { useState } from 'react'
import {
  Action,
  IdType,
  ProgrammableButton,
  ProgrammableButtonDownAction,
  Sequence,
} from '@vlight/types'

import { executeActions } from '../../api'
import { apiState } from '../../api/api-state'
import {
  applyFadeToActions,
  endRecording,
  getRecordingState,
  setRecordedActions,
  setRecordingFade,
  setRecordingPaused,
  startRecording,
  useRecordingState,
} from '../../api/recording'
import { ActionsEditor } from '../../pages/config/entities/editors/actions/actions-editor'
import { openEntityEditor } from '../../pages/config/entities/editors'
import {
  newButtonFactory,
  newSequenceFactory,
} from '../../pages/config/entities/new-entity-factories'
import { Button } from '../buttons/button'
import { Label } from '../forms/label'
import { Select, SelectEntry } from '../forms/select'
import { NumberInput } from '../forms/typed-input'
import {
  iconAdd,
  iconApply,
  iconClose,
  iconEdit,
  iconPause,
  iconRecord,
  iconSave,
} from '../icons'
import { Icon } from '../icons/icon'
import { okCancel } from '../overlays/buttons'
import { showDialogWithReturnValue } from '../overlays/dialog'
import {
  baseline,
  errorShade,
  primaryShade,
  textShade,
  warnShade,
} from '../styles'
import { cx } from '../../util/styles'

const bar = css`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(2)};
  padding: ${baseline(2)} ${baseline(4)};
  background: ${primaryShade(4)};
  border-top: 2px solid ${primaryShade(2)};

  & > * {
    margin-left: 0;
  }
`

const bar_recording = css`
  border-top-color: ${errorShade(0)};
`

const bar_paused = css`
  border-top-color: ${warnShade(0)};
`

const status = css`
  display: flex;
  align-items: center;
  gap: ${baseline(2)};
  flex: 1 1 auto;
  color: ${textShade(1)};
`

const fadeControl = css`
  display: flex;
  align-items: center;
  gap: ${baseline(1)};
  white-space: nowrap;
`

const fadeInput = css`
  width: ${baseline(16)};
`

const editContainer = css`
  width: 90vw;
  max-width: 1400px;
`

// Edit

const EditActionsForm = ({
  initialValue,
  onChange,
}: {
  initialValue: Action[]
  onChange: (actions: Action[]) => void
}) => {
  const [actions, setActions] = useState(initialValue)
  return (
    <div className={editContainer}>
      <ActionsEditor
        actions={actions}
        onChange={newActions => {
          setActions(newActions)
          onChange(newActions)
        }}
      />
    </div>
  )
}

async function editActions() {
  const initialValue = getRecordingState().actions
  const result = await showDialogWithReturnValue<Action[]>(
    onChange => (
      <EditActionsForm initialValue={initialValue} onChange={onChange} />
    ),
    okCancel,
    { title: 'Recorded Actions', initialValue }
  )
  if (result) setRecordedActions(result)
}

// Save

type SaveTarget =
  | { type: 'buttons' | 'sequences'; id: IdType | undefined }
  | undefined

const SaveTargetForm = ({
  initialValue,
  onChange,
}: {
  initialValue: string
  onChange: (value: string) => void
}) => {
  const [value, setValue] = useState(initialValue)
  const { buttons, sequences } = apiState.rawMasterData!

  const sortByLabel = (a: SelectEntry<string>, b: SelectEntry<string>) =>
    a.label.localeCompare(b.label)

  const entries: SelectEntry<string>[] = [
    { value: 'buttons:', label: '(New Button)' },
    { value: 'sequences:', label: '(New Sequence)' },
    ...buttons
      .map(({ id, label }) => ({
        value: `buttons:${id}`,
        label: `Button: ${label || id}`,
      }))
      .sort(sortByLabel),
    ...sequences
      .map(({ id, name }) => ({
        value: `sequences:${id}`,
        label: `Sequence: ${name || id} (as new step)`,
      }))
      .sort(sortByLabel),
  ]

  return (
    <Label
      label="Save to"
      input={
        <Select
          entries={entries}
          value={value}
          onChange={newValue => {
            setValue(newValue)
            onChange(newValue)
          }}
        />
      }
    />
  )
}

async function selectSaveTarget(): Promise<SaveTarget> {
  const initialValue = 'buttons:'
  const result = await showDialogWithReturnValue<string>(
    onChange => (
      <SaveTargetForm initialValue={initialValue} onChange={onChange} />
    ),
    okCancel,
    { title: 'Save Recorded Actions', initialValue }
  )
  if (!result) return undefined
  const separatorIndex = result.indexOf(':')
  return {
    type: result.slice(0, separatorIndex) as 'buttons' | 'sequences',
    id: result.slice(separatorIndex + 1) || undefined,
  }
}

/**
 * Lets the user select a button or sequence to add the recorded actions to,
 * and opens its editor.
 *
 * Returns whether the actions were saved.
 */
async function saveActions(actions: Action[]): Promise<boolean> {
  const target = await selectSaveTarget()
  if (!target) return false

  const { buttons, sequences } = apiState.rawMasterData!

  if (target.type === 'buttons') {
    const existing = buttons.find(it => it.id === target.id)
    const button: ProgrammableButton = existing ?? {
      id: '',
      ...newButtonFactory(),
    }
    return openEntityEditor('buttons', {
      ...button,
      down: [...button.down, ...(actions as ProgrammableButtonDownAction[])],
    })
  }

  const existing = sequences.find(it => it.id === target.id)
  const sequence: Sequence = existing
    ? {
        ...existing,
        steps: [...existing.steps, { delay: 0, actions }],
      }
    : {
        id: '',
        ...newSequenceFactory(),
        steps: [{ delay: 0, actions }],
      }
  return openEntityEditor('sequences', sequence)
}

// Bar

const cancel = () => endRecording()

const apply = () => {
  const { fade } = getRecordingState()
  const actions = endRecording()
  if (actions.length) executeActions(applyFadeToActions(actions, fade))
}

const save = async () => {
  const { actions, fade } = getRecordingState()
  if (!actions.length) return
  // the recording is kept if the user cancels
  if (await saveActions(applyFadeToActions(actions, fade))) endRecording()
}

/**
 * Input for the fade time used when applying/saving the recorded actions.
 */
function FadeControl({ fade }: { fade: number }) {
  return (
    <div
      className={fadeControl}
      title="Fade time in seconds for applying or saving the actions (for actions without their own fade time)"
    >
      Fade
      <NumberInput
        value={fade || undefined}
        onChange={value => setRecordingFade(value ?? 0)}
        min={0}
        step={0.1}
        placeholder="0"
        aria-label="Fade"
        className={fadeInput}
      />
      s
      <Button
        icon={iconAdd}
        onClick={() => setRecordingFade(Math.round((fade + 1) * 10) / 10)}
        title="Increase fade time by 1 second"
      />
      <Button
        icon={iconClose}
        onClick={() => setRecordingFade(0)}
        disabled={fade === 0}
        title="Reset fade time"
      />
    </div>
  )
}

/**
 * Bar at the bottom of the screen to control the action recording mode.
 */
export function RecordingBar() {
  const { active, paused, actions, fade } = useRecordingState()
  const count = actions.length
  const countLabel = `${count} action${count === 1 ? '' : 's'}`

  if (!active) {
    return (
      <div className={bar}>
        <div className={status}>
          Record control changes as actions instead of executing them.
        </div>
        <Button
          icon={iconRecord}
          iconColor={errorShade(0)}
          onClick={startRecording}
        >
          Record
        </Button>
      </div>
    )
  }

  return (
    <div className={cx(bar, paused ? bar_paused : bar_recording)}>
      <div className={status}>
        <Icon
          icon={paused ? iconPause : iconRecord}
          color={paused ? warnShade(0) : errorShade(0)}
        />
        {paused ? 'Paused' : 'Recording'} ({countLabel})
      </div>
      <FadeControl fade={fade} />
      <Button
        icon={paused ? iconRecord : iconPause}
        onClick={() => setRecordingPaused(!paused)}
        title={
          paused ? 'Continue recording' : 'Pause recording to make real changes'
        }
        active={paused}
      >
        {paused ? 'Continue' : 'Pause'}
      </Button>
      <Button
        icon={iconEdit}
        onClick={() => void editActions()}
        title="Edit the recorded actions"
      >
        Edit
      </Button>
      <Button
        icon={iconClose}
        onClick={cancel}
        title="End recording and discard the recorded actions"
      >
        Cancel
      </Button>
      <Button
        icon={iconApply}
        onClick={apply}
        disabled={count === 0}
        title="End recording and execute the recorded actions"
      >
        Apply
      </Button>
      <Button
        icon={iconSave}
        onClick={() => void save()}
        disabled={count === 0}
        title="End recording and add the recorded actions to a button or sequence"
      >
        Save
      </Button>
    </div>
  )
}
