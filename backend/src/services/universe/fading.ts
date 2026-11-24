import { logger } from '@vlight/utils'

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
 * Handlers that are called in each fading interval, by an arbitrary key
 * (e.g. the faded universe).
 * Called with the current time in ms.
 */
const fadeHandlers = new Map<object, (now: number) => void>()

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
 * Registers a handler that is called in each fading interval until it is removed.
 *
 * Replaces any existing handler with the same key.
 */
export function addFadeHandler(key: object, handler: (now: number) => void) {
  fadeHandlers.set(key, handler)
  refreshFadeInterval()
}

/** Removes the fade handler with the given key. */
export function removeFadeHandler(key: object) {
  fadeHandlers.delete(key)
  refreshFadeInterval()
}

/**
 * A running fade of a single value, moving at a constant speed.
 *
 * Reacts to target changes mid-fade by continuing from the current value.
 */
export interface ValueFade {
  /** The current (unrounded) value. */
  current: number

  /** The value to fade to. */
  target: number

  /**
   * The largest difference since the fade started,
   * which is used as baseline for the fade speed.
   *
   * This way, reversing a fade halfway through (e.g. when reverting a change) takes half the time.
   */
  span: number

  /** Fade speed in value units per ms. */
  speed: number
}

/**
 * Starts a fade to the given target.
 *
 * @param from the current value, or a running fade to continue from
 *   (keeping its span unless `restart` is set)
 * @param restart start a fresh fade taking the full fade time from the current value
 */
export function startValueFade(
  from: number | ValueFade,
  target: number,
  fadeSeconds: number,
  restart = false
): ValueFade {
  const current = typeof from === 'number' ? from : from.current
  const distance = Math.abs(target - current)
  const span =
    typeof from === 'number' || restart
      ? distance
      : Math.max(from.span, distance)
  return { current, target, span, speed: span / (fadeSeconds * 1000) }
}

/**
 * Advances the given fade by the given time.
 *
 * @returns whether the target has been reached.
 */
export function stepValueFade(fade: ValueFade, elapsedMs: number): boolean {
  if (fade.current === fade.target) return true
  const delta = fade.speed * elapsedMs
  fade.current =
    fade.target > fade.current
      ? Math.min(fade.current + delta, fade.target)
      : Math.max(fade.current - delta, fade.target)
  return fade.current === fade.target
}
