import { ApiPauseMessage } from '@vlight/types'
import { logger } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { getPersistedState } from '../../services/state'
import { controlRegistry } from '../registry'

/** Handler that is called when the global pause state changes. */
export type PauseHandler = (paused: boolean) => void

let paused = false

const pauseHandlers: PauseHandler[] = []

/**
 * Returns whether all continuously recomputing controls are globally paused.
 */
export function isPaused(): boolean {
  return paused
}

/**
 * Registers a handler that is called when the global pause state changes.
 */
export function registerPauseHandler(handler: PauseHandler): void {
  pauseHandlers.push(handler)
}

function setPaused(newPaused: boolean): boolean {
  if (paused === newPaused) return false

  logger.debug(newPaused ? 'pausing' : 'resuming')

  paused = newPaused
  pauseHandlers.forEach(handler => handler(newPaused))

  return true
}

function handleApiMessage(message: ApiPauseMessage): boolean {
  return setPaused(message.paused)
}

function reload(reloadState?: boolean) {
  if (reloadState) setPaused(getPersistedState().paused)
}

/**
 * Initializes the global pause state.
 *
 * Must be called before initializing the other controls, as they depend on it.
 */
export function init(): void {
  paused = getPersistedState().paused

  controlRegistry.register({ reload })
  registerApiMessageHandler('pause', handleApiMessage)
}
