import { getLiveChaseFixtureStates } from '@vlight/controls'
import { ApiLiveChaseMessage, IdType, LiveChase } from '@vlight/types'
import { logger, mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { masterData, masterDataMaps } from '../../services/masterdata'
import {
  addUniverse,
  createUniverse,
  overwriteUniverse,
  removeUniverse,
  Universe,
} from '../../services/universe'
import { controlRegistry } from '../registry'

export const liveChases: Map<IdType, LiveChase> = new Map()

export interface LiveChasePreparedState {
  fullUniverse: Universe
  computedTime: number
}

const preparedStates: Map<IdType, LiveChasePreparedState> = new Map()
const outgoingUniverses: Map<IdType, Universe> = new Map()
const intervals: Map<IdType, any> = new Map()

function prepareLiveChase(liveChase: LiveChase): LiveChasePreparedState {
  const fixtureStates = getLiveChaseFixtureStates(liveChase, {
    masterData,
    masterDataMaps,
  })

  return {
    fullUniverse: createUniverse(fixtureStates),
    computedTime: Date.now(),
  }
}

function recomputeLiveChase(id: IdType) {
  logger.debug('recomputing live chase', id)
  const liveChase = liveChases.get(id)
  if (!liveChase) return
  const universe = outgoingUniverses.get(id)!
  const preparedState = prepareLiveChase(liveChase)!
  preparedStates.set(id, preparedState)

  overwriteUniverse(universe, preparedState.fullUniverse)
}

function addInterval(id: IdType, liveChase: LiveChase) {
  // TODO execute immediately / set timeout for first run

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
    removeUniverse(universe)
    return true
  }

  // Only recompute chase here when it's new or turned on
  // otherwise we would flicker lots of colors when fading, changing speed or colors
  if (!existing?.on) recomputeLiveChase(id)
  addUniverse(universe, { masterValue: liveChase.value })

  if (liveChase.stopped) removeInterval(id)
  else if (
    !existing?.on ||
    existing?.stopped ||
    existing?.speed !== liveChase.speed
  ) {
    addInterval(id, liveChase)
  }

  return true
}

function reload(reloadState?: boolean) {
  if (!reloadState) return

  liveChases.clear()
  preparedStates.clear()
  ;[...outgoingUniverses.values()].forEach(removeUniverse)
  outgoingUniverses.clear()
  ;[...intervals.keys()].forEach(removeInterval)
}

export function initLiveChases(): void {
  controlRegistry.register({ reload })
  registerApiMessageHandler('live-chase', handleApiMessage)
}
