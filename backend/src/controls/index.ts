import { initChannels, reloadChannels } from './channels'
import { initFixtures, reloadFixtures } from './fixtures'
import { initFixtureGroups, reloadFixtureGroups } from './fixture-groups'
import { initMemories, reloadMemories } from './memories'

export async function initControls() {
  await Promise.all([
    initChannels(),
    initFixtures(),
    initFixtureGroups(),
    initMemories(),
  ])
}

export function reloadControls() {
  reloadChannels()
  reloadFixtures()
  reloadFixtureGroups()
  reloadMemories()
}
