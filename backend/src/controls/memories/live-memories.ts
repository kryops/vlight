import {
  ChannelMapping,
  getFixtureStateForMemoryScene,
  mapFixtureList,
  mapFixtureStateToChannels,
} from '@vlight/controls'
import { ApiLiveMemoryMessage, IdType, LiveMemory } from '@vlight/types'
import { mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import {
  addUniverse,
  createUniverse,
  getChannelFromUniverseIndex,
  getUniverseIndex,
  removeUniverse,
  setUniverseChannel,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'

export const liveMemories: Map<IdType, LiveMemory> = new Map()

const outgoingUniverses: Map<IdType, Universe> = new Map()

function getUniverseForLiveMemory(liveMemory: LiveMemory): Universe | null {
  if (!liveMemory.on) return null

  const universe = createUniverse()

  mapFixtureList(liveMemory.members, { masterData, masterDataMaps }).forEach(
    (member, memberIndex, members) => {
      const fixture = masterDataMaps.fixtures.get(member)
      if (!fixture) return
      const { channel } = fixture
      const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)!

      const state = getFixtureStateForMemoryScene(
        liveMemory,
        memberIndex,
        members
      )

      if (!state) return

      const originalMaster = state.channels[ChannelMapping.Master] ?? 255
      const masterValue = (originalMaster * liveMemory.value) / 255

      const finalState =
        liveMemory.value === 255
          ? state
          : {
              on: state.on,
              channels: {
                ...state.channels,
                [ChannelMapping.Master]: masterValue,
              },
            }

      mapFixtureStateToChannels(fixtureType, finalState).forEach(
        (value, offset) => {
          const universeIndex = getUniverseIndex(channel) + offset
          if (universe[universeIndex] < value) {
            universe[universeIndex] = value
          }
        }
      )
    }
  )

  return universe
}

function handleApiMessage(message: ApiLiveMemoryMessage) {
  const id = message.id

  const existing = liveMemories.get(id)

  const liveMemory = message.merge
    ? mergeObjects(existing, message.state)
    : (message.state as LiveMemory)

  liveMemories.set(id, liveMemory)

  const newUniverse = getUniverseForLiveMemory(liveMemory)

  if (!existing) outgoingUniverses.set(id, newUniverse ?? createUniverse())
  const universe = outgoingUniverses.get(id)!

  if (existing && newUniverse) {
    universe.forEach((value, index) => {
      const newValue = newUniverse[index]
      if (newValue !== value) {
        setUniverseChannel(
          universe,
          getChannelFromUniverseIndex(index),
          newValue
        )
      }
    })
  }

  if (!existing?.on && liveMemory.on) addUniverse(universe)
  else if (existing?.on && !liveMemory.on) removeUniverse(universe)

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveMemories.clear()
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()
}

export function initLiveMemories(): void {
  controlRegistry.register({ reload })
  registerApiMessageHandler('live-memory', handleApiMessage)
}
