import { Action, IdType, SequenceControl } from '@vlight/types'
import { mapFixtureList } from '@vlight/controls'
import {
  assertNever,
  deepEqual,
  getPathValue,
  logger,
  ObjectPath,
  setPathValue,
} from '@vlight/utils'

import { masterData, masterDataMaps } from '../../services/masterdata'
import { handleApiMessage } from '../../services/api'

import {
  channelsAdapter,
  dmxMasterAdapter,
  dmxMasterId,
  fixtureGroupsAdapter,
  fixturesAdapter,
  liveChasesAdapter,
  liveMemoriesAdapter,
  liveMovementsAdapter,
  memoriesAdapter,
  pauseAdapter,
  pauseId,
  sequencesAdapter,
  StateAdapter,
} from './adapters'

/**
 * A change that was applied to the state of a single entity.
 *
 * Contains the information needed to revert it.
 */
export interface StateChange {
  adapter: StateAdapter
  id: IdType

  /** The changed paths within the entity's state. */
  paths: ObjectPath[]

  /** The values at the {@link paths} before the change. */
  before: unknown[]

  /** The values at the {@link paths} after the change. */
  after: unknown[]
}

/** Keys of live entities that are never changed by non-partial actions. */
const liveEntityKeysToKeep = ['name', 'compact', 'colorsDraft']

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Returns the paths of all leaf values of the given partial state.
 *
 * Nested objects are only traversed if the existing value is an object as well,
 * so e.g. replacing a number with an object is recorded as a single change.
 */
function getChangePaths(
  state: Record<string, any>,
  existing: Record<string, any> | undefined,
  prefix: ObjectPath = []
): ObjectPath[] {
  return Object.entries(state).flatMap(([key, value]) =>
    isPlainObject(value) && isPlainObject(existing?.[key])
      ? getChangePaths(value, existing[key], [...prefix, key])
      : [[...prefix, key]]
  )
}

/**
 * Applies a change to the state of a single entity.
 *
 * @param partial if set, the state is merged onto the existing one, and only the
 *   leaf values of the state are recorded as changes.
 *   Otherwise, all top-level keys of the state are recorded as changes.
 * @param merge if set, the state is merged even if not in partial mode.
 *   Defaults to {@link partial}.
 */
export function applyStateChange<T extends object>(
  adapter: StateAdapter<T>,
  id: IdType,
  state: Partial<T>,
  partial: boolean,
  merge = partial
): StateChange | undefined {
  const beforeState = adapter.get(id)
  if (!beforeState) {
    logger.warn(`Action: no ${adapter.name} found for ID`, id)
    return undefined
  }

  const paths = partial
    ? getChangePaths(state, beforeState)
    : Object.keys(state).map(key => [key])
  if (paths.length === 0) return undefined

  const before = paths.map(path => getPathValue(beforeState, path))
  adapter.set(id, state, merge)
  const afterState = adapter.get(id)
  const after = paths.map(path => getPathValue(afterState, path))

  return { adapter, id, paths, before, after }
}

/**
 * Reverts a single state change.
 *
 * The change is skipped if the affected state has been changed in the meantime,
 * i.e. if any of the changed values differ from the values after the change.
 *
 * Returns whether the change was reverted.
 */
export function revertStateChange(change: StateChange): boolean {
  const { adapter, id, paths, before, after } = change
  const currentState = adapter.get(id)
  if (!currentState) return false

  const unchanged = paths.every((path, index) =>
    deepEqual(getPathValue(currentState, path), after[index])
  )
  if (!unchanged) {
    logger.debug(
      `Action: skipping revert for ${adapter.name} ${id} as it was changed in the meantime`
    )
    return false
  }

  if (paths.every((_, index) => deepEqual(before[index], after[index]))) {
    // nothing to do
    return true
  }

  const restoredState = paths.reduce(
    (state, path, index) => setPathValue(state, path, before[index]),
    currentState as Record<string, any>
  )

  adapter.set(id, restoredState, false)
  return true
}

/**
 * Reverts the given state changes in reverse order.
 */
export function revertStateChanges(changes: StateChange[]): void {
  for (let index = changes.length - 1; index >= 0; index--) {
    revertStateChange(changes[index])
  }
}

function applyToEntities<T extends object>(
  adapter: StateAdapter<T>,
  ids: IdType[],
  state: Partial<T>,
  partial: boolean,
  merge = partial
): StateChange[] {
  const changes: StateChange[] = []
  for (const id of ids) {
    const change = applyStateChange(adapter, id, state, partial, merge)
    if (change) changes.push(change)
  }
  return changes
}

/**
 * Applies the given state to live entities.
 *
 * Live entities are always merged, so their names are kept in non-partial mode.
 */
function applyToLiveEntities<T extends object>(
  adapter: StateAdapter<T>,
  ids: IdType[],
  state: Partial<T>,
  partial: boolean
): StateChange[] {
  const stateToApply = partial
    ? state
    : (Object.fromEntries(
        Object.entries(state).filter(
          ([key]) => !liveEntityKeysToKeep.includes(key)
        )
      ) as Partial<T>)
  return applyToEntities(adapter, ids, stateToApply, partial, true)
}

