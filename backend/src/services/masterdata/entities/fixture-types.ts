import { registerMasterDataEntity } from '../registry'

export function init(): void {
  registerMasterDataEntity('fixtureTypes', {
    global: true,
  })
}
