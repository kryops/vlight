import { logger } from '@vlight/utils'

import { setUniverseChannel } from './computing'
import { Universe } from './types'
import {
  cloneUniverse,
  getDifferentChannels,
  overwriteUniverse,
} from './universe-functions'
import { getUniverseIndex } from './utils'

/**
 * Time in ms for the fading interval.
 *
 * 20ms = 50fps
 */
const fadeIntervalTime = 20

/**
 * The interval that processes all fade handlers.
 * Only running if there are fade handlers.
 */
let fadeInterval: any = null

/**
 * Handler to fade a universe.
 * Called with the current time in ms.
 */
const fadeHandlers = new Map<Universe, (now: number) => void>()

function processFadeHandlers() {
  const now = Date.now()
  for (const handler of fadeHandlers.values()) {
    handler(now)
  }
}

/**
 * Enables or disables the fade interval depending on the fade handlers.
 */
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

/**
 * Fades the given universe to the given target state in the given time.
 *
 * If there is already a fading in progress, it is aborted, and the new fading
 * will start from there.
 */
export function fadeUniverse(
  universe: Universe,
  targetState: Universe,
  durationMs: number
): void {
  stopFading(universe)

  const start = Date.now()
  // We make sure that the fading should be finished 1 interval early
  // to improve situations like fade speed = step speed
  const end = start + durationMs - fadeInterval * 1.5

  const startState = cloneUniverse(universe)
  const affectedChannels = getDifferentChannels(startState, targetState)

  if (!affectedChannels.size) return

  fadeHandlers.set(universe, now => {
    if (now >= end) {
      overwriteUniverse(universe, targetState)
      stopFading(universe)
      return
    }

    const progress = (now - start) / durationMs

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
