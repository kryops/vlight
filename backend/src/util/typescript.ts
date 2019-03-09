import { logError } from './log'

/**
 * This is a typescript guard to fail compilation when not all cases
 * in a switch statement are handled.
 *
 * Helpful for making sure that API/protocol extensions are handled correctly.
 */
export function assertNever(arg: never) {
  logError('Expected to never see this', arg)
}
