import { css } from '@linaria/core'
import { memo, useCallback, useMemo } from 'react'
import { SequenceRepeat, SequenceStep } from '@vlight/types'
import {
  getSequenceRunDuration,
  getSequenceStepTimes,
  isManualSequenceStep,
} from '@vlight/controls'

import { useFormState } from '../../../../hooks/form'
import { useShallowEqualMemo } from '../../../../hooks/performance'
import { Button } from '../../../../ui/buttons/button'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { CheckboxLabel } from '../../../../ui/forms/checkbox'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { Label } from '../../../../ui/forms/label'
import { Select, SelectEntry } from '../../../../ui/forms/select'
import { NumberInput, TextInput } from '../../../../ui/forms/typed-input'
import {
  iconAdd,
  iconCopy,
  iconDelete,
  iconDown,
  iconRevert,
  iconUp,
} from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline, primaryShade, textShade } from '../../../../ui/styles'
import { SequenceTimeline } from '../../../../widgets/sequence/sequence-timeline'
import { formatSequenceTime } from '../../../../widgets/sequence/utils'
import { EntityEditorProps } from '../types'

import { ActionsEditor } from './actions/actions-editor'

const container = css`
  width: 90vw;
  max-width: 1400px;
`

const sectionHeader = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(4)};
  margin-top: ${baseline(6)};

  & > h3 {
    margin: 0;
  }
`

const description = css`
  font-size: 0.85rem;
  opacity: 0.8;
  margin: ${baseline(2)} 0;
`

const stepContainer = css`
  padding: ${baseline(2)} ${baseline(3)};
  margin: ${baseline(4)} 0;
  border: 1px solid ${primaryShade(0)};
`

const stepHeader = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(2)};
`

const stepTitle = css`
  font-weight: bold;
  white-space: nowrap;
`

const stepTime = css`
  font-size: 0.85rem;
  color: ${textShade(1)};
  white-space: nowrap;
`

const inlineLabel = css`
  display: flex;
  align-items: center;
  gap: ${baseline()};
  white-space: nowrap;
`

const nameInput = css`
  width: ${baseline(48)};
`

const delayInput = css`
  width: ${baseline(20)};
`

const revertAllToggle = css`
  cursor: pointer;
  white-space: nowrap;
`

const spacer = css`
  flex: 1 1 auto;
`

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
  margin: ${baseline(2)} 0;
