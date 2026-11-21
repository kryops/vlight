import { controlRegistry } from './registry'
import * as channels from './channels'
import * as fixtures from './fixtures'
import * as fixtureGroups from './fixture-groups'
import * as memories from './memories'
import * as chases from './chases'
import * as movements from './movements'
import * as pause from './pause'
import * as buttons from './buttons'
import * as sequences from './sequences'

/**
 * Initializes all controls in parallel.
 */
export async function initControls(): Promise<void> {
  // the other controls depend on the pause state
  pause.init()

  await Promise.all(
    [
      channels,
      fixtures,
      fixtureGroups,
      memories,
      chases,
      movements,
      buttons,
      sequences,
    ].map(async it => it.init())
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
