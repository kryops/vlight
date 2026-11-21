import {
  FixtureState,
  IdType,
  LiveChase,
  LiveMemory,
  LiveMovement,
  MemoryState,
} from '@vlight/types'

import { handleApiMessage } from '../../services/api'
import { getDmxMaster, getDmxMasterFade } from '../../services/universe'
import { getUniverseIndex } from '../../services/universe/utils'
import { channelUniverse } from '../channels'
import { fixtureStates } from '../fixtures'
import { fixtureGroupStates } from '../fixture-groups'
import { liveMemories, memoryStates } from '../memories'
import { liveChases } from '../chases/live-chases'
import { liveMovements } from '../movements/live-movements'
import { isPaused } from '../pause'

/**
 * Abstraction to read and change the state of a certain type of entities
 * in a uniform way.
 *
 * All changes are routed through the API message handler, so they are
 * broadcast to all connected clients.
 */
export interface StateAdapter<T extends object = any> {
  /** Display name for logging. */
  name: string

  /** Returns the IDs of all existing entities. */
  getIds: () => IdType[]

  /** Returns the current state of an entity, or `undefined` if it does not exist. */
  get: (id: IdType) => T | undefined

  /**
   * Changes the state of an entity.
   *
   * @param merge if set, the given state is merged onto the existing one;
   *   otherwise, it replaces the existing state completely.
   */
  set: (id: IdType, state: Partial<T>, merge: boolean) => void
}

/** State of a single DMX channel. */
export interface ChannelState {
  value: number
}

/**
 * Each channel is treated as an entity with the channel number as ID.
 */
export const channelsAdapter: StateAdapter<ChannelState> = {
  name: 'channels',
  getIds: () =>
    Array.from(channelUniverse, (_, index) => String(index + 1)).filter(
      channel => channelUniverse[getUniverseIndex(+channel)] > 0
    ),
  get: id => {
    const value = channelUniverse[getUniverseIndex(+id)]
    return value === undefined ? undefined : { value }
  },
  set: (id, state) => {
    if (state.value === undefined) return
    handleApiMessage({ type: 'channels', channels: { [id]: state.value } })
  },
}

/** State of the global DMX master. */
export interface DmxMasterState {
  value: number
  fade: number
}

/** ID of the single DMX master entity. */
export const dmxMasterId = 'dmx-master'

export const dmxMasterAdapter: StateAdapter<DmxMasterState> = {
  name: 'DMX master',
  getIds: () => [dmxMasterId],
  get: () => ({ value: getDmxMaster(), fade: getDmxMasterFade() }),
  set: (_id, state) =>
    handleApiMessage({
      type: 'dmx-master',
      value: state.value,
      fade: state.fade,
    }),
}

/** State of the global pause. */
export interface PauseState {
  paused: boolean
}

/** ID of the single pause entity. */
export const pauseId = 'pause'

export const pauseAdapter: StateAdapter<PauseState> = {
  name: 'pause',
  getIds: () => [pauseId],
  get: () => ({ paused: isPaused() }),
  set: (_id, state) => {
    if (state.paused === undefined) return
    handleApiMessage({ type: 'pause', paused: state.paused })
  },
}

export const fixturesAdapter: StateAdapter<FixtureState> = {
  name: 'fixture',
  getIds: () => [...fixtureStates.keys()],
  get: id => fixtureStates.get(id),
  set: (id, state, merge) =>
    handleApiMessage({ type: 'fixture', id, state, merge }),
}

export const fixtureGroupsAdapter: StateAdapter<FixtureState> = {
  name: 'fixture group',
  getIds: () => [...fixtureGroupStates.keys()],
  get: id => fixtureGroupStates.get(id),
  set: (id, state, merge) =>
    handleApiMessage({ type: 'fixture-group', id, state, merge }),
}

export const memoriesAdapter: StateAdapter<MemoryState> = {
  name: 'memory',
  getIds: () => [...memoryStates.keys()],
  get: id => memoryStates.get(id),
  // memory states are always merged in the backend
  set: (id, state) =>
    handleApiMessage({ type: 'memory', id, state, merge: true }),
}

export const liveMemoriesAdapter: StateAdapter<LiveMemory> = {
  name: 'live memory',
  getIds: () => [...liveMemories.keys()],
  get: id => liveMemories.get(id),
  set: (id, state, merge) =>
    handleApiMessage({ type: 'live-memory', id, state, merge }),
}

export const liveChasesAdapter: StateAdapter<LiveChase> = {
  name: 'live chase',
  getIds: () => [...liveChases.keys()],
  get: id => liveChases.get(id),
  set: (id, state, merge) =>
    handleApiMessage({ type: 'live-chase', id, state, merge }),
}

export const liveMovementsAdapter: StateAdapter<LiveMovement> = {
  name: 'live movement',
  getIds: () => [...liveMovements.keys()],
  get: id => liveMovements.get(id),
  set: (id, state, merge) =>
    handleApiMessage({ type: 'live-movement', id, state, merge }),
}
