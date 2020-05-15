import { registerMasterDataEntity } from '../registry'

export function init() {
  registerMasterDataEntity('fixtureTypes', {
    global: true,
  })
}
