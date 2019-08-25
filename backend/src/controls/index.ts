import { initChannels } from './channels'
import { initFixtures, reloadFixtures } from './fixtures'
import { initFixtureGroups, reloadFixtureGroups } from './fixture-groups'

export async function initControls() {
  await Promise.all([initChannels(), initFixtures(), initFixtureGroups()])
}

export function reloadControls() {
  reloadFixtures()
  reloadFixtureGroups()
}
