import { FixtureState, FixtureType, IdType } from '@vlight/entities'

import { addUniverse, createUniverse, setUniverseChannel, Universe } from '..'

import { fixtures, fixtureTypes } from '../../database'
import { logWarn } from '../../util/log'

import { ChannelMapping, mapFixtureStateToChannels } from './mapping'

let fixtureUniverse: Universe

export const fixtureStates: Map<IdType, FixtureState> = new Map()

function getInitialFixtureState(fixtureType?: FixtureType): FixtureState {
  const colors = [ChannelMapping.red, ChannelMapping.green, ChannelMapping.blue]
  if (fixtureType && colors.every(c => fixtureType.mapping.includes(c))) {
    return {
      on: false,
      channels: {
        m: 255,
        r: 255,
        g: 255,
        b: 255,
      },
    }
  }
  return {
    on: false,
    channels: {
      m: 255,
    },
  }
}

function updateUniverseForFixture(id: IdType): boolean {
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
  const state = fixtureStates.get(id) || getInitialFixtureState(fixtureType)
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

  for (const [id, { type }] of fixtures) {
    fixtureStates.set(id, getInitialFixtureState(fixtureTypes.get(type)))
  }

  addUniverse(fixtureUniverse)
}

export function setFixtureState(id: IdType, state: FixtureState): boolean {
  fixtureStates.set(id, state)
  updateUniverseForFixture(id)
  return true
}
