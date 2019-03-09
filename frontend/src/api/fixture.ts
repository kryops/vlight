import { FixtureState } from '@vlight/entities'

export function updateFixtureState(
  oldState: FixtureState,
  newState: Partial<FixtureState>
): FixtureState {
  return {
    ...oldState,
    ...newState,
    channels: {
      ...oldState.channels,
      ...newState.channels,
    },
  }
}
