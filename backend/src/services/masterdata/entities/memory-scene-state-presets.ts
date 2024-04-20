import { registerMasterDataEntity } from '../registry'

export function init(): void {
  registerMasterDataEntity('memorySceneStatePresets', {
    global: true,
  })
}
