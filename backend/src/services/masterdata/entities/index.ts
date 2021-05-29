import * as dynamicPages from './dynamic-pages'
import * as fixtureGroups from './fixture-groups'
import * as fixtures from './fixtures'
import * as fixtureTypes from './fixture-types'
import * as memories from './memories'

export async function initMasterDataEntities(): Promise<void> {
  ;[dynamicPages, fixtureGroups, fixtures, fixtureTypes, memories].forEach(
    entity => entity.init()
  )
}
