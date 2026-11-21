import {
  Action,
  IdType,
  NamedAction,
  NamedActionsAction,
  ProgrammableButton,
  Sequence,
} from '@vlight/types'

import { editEntity } from '../../../api'
import { apiState } from '../../../api/api-state'

/** Action types that reference entities by ID. */
export type IdReferencingActionType = Extract<Action, { ids: IdType[] }>['type']

/**
 * Returns a copy of the action without references to other entities.
 *
 * Used for named actions, which are kept even if they do not affect anything any more,
 * as other entities may still reference them.
 */
function clearReferences(action: NamedAction): NamedAction {
  if ('ids' in action) return { ...action, ids: [] }
  if (action.type === 'fixture') return { ...action, members: [] }
  return action
}

/**
 * Updates the actions of all entities that contain actions
 * (programmable buttons, sequences, and named actions).
 *
 * @param mapAction returns the updated action, the same object if unchanged,
 *   or `null` to remove the action.
 *   Named actions are not removed, but only cleared of their references.
 */
export function updateActions(
  mapAction: (action: Action) => Action | null
): void {
  const {
    buttons = [],
    sequences = [],
    actions: namedActions = [],
  } = apiState.rawMasterData ?? {}

  let changed = false
  const mapActions = <T extends Action>(actions: T[]): T[] =>
    actions.flatMap(action => {
      const result = mapAction(action)
      if (result !== action) changed = true
      return result ? [result as T] : []
    })

  for (const button of buttons) {
    changed = false
    const newButton: ProgrammableButton = {
      ...button,
      down: mapActions(button.down),
      up: mapActions(button.up),
    }
    if (changed) editEntity('buttons', newButton)
  }

  for (const sequence of sequences) {
    changed = false
    const newSequence: Sequence = {
      ...sequence,
      steps: sequence.steps.map(step => ({
        ...step,
        actions: mapActions(step.actions),
      })),
    }
    if (changed) editEntity('sequences', newSequence)
  }

  for (const namedAction of namedActions) {
    const result = mapAction(namedAction)
    if (result === namedAction) continue
    const newNamedAction: NamedAction = result
      ? { ...result, id: namedAction.id, name: namedAction.name }
      : clearReferences(namedAction)
    editEntity('actions', newNamedAction)
  }
}

/**
 * Returns a function for {@link updateActions} that removes the given IDs
 * from all actions of the given type.
 *
 * Actions that do not reference any entities any more are removed.
 */
export function removeIdsFromAction(
  type: IdReferencingActionType,
  idsToRemove: IdType[]
): (action: Action) => Action | null {
  return action => {
    if (action.type !== type) return action
    const ids = action.ids ?? []
    if (!ids.some(id => idsToRemove.includes(id))) return action
    const newIds = ids.filter(id => !idsToRemove.includes(id))
    return newIds.length ? { ...action, ids: newIds } : null
  }
}

/**
 * Removes the given entity from the actions of all buttons, sequences, and named actions.
 *
 * Actions that do not reference any entities any more are removed.
 */
export function removeReferencesFromActions(
  type: IdReferencingActionType,
  id: IdType
): void {
  updateActions(removeIdsFromAction(type, [id]))
}

/** Returns an unused ID for a new named action. */
function getNewNamedActionId(): IdType {
  const ids = (apiState.rawMasterData?.actions ?? []).map(it => it.id)
  const highestNumber = Math.max(
    0,
    ...ids.filter(id => /^\d+$/.test(id)).map(id => parseInt(id))
  )
  return String(highestNumber + 1)
}

/**
 * Creates a new named action from the given inline action.
 *
 * Returns the action that replaces the inline action, triggering the new named action.
 * Properties controlled at the place of usage (i.e. `revert`) are kept there.
 */
export function convertToNamedAction<T extends Action & { revert?: boolean }>(
  action: T,
  name: string | undefined
): T {
  const { revert, ...rest } = action
  const id = getNewNamedActionId()
  editEntity(
    'actions',
    { id, name: name || undefined, ...structuredClone(rest as Action) },
    true
  )
  return {
    type: 'action',
    ids: [id],
    ...(revert !== undefined && { revert }),
  } as NamedActionsAction as T
}

/**
 * Returns copies of all named actions triggered by the given action,
 * to replace it with.
 *
 * Properties controlled at the place of usage (i.e. `revert`) are applied to all copies.
 */
export function inlineNamedActions<T extends Action & { revert?: boolean }>(
  action: NamedActionsAction & { revert?: boolean }
): T[] {
  const namedActions = apiState.rawMasterData?.actions ?? []
  return (action.ids ?? []).flatMap(id => {
    const namedAction = namedActions.find(it => it.id === id)
    if (!namedAction) return []
    const { id: _id, name: _name, ...rest } = structuredClone(namedAction)
    return [
      {
        ...rest,
        ...(action.revert !== undefined && { revert: action.revert }),
      } as T,
    ]
  })
}
