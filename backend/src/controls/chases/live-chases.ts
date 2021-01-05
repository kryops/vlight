import { getLiveChaseFixtureStates } from '@vlight/controls'
import { ApiLiveChaseMessage, IdType, LiveChase } from '@vlight/types'
import { logger, mergeObjects } from '@vlight/utils'

import { registerApiMessageHandler } from '../../services/api/registry'
import { isDevelopment } from '../../services/env'
import { masterData, masterDataMaps } from '../../services/masterdata'
import {
  addUniverse,
  createUniverse,
  fadeUniverse,
  overwriteUniverse,
  removeUniverse,
  stopFading,
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
const timeouts: Map<IdType, any> = new Map()

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

  if (liveChase.fade) {
    fadeUniverse(universe, preparedState.fullUniverse, liveChase.fade * 1000)
  } else {
    stopFading(universe)
    overwriteUniverse(universe, preparedState.fullUniverse)
  }
}

function addInterval(id: IdType, liveChase: LiveChase) {
  removeInterval(id)

  const execute = () => {
    timeouts.delete(id)
    recomputeLiveChase(id)

    const interval = setInterval(
      () => recomputeLiveChase(id),
      // max speed: 25 fps
      Math.max(liveChase.speed * 1000, 40)
    )

    intervals.set(id, interval)
  }

  const lastExecution = preparedStates.get(id)?.computedTime ?? Date.now()
  const nextExecution = lastExecution + liveChase.speed * 1000
  const timeToNextExecution = nextExecution - Date.now()
  if (timeToNextExecution < 0) execute()
  else timeouts.set(id, setTimeout(execute, timeToNextExecution))
}

function removeInterval(id: IdType) {
  const existingInterval = intervals.get(id)
  if (existingInterval) clearInterval(existingInterval)
  intervals.delete(id)

  const existingTimeout = timeouts.get(id)
  if (existingTimeout) clearTimeout(existingTimeout)
  timeouts.delete(id)
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
    stopFading(universe)
    return true
  }

  // Only recompute chase here when it's new or turned on
  // otherwise we would flicker lots of colors when fading, changing speed or colors
  if (!existing?.on || message.step) recomputeLiveChase(id)
  addUniverse(universe, { masterValue: liveChase.value })

  if (liveChase.stopped) {
    removeInterval(id)
    stopFading(universe)
  } else if (
    !existing?.on ||
    existing?.stopped ||
    existing?.speed !== liveChase.speed ||
    message.step
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

  // TODO remove
  if (isDevelopment) {
    handleApiMessage({
      type: 'live-chase',
      id: '1',
      state: {
        on: false,
        members: ['all:3x12', 'all:12x12'],
        speed: 1,
        // fade: 0.5,
        colors: [
          {
            channels: {
              m: 255,
              r: 255,
            },
          },
        ],
        light: { from: 0.3, to: 0.7 },
        value: 255,
      },
    })
  }
}
