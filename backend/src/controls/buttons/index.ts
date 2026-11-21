import { ApiButtonMessage, IdType, ProgrammableButton } from '@vlight/types'
import { logger } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { broadcastToSockets } from '../../services/http/websocket'
import { masterDataMaps } from '../../services/masterdata'
import { howLong } from '../../util/time'
import { applyAction, revertStateChanges, StateChange } from '../actions'
import { controlRegistry } from '../registry'

/**
 * Active state of all buttons, i.e.
 * - pressed in `flash` mode
 * - toggled on in `toggle` mode
 *
 * Inactive buttons may be missing.
 */
export const buttonStates = new Map<IdType, boolean>()

/**
 * Changes of the down actions of active buttons that are reverted
 * when the button is deactivated.
 */
const pendingReverts = new Map<IdType, StateChange[]>()

function setActive(id: IdType, active: boolean) {
  if (!!buttonStates.get(id) === active) return
  if (active) buttonStates.set(id, true)
  else buttonStates.delete(id)
  broadcastToSockets({ type: 'button-state', id, active })
}

function activate(button: ProgrammableButton) {
  const { id } = button

  // If the button is pressed again before being released (e.g. from multiple clients),
  // we keep the existing changes so the original state is restored in the end
  const changesToRevert = pendingReverts.get(id) ?? []

  for (const action of button.down) {
    const changes = applyAction(action)
    if (action.revert) changesToRevert.push(...changes)
  }

  if (changesToRevert.length) pendingReverts.set(id, changesToRevert)
  setActive(id, true)
}

function deactivate(button: ProgrammableButton) {
  const { id } = button

  const changesToRevert = pendingReverts.get(id)
  pendingReverts.delete(id)
  if (changesToRevert) revertStateChanges(changesToRevert)

  for (const action of button.up) {
    applyAction(action)
  }

  setActive(id, false)
}

function handleApiMessage({ id, down }: ApiButtonMessage): boolean {
  const button = masterDataMaps.buttons.get(id)
  if (!button) {
    logger.warn('no button found for ID', id)
    return false
  }

  if ((button.mode ?? 'flash') === 'toggle') {
    if (!down) return false
    if (buttonStates.get(id)) deactivate(button)
    else activate(button)
  } else if (down) {
    activate(button)
  } else {
    deactivate(button)
  }

  // the incoming message is not broadcast; state changes are broadcast separately
  return false
}

function reload(reloadState?: boolean) {
  if (reloadState) {
    buttonStates.clear()
    pendingReverts.clear()
    return
  }

  // master data changed: forget the state of deleted buttons
  for (const id of [...buttonStates.keys(), ...pendingReverts.keys()]) {
    if (!masterDataMaps.buttons.has(id)) {
      buttonStates.delete(id)
      pendingReverts.delete(id)
    }
  }
}

export function init(): void {
  const start = Date.now()

  controlRegistry.register({ reload })
  registerApiMessageHandler('button', handleApiMessage)

  howLong(start, 'initButtons')
}
