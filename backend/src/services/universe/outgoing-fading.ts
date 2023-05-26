import { fadeIntervalTime } from './fading'
import { dmxMasterState, dmxUniverse, dmxUniverseAfterMaster } from './state'
import { getDifferentChannels } from './universe-functions'
import {
  broadcastUniverseChannel,
  getUniverseIndex,
  writeUniverseChannel,
} from './utils'

let outgoingFadeInterval: any = null
const fadeDifferenceByChannel = new Map<number, number>()
const intermediateValueByChannel = new Map<number, number>()

/**
 * Starts or stops the outgoing DMX universe fade interval if necessary
 */
export function refreshOutgoingFadeInterval() {
  if (outgoingFadeInterval === null && dmxMasterState.fade) {
    outgoingFadeInterval = setInterval(outgoingFadeStep, fadeIntervalTime)
  } else if (outgoingFadeInterval !== null && !dmxMasterState.fade) {
    // in case fading was turned off mid-fade, we need to run the step once more
    outgoingFadeStep()
    clearInterval(outgoingFadeInterval)
    outgoingFadeInterval = null
  }
}

/**
 * Computes a step for fading the outgoing DMX universe.
 *
 * We convert the configured fade time into a speed with which to move faders,
 * based on the maximum difference per channel.
 * This supports reacting to changes during the fade, and also tries to correctly
 * keep colors as-is.
 */
function outgoingFadeStep() {
  const affectedChannels = getDifferentChannels(
    dmxUniverseAfterMaster,
    dmxUniverse
  )

  if (!affectedChannels.size) {
    fadeDifferenceByChannel.clear()
    intermediateValueByChannel.clear()
    return
  }

  const baselineOffset = (255 * (fadeIntervalTime / 1000)) / dmxMasterState.fade

  for (const channel of affectedChannels) {
    const index = getUniverseIndex(channel)
    const startValue = dmxUniverse[index]
    const targetValue = dmxUniverseAfterMaster[index]

    // We use the highest measured difference for the channel since the fade started
    // as baseline for the fade speed
    const currentDifference = Math.abs(targetValue - startValue)
    const maxDifference = fadeDifferenceByChannel.get(channel) ?? 0
    const differenceForOffset = Math.max(currentDifference, maxDifference)

    if (maxDifference < differenceForOffset) {
      fadeDifferenceByChannel.set(channel, differenceForOffset)
    }

    const fadeOffset = (baselineOffset * differenceForOffset) / 255

    const oldIntermediateValue =
      intermediateValueByChannel.get(channel) ?? startValue
    const newIntermediateValue =
      targetValue < startValue
        ? oldIntermediateValue - fadeOffset
        : oldIntermediateValue + fadeOffset
    intermediateValueByChannel.set(channel, newIntermediateValue)

    const newValue = Math.round(newIntermediateValue)

    if (newValue === startValue) continue

    if (currentDifference <= fadeOffset || newValue === targetValue) {
      writeUniverseChannel(dmxUniverse, channel, targetValue)
      fadeDifferenceByChannel.delete(channel)
      intermediateValueByChannel.delete(channel)
    } else {
      writeUniverseChannel(dmxUniverse, channel, newValue)
    }

    broadcastUniverseChannel(channel)
  }

  for (const channel of fadeDifferenceByChannel.keys()) {
    if (!affectedChannels.has(channel)) {
      fadeDifferenceByChannel.delete(channel)
    }
  }

  for (const channel of intermediateValueByChannel.keys()) {
    if (!affectedChannels.has(channel)) {
      intermediateValueByChannel.delete(channel)
    }
  }
}
