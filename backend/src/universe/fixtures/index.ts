import { FixtureState } from '@vlight/entities'

import { addUniverse, createUniverse, setUniverseChannel, Universe } from '..'
import { fixtures, fixtureTypes } from '../../database'

import { mapFixtureStateToChannels } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<number, FixtureState> = new Map()

function getInitialFixtureState(): FixtureState {
  return {
    on: false,
    channels: {
      m: 255,
    },
  }
}

function updateUniverseForFixture(id: number): boolean {
  const state = fixtureStates.get(id) || getInitialFixtureState()
  const fixture = fixtures.get(id)
  if (!fixture) {
    return false
  }
  const fixtureType = fixtureTypes.get(fixture.type)
  if (!fixtureType) {
    return false
  }
  const channel = fixture.channel

  let changed = false

  mapFixtureStateToChannels(fixtureType, state).forEach((value, index) => {
    if (setUniverseChannel(fixtureUniverse, channel + index, value)) {
      changed = true
    }
  })

  return changed
}

export function initFixtures() {
  fixtureUniverse = createUniverse()

  for (const [id] of fixtures) {
    fixtureStates.set(id, getInitialFixtureState())
  }

  addUniverse(fixtureUniverse)
}

export function setFixtureState(id: number, state: FixtureState) {
  fixtureStates.set(id, state)
  return updateUniverseForFixture(id)
}
