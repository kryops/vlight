import { logger } from '@vlight/utils'

import { setUniverseChannel } from './computing'
import { Universe } from './types'
import {
  cloneUniverse,
  getDifferentChannels,
  overwriteUniverse,
} from './universe-functions'
import { getUniverseIndex } from './utils'

const fadeIntervalTime = 20 // 50 fps

const fadeHandlers = new Map<Universe, (now: number) => void>()

let fadeInterval: any = null

function processFadeHandlers() {
  const now = Date.now()
  for (const handler of fadeHandlers.values()) {
    handler(now)
  }
}

function refreshFadeInterval() {
  if (fadeInterval === null && fadeHandlers.size) {
    logger.debug('Started fading')
    fadeInterval = setInterval(processFadeHandlers, fadeIntervalTime)
  } else if (fadeInterval !== null && !fadeHandlers.size) {
    logger.debug('Finshed fading')
    clearInterval(fadeInterval)
    fadeInterval = null
  }
}

export function fadeUniverse(
  universe: Universe,
  targetState: Universe,
  ms: number
): void {
  stopFading(universe)

  const start = Date.now()
  // we make sure that the fading should be finished 1 interval early
  // to improve situations like fade speed = step speed
  const end = start + ms - fadeInterval * 1.5

  const startState = cloneUniverse(universe)
  const affectedChannels = getDifferentChannels(startState, targetState)

  if (!affectedChannels.size) return

  fadeHandlers.set(universe, now => {
    if (now >= end) {
      overwriteUniverse(universe, targetState)
      stopFading(universe)
      return
    }

    const progress = (now - start) / ms

    for (const channel of affectedChannels) {
      const index = getUniverseIndex(channel)
      const startValue = startState[index]
      const targetValue = targetState[index]
      const value = Math.round(
        startValue + progress * (targetValue - startValue)
      )
      setUniverseChannel(universe, channel, value)
    }
  })

  refreshFadeInterval()
}

export function stopFading(universe: Universe): void {
  fadeHandlers.delete(universe)
  refreshFadeInterval()
}
