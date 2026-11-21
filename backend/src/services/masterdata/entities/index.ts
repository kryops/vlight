import * as dynamicPages from './dynamic-pages'
import * as fixtureGroups from './fixture-groups'
import * as fixtures from './fixtures'
import * as fixtureTypes from './fixture-types'
import * as memories from './memories'
import * as chaseColorPresets from './chase-color-presets'
import * as memorySceneStatePresets from './memory-scene-state-presets'
import * as buttons from './buttons'
import * as sequences from './sequences'
import * as actions from './actions'

export async function initMasterDataEntities(): Promise<void> {
  ;[
    dynamicPages,
    fixtureGroups,
    fixtures,
    fixtureTypes,
    memories,
    chaseColorPresets,
    memorySceneStatePresets,
    buttons,
    sequences,
    actions,
  ].forEach(entity => entity.init())
}
