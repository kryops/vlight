import { MemoryState } from '@vlight/entities'

export function mergeMemoryStates(
  state1: MemoryState | undefined,
  state2: Partial<MemoryState>
): MemoryState {
  return {
    on: false,
    value: 255,
    ...state1,
    ...state2,
  }
}
