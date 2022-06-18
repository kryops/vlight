import { controlRegistry } from './registry'
import * as channels from './channels'
import * as fixtures from './fixtures'
import * as fixtureGroups from './fixture-groups'
import * as memories from './memories'
import * as chases from './chases'

/**
 * Initializes all controls in parallel.
 */
export async function initControls(): Promise<void> {
  await Promise.all(
    [channels, fixtures, fixtureGroups, memories, chases].map(it => it.init())
  )
}

/**
 * Reloads all controls in parallel.
 * Usually called after master data changes.
 *
 * @param reloadState - if set, the controls should also reload their state from the
 *   persisted one, which may have been reset.
 */
export function reloadControls(reloadState?: boolean): Promise<void> {
  return controlRegistry.runParallel(entry => entry.reload(reloadState))
}
