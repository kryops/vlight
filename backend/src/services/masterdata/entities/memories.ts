import { Memory } from '@vlight/entities'
import { mapFixtureList } from '@vlight/shared'

import { masterData, masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

function processMemory({ scenes, ...memoryRest }: Memory): Memory {
  return {
    ...memoryRest,
    scenes: scenes.map(({ members, ...sceneRest }) => ({
      ...sceneRest,
      members: mapFixtureList(members, { masterData, masterDataMaps }),
    })),
  }
}

function preprocessor(memories: Memory[]): Memory[] {
  return memories.map(processMemory)
}

// only for unit test
export const processMemories = preprocessor

export function init(): void {
  registerMasterDataEntity('memories', {
    preprocessor,
    dependencies: ['fixtures', 'fixtureTypes', 'fixtureGroups'],
  })
}
