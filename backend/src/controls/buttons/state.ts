import { IdType } from '@vlight/types'

/**
 * Active state of all buttons, i.e.
 * - pressed in `flash` mode
 * - toggled on in `toggle` mode
 *
 * Inactive buttons may be missing.
 *
 * Kept separate from the button control logic so it can be accessed
 * by the action adapters without circular imports.
 */
export const buttonStates = new Map<IdType, boolean>()
