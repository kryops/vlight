import { css } from '@linaria/core'
import { useMemo } from 'react'
import { Action, ActionType } from '@vlight/types'
import { assertNever } from '@vlight/utils'

import { Button } from '../../../../../ui/buttons/button'
import { Checkbox } from '../../../../../ui/forms/checkbox'
import { Select, SelectEntry } from '../../../../../ui/forms/select'
import {
  iconAdd,
  iconDelete,
  iconDown,
  iconRevert,
  iconUp,
} from '../../../../../ui/icons'
import { Icon } from '../../../../../ui/icons/icon'
import { baseline, primaryShade } from '../../../../../ui/styles'

import { actionTypeNames, createAction } from './action-utils'
import {
  FixtureActionEditor,
  FixtureGroupActionEditor,
  LiveChaseActionEditor,
  LiveMemoryActionEditor,
  LiveMovementActionEditor,
  MemoryActionEditor,
} from './entity-action-editors'
import {
  ChannelsActionEditor,
  DmxMasterActionEditor,
  GlobalControlActionEditor,
  SequenceActionEditor,
  ButtonActionEditor,
} from './global-action-editors'

const actionContainer = css`
  padding: ${baseline(2)};
  margin: ${baseline(2)} 0;
  border: 1px solid ${primaryShade(1)};
`

const actionHeader = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${baseline(2)};
  margin-bottom: ${baseline(2)};
`

const actionIndex = css`
  font-weight: bold;
`

const typeSelect = css`
  flex: 0 1 auto;
`

const revertToggle = css`
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

const typeEntries: SelectEntry<ActionType>[] = Object.entries(actionTypeNames)
  .map(([value, label]) => ({ value: value as ActionType, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const noop = () => undefined

/** An action that can optionally be reverted. */
type RevertableAction = Action & { revert?: boolean }

function ActionContent({
  action,
  onChange,
}: {
  action: Action
  onChange: (action: Action) => void
}) {
  switch (action.type) {
    case 'fixture':
      return <FixtureActionEditor action={action} onChange={onChange} />
    case 'fixture-group':
      return <FixtureGroupActionEditor action={action} onChange={onChange} />
    case 'memory':
      return <MemoryActionEditor action={action} onChange={onChange} />
    case 'live-memory':
      return <LiveMemoryActionEditor action={action} onChange={onChange} />
    case 'live-chase':
      return <LiveChaseActionEditor action={action} onChange={onChange} />
    case 'live-movement':
      return <LiveMovementActionEditor action={action} onChange={onChange} />
    case 'channels':
      return <ChannelsActionEditor action={action} onChange={onChange} />
    case 'dmx-master':
      return <DmxMasterActionEditor action={action} onChange={onChange} />
    case 'global':
      return <GlobalControlActionEditor action={action} onChange={onChange} />
    case 'sequence':
      return <SequenceActionEditor action={action} onChange={onChange} />
    case 'button':
      return <ButtonActionEditor action={action} onChange={onChange} />
    default:
      assertNever(action)
      return null
  }
}

export interface ActionsEditorProps<T extends Action> {
  actions: T[]
  onChange: (actions: T[]) => void

  /**
   * If set, displays a toggle for each action to revert it
   * (see {@link ProgrammableButtonDownAction.revert}).
   *
   * Defaults to `false`.
   */
  revertable?: boolean

  /** Label for the button to add an action. */
  addLabel?: string

  /** Label for the revert toggle. */
  revertLabel?: string

  /**
   * If set, displays a select for each action to move it to one of the given targets,
   * e.g. another step of a sequence.
   */
  moveTargets?: SelectEntry<number>[]

  /** Called when an action is moved to one of the {@link moveTargets}. */
  onMoveTo?: (index: number, target: number) => void
}

/**
 * Editor for a list of actions.
 */
export function ActionsEditor<T extends RevertableAction>({
  actions,
  onChange,
  revertable = false,
  addLabel = 'Add action',
  revertLabel = 'Revert on release',
  moveTargets,
  onMoveTo,
}: ActionsEditorProps<T>) {
  const moveTargetEntries = useMemo<SelectEntry<number | undefined>[]>(
    () => [{ value: undefined, label: 'Move to...' }, ...(moveTargets ?? [])],
    [moveTargets]
  )

  const changeAction = (index: number, action: T) =>
    onChange(actions.map((it, i) => (i === index ? action : it)))

  const changeType = (index: number, type: ActionType) => {
    if (actions[index].type === type) return
    const newAction = createAction(type) as T
    if (actions[index].revert) newAction.revert = true
    changeAction(index, newAction)
  }

  const removeAction = (index: number) =>
    onChange(actions.filter((_, i) => i !== index))

  const moveAction = (index: number, offset: number) => {
    const newActions = [...actions]
    const [moved] = newActions.splice(index, 1)
    newActions.splice(index + offset, 0, moved)
    onChange(newActions)
  }

  const addAction = () => onChange([...actions, createAction('fixture') as T])

  return (
    <>
      {actions.length === 0 && <div className={emptyHint}>No actions.</div>}
      {actions.map((action, index) => {
        const toggleRevert = () =>
          changeAction(index, { ...action, revert: !action.revert })

        return (
          <div key={index} className={actionContainer}>
            <div className={actionHeader}>
              <span className={actionIndex}>{index + 1}.</span>
              <Select
                entries={typeEntries}
                value={action.type}
                onChange={type => changeType(index, type)}
                className={typeSelect}
              />
              {revertable && (
                <a
                  className={revertToggle}
                  onClick={toggleRevert}
                  title="Reverts the changes of this action (if the affected state was not changed in the meantime)"
                >
                  {/* the click is handled by the surrounding element */}
                  <Checkbox
                    value={!!action.revert}
                    onChange={noop}
                    inline
                  />{' '}
                  <Icon icon={iconRevert} inline shade={1} /> {revertLabel}
                </a>
              )}
              <div className={spacer} />
              {moveTargets && moveTargets.length > 0 && onMoveTo && (
                <Select
                  entries={moveTargetEntries}
                  value={undefined}
                  onChange={target =>
                    target !== undefined && onMoveTo(index, target)
                  }
                  className={typeSelect}
                />
              )}
              <Button
                icon={iconUp}
                title="Move up"
                transparent
                disabled={index === 0}
                onClick={() => index > 0 && moveAction(index, -1)}
              />
              <Button
                icon={iconDown}
                title="Move down"
                transparent
                disabled={index === actions.length - 1}
                onClick={() =>
                  index < actions.length - 1 && moveAction(index, 1)
                }
              />
              <Button
                icon={iconDelete}
                title="Remove action"
                transparent
                onClick={() => removeAction(index)}
              />
            </div>
            <ActionContent
              action={action}
              // the editors keep additional properties like `revert`
              onChange={newAction => changeAction(index, newAction as T)}
            />
          </div>
        )
      })}
      <Button icon={iconAdd} onClick={addAction}>
        {addLabel}
      </Button>
    </>
  )
}
