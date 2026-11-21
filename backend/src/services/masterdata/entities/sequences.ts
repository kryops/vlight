import { Sequence } from '@vlight/types'

import { registerMasterDataEntity } from '../registry'

/**
 * Ensures that the steps and their action lists exist.
 *
 * Missing delays are kept, as they mark manual steps.
 */
function migrateSequences(sequences: Sequence[]): Sequence[] {
  return sequences.map(sequence => ({
    ...sequence,
    steps: (sequence.steps ?? []).map(step => ({
      ...step,
      actions: step.actions ?? [],
    })),
  }))
}

// only for unit test
export const processSequences = migrateSequences

export function init(): void {
  registerMasterDataEntity('sequences', {
    migration: migrateSequences,
  })
}
