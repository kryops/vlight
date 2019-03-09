import { FixtureState, IdType } from '@vlight/entities'

import { addUniverse, createUniverse, setUniverseChannel, Universe } from '..'
import { fixtures, fixtureTypes } from '../../database'
import { logWarn } from '../../util/log'

import { mapFixtureStateToChannels } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<IdType, FixtureState> = new Map()

function getInitialFixtureState(): FixtureState {
  return {
    on: false,
    channels: {
      m: 255,
    },
  }
}

function updateUniverseForFixture(id: IdType): boolean {
  const state = fixtureStates.get(id) || getInitialFixtureState()
  const fixture = fixtures.get(id)
  if (!fixture) {
    logWarn('no fixture found for ID', id)
    return false
  }
  const fixtureType = fixtureTypes.get(fixture.type)
  if (!fixtureType) {
    logWarn('no fixtureType found for', fixture)
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

export function setFixtureState(id: IdType, state: FixtureState) {
  fixtureStates.set(id, state)
  return updateUniverseForFixture(id)
}
