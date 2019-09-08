import { Memory } from '@vlight/entities'

import { mapFixtureList } from './fixtures'

function processMemory({ scenes, ...memoryRest }: Memory): Memory {
  return {
    ...memoryRest,
    scenes: scenes.map(({ members, ...sceneRest }) => ({
      ...sceneRest,
      members: mapFixtureList(members),
    })),
  }
}

export function processMemories(memories: Memory[]): Memory[] {
  return memories.map(processMemory)
}
