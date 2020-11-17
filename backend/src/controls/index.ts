import { controlRegistry } from './registry'
import * as channels from './channels'
import * as fixtures from './fixtures'
import * as fixtureGroups from './fixture-groups'
import * as memories from './memories'
import * as chases from './chases'

export async function initControls(): Promise<void> {
  await Promise.all(
    [channels, fixtures, fixtureGroups, memories, chases].map(it => it.init())
  )
}

export function reloadControls(reloadState?: boolean): Promise<void> {
  return controlRegistry.runParallel(entry => entry.reload(reloadState))
}
