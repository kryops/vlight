import { controlRegistry } from './registry'
import * as channels from './channels'
import * as fixtures from './fixtures'
import * as fixtureGroups from './fixture-groups'
import * as memories from './memories'

export async function initControls(): Promise<void> {
  await Promise.all(
    [channels, fixtures, fixtureGroups, memories].map(it => it.init())
  )
}

export function reloadControls(): Promise<void> {
  return controlRegistry.runParallel(entry => entry.reload())
}
