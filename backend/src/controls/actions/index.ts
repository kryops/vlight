import { Action, ApiActionsMessage, IdType } from '@vlight/types'
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
import { registerApiMessageHandler } from '../../services/api/registry'

import {
  buttonsAdapter,
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

  /** Fade time in seconds when reverting the change. */
  revertFade?: number
}

export interface ApplyStateChangeOptions {
  /**
   * If set, the state is merged onto the existing one, and only the
   * leaf values of the state are recorded as changes.
   * Otherwise, all top-level keys of the state are recorded as changes.
   */
  partial: boolean

  /**
   * If set, the state is merged even if not in partial mode.
   *
   * Defaults to {@link partial}.
   */
  merge?: boolean

  /** Fade time in seconds (only supported by some entities). */
  fade?: number

  /**
   * Fade time in seconds when reverting the change.
   *
   * Defaults to {@link fade}.
   */
  revertFade?: number
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
 */
export function applyStateChange<T extends object>(
  adapter: StateAdapter<T>,
  id: IdType,
  state: Partial<T>,
  { partial, merge = partial, fade, revertFade = fade }: ApplyStateChangeOptions
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
  adapter.set(id, state, merge, fade)
  const afterState = adapter.get(id)
  const after = paths.map(path => getPathValue(afterState, path))

  return { adapter, id, paths, before, after, revertFade }
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
  const { adapter, id, paths, before, after, revertFade } = change
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

  adapter.set(id, restoredState, false, revertFade)
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
  options: ApplyStateChangeOptions
): StateChange[] {
  const changes: StateChange[] = []
  for (const id of ids) {
    const change = applyStateChange(adapter, id, state, options)
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
  options: ApplyStateChangeOptions
): StateChange[] {
  const stateToApply = options.partial
    ? state
    : (Object.fromEntries(
        Object.entries(state).filter(
          ([key]) => !liveEntityKeysToKeep.includes(key)
        )
      ) as Partial<T>)
  return applyToEntities(adapter, ids, stateToApply, {
    ...options,
    merge: true,
  })
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
  return applyToEntities(adapter, ids, state, { partial: true })
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
    { partial: true }
  )
}

/** Returns the options to apply the state of an action whose changes can be faded. */
function getFadeableOptions(action: {
  partial?: boolean
  fade?: number
  revertFade?: number
}): ApplyStateChangeOptions {
  return {
    partial: !!action.partial,
    fade: action.fade,
    revertFade: action.revertFade,
  }
}

/**
 * Triggers a control on an entity via an API message, and records
 * the resulting change of a single state value.
 *
 * Reverting the change restores the previous value through the adapter.
 */
function applyControl<T extends object, K extends keyof T & string>(
  adapter: StateAdapter<T>,
  id: IdType,
  key: K,
  control: () => void
): StateChange | undefined {
  const before = adapter.get(id)
  if (!before) {
    logger.warn(`Action: no ${adapter.name} found for ID`, id)
    return undefined
  }

  control()

  const after = adapter.get(id)!
  if (before[key] === after[key]) return undefined
  return {
    adapter,
    id,
    paths: [[key]],
    before: [before[key]],
    after: [after[key]],
  }
}

/**
 * IDs of the named actions that are currently being applied.
 *
 * Used to prevent endless recursion through named actions.
 */
const executingNamedActions = new Set<IdType>()

/**
 * Applies a named action.
 *
 * Skips named actions that are already being applied, i.e. that (indirectly) trigger themselves.
 */
function applyNamedAction(id: IdType): StateChange[] {
  const namedAction = masterDataMaps.actions.get(id)
  if (!namedAction) {
    logger.warn('Action: no named action found for ID', id)
    return []
  }

  if (executingNamedActions.has(id)) {
    logger.warn('Action: named action cannot trigger itself, skipping', id)
    return []
  }

  executingNamedActions.add(id)
  try {
    return applyAction(namedAction)
  } finally {
    executingNamedActions.delete(id)
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
        applyToEntities(
          channelsAdapter,
          [channel],
          { value },
          getFadeableOptions({ ...action, partial: true })
        )
      )

    case 'dmx-master': {
      const state = {
        ...(action.value !== undefined && { value: action.value }),
        ...(action.fade !== undefined && { fade: action.fade }),
      }
      return applyToEntities(dmxMasterAdapter, [dmxMasterId], state, {
        partial: true,
      })
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
        getFadeableOptions(action)
      )

    case 'fixture-group':
      return applyToEntities(
        fixtureGroupsAdapter,
        action.ids ?? [],
        action.state,
        getFadeableOptions(action)
      )

    case 'memory':
      return applyToEntities(
        memoriesAdapter,
        action.ids ?? [],
        action.state,
        getFadeableOptions(action)
      )

    case 'live-memory':
      return applyToLiveEntities(
        liveMemoriesAdapter,
        action.ids ?? [],
        action.state,
        getFadeableOptions(action)
      )

    case 'live-chase': {
      const changes = applyToLiveEntities(
        liveChasesAdapter,
        action.ids ?? [],
        action.state ?? {},
        getFadeableOptions(action)
      )
      if (action.step) {
        for (const id of action.ids ?? []) {
          if (!liveChasesAdapter.get(id)) continue
          handleApiMessage({
            type: 'live-chase',
            id,
            state: {},
            merge: true,
            step: true,
          })
        }
      }
      return changes
    }

    case 'live-movement': {
      const changes = applyToLiveEntities(
        liveMovementsAdapter,
        action.ids ?? [],
        action.state ?? {},
        { partial: !!action.partial }
      )
      if (action.reset) {
        for (const id of action.ids ?? []) {
          if (!liveMovementsAdapter.get(id)) continue
          handleApiMessage({
            type: 'live-movement',
            id,
            state: {},
            merge: true,
            reset: true,
          })
        }
      }
      return changes
    }

    case 'sequence':
      return (action.ids ?? []).flatMap(id => {
        const change = applyControl(sequencesAdapter, id, 'status', () =>
          handleApiMessage({ type: 'sequence', id, control: action.control })
        )
        return change ? [change] : []
      })

    case 'button':
      return (action.ids ?? []).flatMap(id => {
        const change = applyControl(buttonsAdapter, id, 'active', () =>
          handleApiMessage({ type: 'button', id, down: !!action.down })
        )
        return change ? [change] : []
      })

    case 'action':
      return (action.ids ?? []).flatMap(applyNamedAction)

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

export function init(): void {
  registerApiMessageHandler('actions', ({ actions }: ApiActionsMessage) => {
    applyActions(actions ?? [])
    // the incoming message is not broadcast; state changes are broadcast separately
    return false
  })
}
