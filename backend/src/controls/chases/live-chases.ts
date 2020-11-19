import {
  getLiveChaseFixtureStates,
  mapFixtureStateToChannels,
} from '@vlight/controls'
import { ApiLiveChaseMessage, IdType, LiveChase } from '@vlight/types'
import { logger, mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import {
  addUniverse,
  createUniverse,
  getUniverseIndex,
  mergeUniverse,
  removeUniverse,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'

export const liveChases: Map<IdType, LiveChase> = new Map()

const outgoingUniverses: Map<IdType, Universe> = new Map()
const intervals: Map<IdType, any> = new Map()

function getUniverseForLiveChase(liveChase: LiveChase): Universe | null {
  if (!liveChase.on) return null

  const universe = createUniverse()

  const fixtureStates = getLiveChaseFixtureStates(liveChase, {
    masterData,
    masterDataMaps,
  })

  Object.entries(fixtureStates).forEach(([fixtureId, state]) => {
    const fixture = masterDataMaps.fixtures.get(fixtureId)
    if (!fixture) return
    const { channel } = fixture
    const fixtureType = masterDataMaps.fixtureTypes.get(fixture.type)!

    mapFixtureStateToChannels(fixtureType, state).forEach((value, offset) => {
      const universeIndex = getUniverseIndex(channel) + offset
      if (universe[universeIndex] < value) {
        universe[universeIndex] = value
      }
    })
  })

  return universe
}

function recomputeLiveChase(id: IdType) {
  logger.debug('recomputing live chase', id)
  const liveChase = liveChases.get(id)
  if (!liveChase) return
  const universe = outgoingUniverses.get(id)!
  const newUniverse = getUniverseForLiveChase(liveChase)!

  mergeUniverse(universe, newUniverse)
}

function addInterval(id: IdType, liveChase: LiveChase) {
  const interval = setInterval(
    () => recomputeLiveChase(id),
    // max speed: 25 fps
    Math.max(liveChase.speed * 1000, 40)
  )

  const existing = intervals.get(id)
  if (existing) clearInterval(existing)

  intervals.set(id, interval)
}

function removeInterval(id: IdType) {
  const existing = intervals.get(id)
  if (!existing) return
  clearInterval(existing)
  intervals.delete(id)
}

function handleApiMessage(message: ApiLiveChaseMessage): boolean {
  const id = message.id

  const existing = liveChases.get(id)

  const liveChase = message.merge
    ? mergeObjects(existing, message.state)
    : (message.state as LiveChase)

  liveChases.set(id, liveChase)

  if (!existing) outgoingUniverses.set(id, createUniverse())
  const universe = outgoingUniverses.get(id)!

  if (!liveChase.on) {
    removeInterval(id)
    if (existing?.on) removeUniverse(universe)
    return true
  }

  // Only recompute chase here when it's new - otherwise we would flicker lots of colors when fading / changing speed
  // TODO deep equal? => recompute when colors change
  // TODO apply master/value later (without recomputing) => persist current fixture states?
  if (!existing) recomputeLiveChase(id)
  if (!existing?.on) addUniverse(outgoingUniverses.get(id)!)

  if (liveChase.stopped) removeInterval(id)
  else if (
    !existing?.on ||
    existing?.stopped ||
    existing?.speed !== liveChase.speed
  )
    addInterval(id, liveChase)

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveChases.clear()
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()
  ;[...intervals.keys()].forEach(removeInterval)
}

export function initLiveChases(): void {
  controlRegistry.register({ reload })
  registerApiMessageHandler('live-chase', handleApiMessage)
}
