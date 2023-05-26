import { howLong } from '../../util/time'
import { universeSize } from '../config'

import {
  initUniverseComputingData,
  recomputeAndBroadcastDmxChannel,
} from './computing'
import { dmxUniverse, dmxMasterState } from './state'
/**
 * Exported as function instead of the variable directly
 * so we can add swop features later
 */
export function getDmxUniverse() {
  return dmxUniverse
}

export function getDmxMaster() {
  return dmxMasterState.value
}

export function getDmxMasterFade() {
  return dmxMasterState.fade
}

export function reloadUniverseService(): void {
  initUniverseComputingData(true)
  for (let channel = 1; channel <= universeSize; channel++) {
    recomputeAndBroadcastDmxChannel(channel)
  }
}

export async function initUniverse(): Promise<void> {
  const start = Date.now()

  initUniverseComputingData()

  howLong(start, 'initUniverse')
}

export {
  createUniverse,
  addUniverse,
  removeUniverse,
  overwriteUniverse,
  setUniverseChannel,
  setUniverseState,
  isUniverseEmpty,
} from './universe-functions'
export { fadeUniverse, stopFading } from './fading'

export type { Universe, UniverseState } from './types'
