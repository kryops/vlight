import { IdType, SequenceState } from '@vlight/types'

/**
 * Runtime state of all started (running or paused) sequences.
 *
 * Stopped sequences are missing.
 *
 * Kept separate from the sequence control logic so it can be accessed
 * by the action adapters without circular imports.
 */
export const sequenceStates = new Map<IdType, SequenceState>()
