import { css } from '@linaria/core'
import { mergeObjects } from '@vlight/utils'
import { ReactNode } from 'react'

import { TwoColumDialogContainer } from '../../../../../ui/containers/two-column-dialog'
import { CheckboxLabel } from '../../../../../ui/forms/checkbox'
import { NumberInput } from '../../../../../ui/forms/typed-input'
import { baseline } from '../../../../../ui/styles'

import { applyStateChange } from './action-utils'
import { StateChangesList } from './state-changes-list'

const partialToggle = css`
  display: inline-block;
  margin-bottom: ${baseline(2)};
  cursor: pointer;
`

const optionToggle = css`
  display: inline-block;
  margin: 0 0 ${baseline(2)} ${baseline(4)};
  cursor: pointer;
`

/**
 * Toggle for an additional boolean option of an action.
 */
export function ActionOptionToggle({
  value,
  onChange,
  label,
  title,
}: {
  value: boolean
  onChange: (value: boolean) => void
  label: string
  title?: string
}) {
  return (
    <CheckboxLabel
      className={optionToggle}
      value={value}
      onChange={onChange}
      title={title}
    >
      {label}
    </CheckboxLabel>
  )
}

const fadeOptions = css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(2)};
  margin: 0 0 ${baseline(2)} ${baseline(4)};
`

const fadeOption = css`
  display: inline-flex;
  align-items: center;
  gap: ${baseline(1)};
  white-space: nowrap;
`

const fadeInput = css`
  width: ${baseline(16)};
`

export interface FadeOptions {
  fade?: number
  revertFade?: number
}

/**
 * Inputs for the fade times of an action whose changes can be faded.
 */
export function ActionFadeOptions({
  value,
  onChange,
}: {
  value: FadeOptions
  onChange: (value: FadeOptions) => void
}) {
  const change = (key: keyof FadeOptions, newValue: number | undefined) =>
    onChange({
      fade: value.fade,
      revertFade: value.revertFade,
      [key]: newValue === undefined || newValue < 0 ? undefined : newValue,
    })

  return (
    <span className={fadeOptions}>
      <label
        className={fadeOption}
        title="Fade time in seconds. Memories and live chases only fade turning on/off and their value, everything else fades all changes."
      >
        Fade
        <NumberInput
          value={value.fade}
          onChange={newValue => change('fade', newValue)}
          min={0}
          step={0.1}
          placeholder="0"
          className={fadeInput}
        />
        s
      </label>
      <label
        className={fadeOption}
        title="Fade time in seconds when the changes are reverted. Defaults to the fade time."
      >
        Revert fade
        <NumberInput
          value={value.revertFade}
          onChange={newValue => change('revertFade', newValue)}
          min={0}
          step={0.1}
          placeholder={String(value.fade ?? 0)}
          className={fadeInput}
        />
        s
      </label>
    </span>
  )
}

const hint = css`
  opacity: 0.6;
  font-style: italic;
  padding: ${baseline(2)} 0;
`

const widgetContainer = css`
  display: flex;
  margin: 0 ${baseline(-1)};
`

export interface EntityStateActionEditorProps<T extends object> {
  /** The (partial) state of the action. */
  state: Partial<T>

  /** Whether the action is in partial mode. */
  partial: boolean

  /**
   * The current state of the selected entities, which is used
   * - as base to display in partial mode
   * - as initial state when switching to non-partial mode
   *
   * `undefined` if no entity is selected.
   */
  currentState: T | undefined

  onChange: (state: Partial<T>, partial: boolean) => void

  /** Input to select the affected entities. */
  selection: ReactNode

  /** Additional options to display next to the partial toggle. */
  options?: ReactNode

  /**
   * Default state to display in non-partial mode.
   *
   * If not set, the {@link currentState} is used.
   */
  fullModeDefaults?: T

  /**
   * Keys of the {@link currentState} that should not be copied into the action's state
   * when switching to non-partial mode.
   */
  ignoredKeys?: string[]

  /** Renders the widget to edit the state. */
  renderWidget: (
    displayedState: T,
    change: (change: Partial<T>) => void
  ) => ReactNode
}

/**
 * Generic editor for actions that change the state of one or multiple entities.
 *
 * Displays
 * - an input to select the entities
 * - a toggle for the partial mode
 * - a widget to edit the state
 * - in partial mode, a list of all changes that can be removed individually
 */
export function EntityStateActionEditor<T extends object>({
  state,
  partial,
  currentState,
  onChange,
  selection,
  options,
  fullModeDefaults,
  ignoredKeys = [],
  renderWidget,
}: EntityStateActionEditorProps<T>) {
  const baseState = partial ? currentState : (fullModeDefaults ?? currentState)
  const displayedState = baseState
    ? mergeObjects(baseState, state as Record<string, any>)
    : undefined

  const change = (newChange: Partial<T>) =>
    onChange(
      applyStateChange({
        state,
        displayedState,
        change: newChange,
        partial,
      }),
      partial
    )

  const togglePartial = () => {
    if (partial) {
      // In non-partial mode, the state should be complete
      const fullState = Object.fromEntries(
        Object.entries(
          mergeObjects(currentState ?? {}, state as Record<string, any>)
        ).filter(([key]) => !ignoredKeys.includes(key))
      ) as Partial<T>
      onChange(fullState, false)
    } else {
      onChange(state, true)
    }
  }

  return (
    <TwoColumDialogContainer
      left={selection}
      right={
        <>
          <CheckboxLabel
            className={partialToggle}
            value={partial}
            onChange={togglePartial}
            title="In partial mode, only the listed changes are applied, and everything else is left as-is. Otherwise, the complete state is applied."
          >
            Partial: Only apply changes
          </CheckboxLabel>
          {options}
          {displayedState ? (
            <div className={widgetContainer}>
              {renderWidget(displayedState, change)}
            </div>
          ) : (
            <div className={hint}>Select entities to edit the state.</div>
          )}
          {partial && (
            <StateChangesList
              state={state}
              onChange={newState => onChange(newState, partial)}
            />
          )}
        </>
      }
      fullWidth
      preferSingleRow
    />
  )
}
