import { addFadeHandler, removeFadeHandler } from './fading'
import { universes } from './state'
import { Universe } from './types'
import { setUniverseChannel } from './universe-functions'
import { getChannelFromUniverseIndex, getUniverseIndex } from './utils'

/** A running fade of a single channel. */
interface ChannelFade {
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

  /** Fade speed in DMX value units per ms. */
  speed: number
}

/** All running channel fades of a universe. */
interface UniverseChannelFades {
  channels: Map<number, ChannelFade>

  /** Time of the last fade step in ms. */
  lastTime: number

  /** Called after all channel fades of the universe have finished. */
  onFinished?: () => void
}

const universeFades = new Map<Universe, UniverseChannelFades>()

function processUniverseFades(
  universe: Universe,
  fades: UniverseChannelFades,
  now: number
) {
  const elapsed = now - fades.lastTime
  fades.lastTime = now

  // Inactive universes are not faded, e.g. after being removed while fading
  const finish = !universes.has(universe)

  for (const [channel, fade] of fades.channels) {
    const delta = finish ? Infinity : fade.speed * elapsed
    fade.current =
      fade.target > fade.current
        ? Math.min(fade.current + delta, fade.target)
        : Math.max(fade.current - delta, fade.target)

    if (fade.current === fade.target) fades.channels.delete(channel)
    setUniverseChannel(universe, channel, Math.round(fade.current))
  }

  if (fades.channels.size === 0) {
    stopUniverseChannelFades(universe)
    fades.onFinished?.()
  }
}

/**
 * Stops all channel fades of the given universe, leaving the channels at their current values.
 */
export function stopUniverseChannelFades(universe: Universe): void {
  const fades = universeFades.get(universe)
  if (!fades) return
  universeFades.delete(universe)
  removeFadeHandler(fades)
}

/** Returns whether any channels of the given universe are currently being faded. */
export function isUniverseChannelFading(universe: Universe): boolean {
  return universeFades.has(universe)
}

export interface SetUniverseChannelsOptions {
  /**
   * Fade time in seconds.
   *
   * Channels that are already being faded continue from their current value.
   * Fades are not interrupted if the target value of the channel does not change.
   *
   * Universes that are not active are never faded.
   *
   * Defaults to 0.
   */
  fade?: number

  /**
   * Called after all running channel fades of the universe have finished.
   *
   * Not called if no fade was started, or if all fades were overwritten
   * (use {@link isUniverseChannelFading} to check afterwards).
   *
   * Replaces the callback of previous calls for the same universe.
   */
  onFinished?: () => void
}

/**
 * Sets the given channel values of the given universe, optionally fading them.
 *
 * Changing channels of a universe that is being faded directly
 * (e.g. via {@link setUniverseChannel}) is not supported.
 *
 * @param values channel numbers and their values
 * @returns whether the target value of any channel was changed.
 */
export function setUniverseChannels(
  universe: Universe,
  values: Iterable<[channel: number, value: number]>,
  { fade = 0, onFinished }: SetUniverseChannelsOptions = {}
): boolean {
  const canFade = fade > 0 && universes.has(universe)
  let fades = universeFades.get(universe)
  let changed = false

  for (const [channel, value] of values) {
    const existing = fades?.channels.get(channel)
    const currentValue = universe[getUniverseIndex(channel)]

    if (value === (existing?.target ?? currentValue)) continue
    changed = true

    const current = existing?.current ?? currentValue
    const distance = Math.abs(value - current)

    if (!canFade || distance === 0) {
      fades?.channels.delete(channel)
      setUniverseChannel(universe, channel, value)
      continue
    }

    if (!fades) {
      fades = { channels: new Map(), lastTime: Date.now() }
      universeFades.set(universe, fades)
      const createdFades = fades
      addFadeHandler(createdFades, now =>
        processUniverseFades(universe, createdFades, now)
      )
    }

    const span = existing ? Math.max(existing.span, distance) : distance
    fades.channels.set(channel, {
      current,
      target: value,
      span,
      speed: span / (fade * 1000),
    })
  }

  if (fades) {
    if (onFinished) fades.onFinished = onFinished
    // all running fades were overwritten
    if (fades.channels.size === 0) stopUniverseChannelFades(universe)
  }

  return changed
}

/**
 * Sets all channel values of the given universe to the values of the given target universe,
 * optionally fading them (see {@link setUniverseChannels}).
 */
export function setUniverseChannelsFrom(
  universe: Universe,
  target: Universe,
  options?: SetUniverseChannelsOptions
): boolean {
  return setUniverseChannels(universe, universeEntries(target), options)
}

function* universeEntries(
  universe: Universe
): Generator<[channel: number, value: number]> {
  for (let index = 0; index < universe.length; index++) {
    yield [getChannelFromUniverseIndex(index), universe[index]]
  }
}