`

type RepeatMode = 'stop' | 'repeat' | 'infinite'

const repeatModeEntries: SelectEntry<RepeatMode>[] = [
  { value: 'stop', label: 'Stop at the end' },
  { value: 'repeat', label: 'Repeat n times' },
  { value: 'infinite', label: 'Repeat infinitely' },
]

function getRepeatMode(repeat: SequenceRepeat | undefined): RepeatMode {
  if (repeat === 'infinite') return 'infinite'
  return repeat ? 'repeat' : 'stop'
}

function createStep(): SequenceStep {
  return { delay: 1, actions: [] }
}

/** Updates the steps of a sequence based on their previous value. */
type UpdateSteps = (updater: (steps: SequenceStep[]) => SequenceStep[]) => void

interface SequenceStepEditorProps {
  step: SequenceStep
  index: number

  /** The overall number of steps. */
  count: number

  /** Time of the step relative to the start of a run. */
  time: number

  /** Entries for all steps of the sequence, to move actions to other steps. */
  stepEntries: SelectEntry<number>[]

  /** Stable function to update the steps. */
  updateSteps: UpdateSteps
}

/**
 * Editor for a single step of a sequence.
 */
const SequenceStepEditor = memo(function SequenceStepEditor({
  step,
  index,
  count,
  time,
  stepEntries,
  updateSteps,
}: SequenceStepEditorProps) {
  const moveTargets = useMemo(
    () => stepEntries.filter(entry => entry.value !== index),
    [stepEntries, index]
  )

  const changeStep = (change: Partial<SequenceStep>) =>
    updateSteps(steps =>
      steps.map((it, i) => (i === index ? { ...it, ...change } : it))
    )

  const moveStep = (offset: number) =>
    updateSteps(steps => {
      const newSteps = [...steps]
      const [moved] = newSteps.splice(index, 1)
      newSteps.splice(index + offset, 0, moved)
      return newSteps
    })

  const cloneStep = () =>
    updateSteps(steps => {
      const newSteps = [...steps]
      newSteps.splice(index + 1, 0, {
        ...structuredClone(steps[index]),
        name: steps[index].name ? `${steps[index].name} (copy)` : undefined,
      })
      return newSteps
    })

  const removeStep = () =>
    updateSteps(steps => steps.filter((_, i) => i !== index))

  const moveAction = (actionIndex: number, target: number) =>
    updateSteps(steps => {
      const action = steps[index].actions[actionIndex]
      return steps.map((it, i) => {
        if (i === index) {
          return {
            ...it,
            actions: it.actions.filter((_, j) => j !== actionIndex),
          }
        }
        if (i === target) return { ...it, actions: [...it.actions, action] }
        return it
      })
    })

  const allReverted =
    step.actions.length > 0 && step.actions.every(action => action.revert)
  const toggleRevertAll = () =>
    changeStep({
      actions: step.actions.map(action => ({
        ...action,
        revert: !allReverted,
      })),
    })

  return (
    <div className={stepContainer}>
      <div className={stepHeader}>
        <span className={stepTitle}>Step {index + 1}</span>
        <span className={stepTime}>
          {isManualSequenceStep(step)
            ? 'manual'
            : `at ${formatSequenceTime(time)}`}
        </span>
        <label className={inlineLabel}>
          Name
          <TextInput
            value={step.name}
            onChange={name => changeStep({ name })}
            className={nameInput}
          />
        </label>
        <label className={inlineLabel}>
          Delay (s)
          <NumberInput
            value={step.delay}
            onChange={delay =>
              changeStep({
                delay: delay === undefined ? undefined : Math.max(0, delay),
              })
            }
            placeholder="manual"
            title="Leave empty to wait until the step is triggered manually"
            min={0}
            step="any"
            className={delayInput}
          />
        </label>
        <CheckboxLabel
          className={revertAllToggle}
          value={allReverted}
          onChange={toggleRevertAll}
          title="Reverts the changes of all actions at the end of the step"
        >
          <Icon icon={iconRevert} inline shade={1} /> Revert all
        </CheckboxLabel>
        <div className={spacer} />
        <Button
          icon={iconUp}
          title="Move step up"
          transparent
          disabled={index === 0}
          onClick={() => index > 0 && moveStep(-1)}
        />
        <Button
          icon={iconDown}
          title="Move step down"
          transparent
          disabled={index === count - 1}
          onClick={() => index < count - 1 && moveStep(1)}
        />
        <Button
          icon={iconCopy}
          title="Clone step"
          transparent
          onClick={cloneStep}
        />
        <Button
          icon={iconDelete}
          title="Remove step"
          transparent
          onClick={removeStep}
        />
      </div>
      <ActionsEditor
        actions={step.actions}
        onChange={actions => changeStep({ actions })}
        revertable
        revertLabel="Revert at end of step"
        moveTargets={moveTargets}
        onMoveTo={moveAction}
      />
    </div>
  )
})

/**
 * Dialog content to edit a sequence.
 */
export function SequenceEditor({
  entry,
  onChange,
}: EntityEditorProps<'sequences'>) {
  const formState = useFormState(entry, { onChange })
  const { values, updateValue } = formState
  const { steps } = values

  const stepTimes = getSequenceStepTimes(values)
  const duration = getSequenceRunDuration(values)
  const repeatMode = getRepeatMode(values.repeat)

  const changeRepeatMode = (mode: RepeatMode) => {
    if (mode === repeatMode) return
    formState.changeValue(
      'repeat',
      mode === 'infinite' ? 'infinite' : mode === 'repeat' ? 1 : undefined
    )
  }

  const updateSteps: UpdateSteps = useCallback(
    updater => updateValue('steps', updater),
    [updateValue]
  )

  const stepLabels = useShallowEqualMemo(
    steps.map(
      (step, index) => `Step ${index + 1}${step.name ? `: ${step.name}` : ''}`
    )
  )
  const stepEntries = useMemo(
    () => stepLabels.map((label, index) => ({ value: index, label })),
    [stepLabels]
  )

  return (
    <div className={container}>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Sequence</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <Label
        label="At the end"
        input={
          <Select
            entries={repeatModeEntries}
            value={repeatMode}
            onChange={changeRepeatMode}
          />
        }
      />
      {repeatMode === 'repeat' && (
        <Label
          label="Repetitions"
          description={`Played ${(typeof values.repeat === 'number' ? values.repeat : 0) + 1} times overall`}
          input={
            <NumberInput
              value={typeof values.repeat === 'number' ? values.repeat : 1}
              onChange={value =>
                formState.changeValue('repeat', Math.max(1, value ?? 1))
              }
              min={1}
              step={1}
            />
          }
        />
      )}
      <Label
        label="Delay after last step (s)"
        description={`${
          repeatMode === 'stop'
            ? 'Time until the sequence ends and the last step is reverted.'
            : 'Time until the sequence is repeated.'
        } Leave empty to wait until it is triggered manually.`}
        input={
          <NumberInput
            value={values.endDelay}
            onChange={value =>
              formState.changeValue(
                'endDelay',
                value === undefined ? undefined : Math.max(0, value)
              )
            }
            placeholder="manual"
            min={0}
            step="any"
          />
        }
      />

      <div className={sectionHeader}>
        <h3>Timeline</h3>
        <span className={stepTime}>{formatSequenceTime(duration)} per run</span>
      </div>
      <SequenceTimeline sequence={values} state={undefined} />

      <div className={sectionHeader}>
        <h3>Steps</h3>
      </div>
      <div className={description}>
        Each step is executed after its delay relative to the previous step.
        Steps without delay wait until they are triggered manually. Reverted
        changes are restored at the end of the step or the run, and only for
        entities whose state was not changed in the meantime.
      </div>
      {steps.length === 0 && <div className={emptyHint}>No steps.</div>}
      {steps.map((step, index) => (
        <SequenceStepEditor
          key={index}
          step={step}
          index={index}
          count={steps.length}
          time={stepTimes[index]}
          stepEntries={stepEntries}
          updateSteps={updateSteps}
        />
      ))}
      <Button
        icon={iconAdd}
        onClick={() => updateSteps(steps => [...steps, createStep()])}
      >
        Add step
      </Button>
    </div>
  )
}
