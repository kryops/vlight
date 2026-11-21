import { ApiButtonMessage, IdType, ProgrammableButton } from '@vlight/types'
import { logger } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { broadcastToSockets } from '../../services/http/websocket'
import { masterDataMaps } from '../../services/masterdata'
import { howLong } from '../../util/time'
import { applyAction, revertStateChanges, StateChange } from '../actions'
import { controlRegistry } from '../registry'

import { buttonStates } from './state'

/**
 * Changes of the down actions of active buttons that are reverted
 * when the button is deactivated.
 */
const pendingReverts = new Map<IdType, StateChange[]>()

/**
 * IDs of the buttons whose actions are currently being executed.
 *
 * Used to prevent endless recursion through button actions.
 */
const executingButtons = new Set<IdType>()

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

  if (executingButtons.has(id)) {
    logger.warn(
      'Button cannot be pressed or released by its own actions, skipping',
      id
    )
    return false
  }

  executingButtons.add(id)
  try {
    handleButton(button, down)
  } finally {
    executingButtons.delete(id)
  }

  // the incoming message is not broadcast; state changes are broadcast separately
  return false
}

function handleButton(button: ProgrammableButton, down: boolean) {
  const { id } = button

  if ((button.mode ?? 'flash') === 'toggle') {
    if (!down) return
    if (buttonStates.get(id)) deactivate(button)
    else activate(button)
  } else if (down) {
    activate(button)
  } else {
    deactivate(button)
  }
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
