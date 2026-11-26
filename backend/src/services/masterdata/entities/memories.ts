import { Memory } from '@vlight/types'
import { mapFixtureMemberList } from '@vlight/controls'

import { masterData, masterDataMaps } from '../data'
import { registerMasterDataEntity } from '../registry'

/**
 * Resolves the memory's members of each scene to an actual fixture/segment list.
 */
function processMemory({ scenes, ...memoryRest }: Memory): Memory {
  return {
    ...memoryRest,
    scenes: scenes.map(({ members, ...sceneRest }) => ({
      ...sceneRest,
      members: mapFixtureMemberList(members, { masterData, masterDataMaps }),
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