/**
 * Applies a partial state to all entities of the given adapter
 * that match the given filter.
 */
function applyToAllEntities<T extends object>(
  adapter: StateAdapter<T>,
  filter: (state: T) => boolean,
  state: Partial<T>
): StateChange[] {
  const ids = adapter.getIds().filter(id => {
    const entityState = adapter.get(id)
    return entityState !== undefined && filter(entityState)
  })
  return applyToEntities(adapter, ids, state, true)
}

function turnAllOff(): StateChange[] {
  const isOn = (state: { on: boolean }) => state.on
  return [
    ...applyToAllEntities(channelsAdapter, () => true, { value: 0 }),
    ...applyToAllEntities(fixturesAdapter, isOn, { on: false }),
    ...applyToAllEntities(fixtureGroupsAdapter, isOn, { on: false }),
    ...applyToAllEntities(memoriesAdapter, isOn, { on: false }),
    ...applyToAllEntities(liveMemoriesAdapter, isOn, { on: false }),
    ...applyToAllEntities(liveChasesAdapter, isOn, { on: false }),
    ...applyToAllEntities(liveMovementsAdapter, isOn, { on: false }),
  ]
}

function stopAll(): StateChange[] {
  const isRunning = (state: { stopped: boolean }) => !state.stopped
  return [
    ...applyToAllEntities(liveChasesAdapter, isRunning, { stopped: true }),
    ...applyToAllEntities(liveMovementsAdapter, isRunning, { stopped: true }),
    ...applyToAllEntities(
      liveMemoriesAdapter,
      state => !!state.gradientMovement,
      { gradientMovement: false }
    ),
    ...applyToAllEntities(
      sequencesAdapter,
      state => state.status !== 'stopped',
      { status: 'stopped' }
    ),
  ]
}

function setPaused(paused: boolean | ((current: boolean) => boolean)) {
  const current = pauseAdapter.get(pauseId)!.paused
  return applyToEntities(
    pauseAdapter,
    [pauseId],
    { paused: typeof paused === 'function' ? paused(current) : paused },
    true
  )
}

/**
 * Applies a control to a sequence.
 *
 * The status change is recorded, so reverting it restores the previous status
 * (running/paused/stopped).
 */
function controlSequence(
  id: IdType,
  control: SequenceControl
): StateChange | undefined {
  const before = sequencesAdapter.get(id)
  if (!before) {
    logger.warn('Action: no sequence found for ID', id)
    return undefined
  }

  handleApiMessage({ type: 'sequence', id, control })

  const after = sequencesAdapter.get(id)!
  if (before.status === after.status) return undefined
  return {
    adapter: sequencesAdapter,
    id,
    paths: [['status']],
    before: [before.status],
    after: [after.status],
  }
}

/**
 * Applies the given action.
 *
 * Returns the applied changes, which can be reverted via {@link revertStateChanges}.
 */
export function applyAction(action: Action): StateChange[] {
  logger.debug('Applying action', action)

  switch (action.type) {
    case 'channels':
      return Object.entries(action.channels ?? {}).flatMap(([channel, value]) =>
        applyToEntities(channelsAdapter, [channel], { value }, true)
      )

    case 'dmx-master': {
      const state = {
        ...(action.value !== undefined && { value: action.value }),
        ...(action.fade !== undefined && { fade: action.fade }),
      }
      return applyToEntities(dmxMasterAdapter, [dmxMasterId], state, true)
    }

    case 'global': {
      const { control } = action
      switch (control) {
        case 'all-off':
          return turnAllOff()
        case 'stop-all':
          return stopAll()
        case 'pause':
          return setPaused(true)
        case 'resume':
          return setPaused(false)
        case 'toggle-pause':
          return setPaused(current => !current)
        default:
          assertNever(control)
          return []
      }
    }

    case 'fixture':
      return applyToEntities(
        fixturesAdapter,
        mapFixtureList(action.members ?? [], { masterData, masterDataMaps }),
        action.state,
        !!action.partial
      )

    case 'fixture-group':
      return applyToEntities(
        fixtureGroupsAdapter,
        action.ids ?? [],
        action.state,
        !!action.partial
      )

    case 'memory':
      return applyToEntities(
        memoriesAdapter,
        action.ids ?? [],
        action.state,
        !!action.partial
      )

    case 'live-memory':
      return applyToLiveEntities(
        liveMemoriesAdapter,
        action.ids ?? [],
        action.state,
        !!action.partial
      )

    case 'live-chase':
      return applyToLiveEntities(
        liveChasesAdapter,
        action.ids ?? [],
        action.state,
        !!action.partial
      )

    case 'live-movement':
      return applyToLiveEntities(
        liveMovementsAdapter,
        action.ids ?? [],
        action.state,
        !!action.partial
      )

    case 'sequence':
      return (action.ids ?? []).flatMap(id => {
        const change = controlSequence(id, action.control)
        return change ? [change] : []
      })

    default:
      assertNever(action)
      logger.warn('Unknown action', action)
      return []
  }
}

/**
 * Applies the given actions in order.
 *
 * Returns all applied changes, which can be reverted via {@link revertStateChanges}.
 */
export function applyActions(actions: Action[]): StateChange[] {
  return actions.flatMap(applyAction)
}
