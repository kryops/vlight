import {
  addFadeHandler,
  removeFadeHandler,
  startValueFade,
  stepValueFade,
  ValueFade,
} from './fading'
import { dmxMasterState, dmxUniverse, dmxUniverseAfterMaster } from './state'
import {
  broadcastUniverseChannel,
  getChannelFromUniverseIndex,
  writeUniverseChannel,
} from './utils'

/** Key for the outgoing fade handler. */
const outgoingFadeKey = {}
let outgoingFadeActive = false
let lastTime = 0

/** Running fades by universe index. */
const channelFades = new Map<number, ValueFade>()

/**
 * Starts or stops fading the outgoing DMX universe if necessary.
 */
export function refreshOutgoingFade() {
  if (!outgoingFadeActive && dmxMasterState.fade) {
    outgoingFadeActive = true
    lastTime = Date.now()
    addFadeHandler(outgoingFadeKey, outgoingFadeStep)
  } else if (outgoingFadeActive && !dmxMasterState.fade) {
    // in case fading was turned off mid-fade, we need to finish all fades
    outgoingFadeStep(Infinity)
    outgoingFadeActive = false
    removeFadeHandler(outgoingFadeKey)
  }
}

/**
 * Computes a step for fading the outgoing DMX universe towards the universe after master.
 *
 * Each channel is moved with a constant speed based on its maximum difference since the fade started.
 * This supports reacting to changes during the fade, and also tries to correctly keep colors as-is.
 *
 * @param now the current time, or `Infinity` to finish all fades
 */
function outgoingFadeStep(now: number) {
  const elapsed = now - lastTime
  lastTime = now

  for (let index = 0; index < dmxUniverse.length; index++) {
    const target = dmxUniverseAfterMaster[index]
    let fade = channelFades.get(index)

    if (!fade) {
      if (dmxUniverse[index] === target) continue
      fade = startValueFade(dmxUniverse[index], target, dmxMasterState.fade)
    } else {
      // also applies changes of the target or fade time
      fade = startValueFade(fade, target, dmxMasterState.fade)
    }

    if (stepValueFade(fade, elapsed)) channelFades.delete(index)
    else channelFades.set(index, fade)

    const channel = getChannelFromUniverseIndex(index)
    if (writeUniverseChannel(dmxUniverse, channel, Math.round(fade.current))) {
      broadcastUniverseChannel(channel)
    }
  }
}
