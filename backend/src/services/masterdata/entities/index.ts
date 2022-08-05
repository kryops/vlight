import * as dynamicPages from './dynamic-pages'
import * as fixtureGroups from './fixture-groups'
import * as fixtures from './fixtures'
import * as fixtureTypes from './fixture-types'
import * as memories from './memories'
import * as chaseColorPresets from './chase-color-presets'

export async function initMasterDataEntities(): Promise<void> {
  ;[
    dynamicPages,
    fixtureGroups,
    fixtures,
    fixtureTypes,
    memories,
    chaseColorPresets,
  ].forEach(entity => entity.init())
}
