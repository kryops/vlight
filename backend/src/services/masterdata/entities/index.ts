import * as dynamicPages from './dynamic-pages'
import * as fixtureGroups from './fixture-groups'
import * as fixtures from './fixtures'
import * as memories from './memories'

export async function initMasterDataEntities() {
  ;[dynamicPages, fixtureGroups, fixtures, memories].forEach(entity =>
    entity.init()
  )
}
