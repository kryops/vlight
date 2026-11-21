import {
  FixtureState,
  IdType,
  LiveChase,
  LiveMemory,
  LiveMovement,
  MemoryState,
  SequenceControl,
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
import { sequenceStates } from '../sequences/state'
import { buttonStates } from '../buttons/state'
import { masterDataMaps } from '../../services/masterdata'

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

/**
 * Status of a sequence.
 *
 * Changing it starts/resumes, pauses, or stops the sequence.
 */
export interface SequenceStatusState {
  status: 'running' | 'paused' | 'stopped'
}

const sequenceStatusControls: {
  [status in SequenceStatusState['status']]: SequenceControl
} = {
  running: 'start',
  paused: 'pause',
  stopped: 'stop',
}

export const sequencesAdapter: StateAdapter<SequenceStatusState> = {
  name: 'sequence',
  getIds: () => [...masterDataMaps.sequences.keys()],
  get: id =>
    masterDataMaps.sequences.has(id)
      ? { status: sequenceStates.get(id)?.status ?? 'stopped' }
      : undefined,
  set: (id, state) => {
    if (state.status === undefined) return
    handleApiMessage({
      type: 'sequence',
      id,
      control: sequenceStatusControls[state.status],
    })
  },
}

/**
 * Active state of a programmable button.
 *
 * Changing it presses or releases the button so it ends up in the given state
 * (toggle buttons are pressed to toggle them).
 */
export interface ButtonActiveState {
  active: boolean
}

export const buttonsAdapter: StateAdapter<ButtonActiveState> = {
  name: 'button',
  getIds: () => [...masterDataMaps.buttons.keys()],
  get: id =>
    masterDataMaps.buttons.has(id)
      ? { active: !!buttonStates.get(id) }
      : undefined,
  set: (id, state) => {
    const button = masterDataMaps.buttons.get(id)
    if (!button || state.active === undefined) return
    if ((button.mode ?? 'flash') === 'toggle') {
      if (!!buttonStates.get(id) === state.active) return
      handleApiMessage({ type: 'button', id, down: true })
    } else {
      handleApiMessage({ type: 'button', id, down: state.active })
    }
  },
}
