import { Action, IdType, ProgrammableButton } from '@vlight/types'

import { editEntity } from '../../../api'
import { apiState } from '../../../api/api-state'

/** Action types that reference entities by ID. */
export type IdReferencingActionType = Extract<Action, { ids: IdType[] }>['type']

/**
 * Updates the actions of all buttons.
 *
 * @param mapAction returns the updated action, the same object if unchanged,
 *   or `null` to remove the action.
 */
export function updateButtonActions(
  mapAction: (action: Action) => Action | null
): void {
  const buttons = apiState.rawMasterData?.buttons ?? []

  for (const button of buttons) {
    let changed = false
    const mapActions = <T extends Action>(actions: T[]): T[] =>
      actions.flatMap(action => {
        const result = mapAction(action)
        if (result !== action) changed = true
        return result ? [result as T] : []
      })

    const newButton: ProgrammableButton = {
      ...button,
      down: mapActions(button.down),
      up: mapActions(button.up),
    }
    if (changed) editEntity('buttons', newButton)
  }
}

/**
 * Returns a function for {@link updateButtonActions} that removes the given IDs
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
 * Removes the given entity from the actions of all buttons.
 *
 * Actions that do not reference any entities any more are removed.
 */
export function removeReferencesFromButtons(
  type: IdReferencingActionType,
  id: IdType
): void {
  updateButtonActions(removeIdsFromAction(type, [id]))
}
