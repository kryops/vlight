import { registerMasterDataEntity } from '../registry'

export function init(): void {
  registerMasterDataEntity('chaseColorPresets', {
    global: true,
  })
}
