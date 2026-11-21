import { css } from '@linaria/core'
import { mergeObjects } from '@vlight/utils'
import { ReactNode } from 'react'

import { TwoColumDialogContainer } from '../../../../../ui/containers/two-column-dialog'
import { Checkbox } from '../../../../../ui/forms/checkbox'
import { baseline } from '../../../../../ui/styles'

import { applyStateChange } from './action-utils'
import { StateChangesList } from './state-changes-list'

const noop = () => undefined

const partialToggle = css`
  display: inline-block;
  margin-bottom: ${baseline(2)};
  cursor: pointer;
`

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
          <a
            className={partialToggle}
            onClick={togglePartial}
            title="In partial mode, only the listed changes are applied, and everything else is left as-is. Otherwise, the complete state is applied."
          >
            {/* the click is handled by the surrounding element */}
            <Checkbox value={partial} onChange={noop} inline /> Partial: Only
            apply changes
          </a>
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
