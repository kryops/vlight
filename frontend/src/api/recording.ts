import { useSyncExternalStore } from 'react'
import {
  Action,
  ApiInMessage,
  ButtonAction,
  ChannelsAction,
  Dictionary,
  DmxMasterAction,
  IdType,
} from '@vlight/types'
import { deepEqual, mergeObjects, toArray } from '@vlight/utils'
import {
  mapFixtureList,
  mergeFixtureStates,
  mergeMemoryStates,
} from '@vlight/controls'

import { getUniverseIndex } from './util'
import { sendUnrecordedApiMessage, setApiMessageInterceptor } from '.'
import { ApiState } from './worker/processing'
import { getMasterDataMaps } from './masterdata'
import {
  apiState,
  ApiStateOverlay,
  backendApiState,
  setApiStateOverlay,
} from './api-state'

/*
 * Action recording: While recording, changes made through the normal controls are
 * collected as actions instead of being sent to the backend.
 *
 * The recorded changes are displayed on top of the backend state.
 * The recording only lives in the frontend, and is lost on reload.
 */

export interface RecordingState {
  /** Whether the recording bar is displayed (it is always displayed while recording). */
  barVisible: boolean

  /** Whether recording mode is active. */
  active: boolean

  /** Whether recording mode is paused, i.e. changes are sent to the backend. */
  paused: boolean

  /** The recorded actions. */
  actions: Action[]
}

let state: RecordingState = {
  barVisible: false,
  active: false,
  paused: false,
  actions: [],
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getState = () => state

/** Whether the recorded changes are currently intercepting and overlaying controls. */
const isRecording = (s = state) => s.active && !s.paused

/** Keys of live entities that only affect the UI, and are always sent to the backend. */
const liveEntityUiKeys = ['name', 'compact', 'colorsDraft']

/** State properties that are affected by actions of each type. */
const overlayKeysByActionType: Partial<
  Record<Action['type'], (keyof ApiState)[]>
> = {
  channels: ['channels'],
  'dmx-master': ['dmxMaster', 'dmxMasterFade'],
  global: ['paused'],
  fixture: ['fixtures'],
  'fixture-group': ['fixtureGroups'],
  memory: ['memories'],
  'live-memory': ['liveMemories'],
  'live-chase': ['liveChases'],
  'live-movement': ['liveMovements'],
  button: ['buttons'],
}

function getOverlayKeys(actions: Action[]): Set<keyof ApiState> {
  return new Set(
    actions.flatMap(action => overlayKeysByActionType[action.type] ?? [])
  )
}

function setState(newState: Partial<RecordingState>) {
  const oldState = state
  state = { ...state, ...newState }

  const oldKeys = isRecording(oldState)
    ? getOverlayKeys(oldState.actions)
    : new Set<keyof ApiState>()
  const newKeys = isRecording(state)
    ? getOverlayKeys(state.actions)
    : new Set<keyof ApiState>()
  const keysToUpdate = [...new Set([...oldKeys, ...newKeys])]
  if (keysToUpdate.length) {
    setApiStateOverlay(
      newKeys.size ? recordingOverlay : undefined,
      keysToUpdate
    )
  }

  listeners.forEach(listener => listener())
}

/**
 * React Hook that returns the current recording state and re-renders on changes.
 */
export function useRecordingState(): RecordingState {
  return useSyncExternalStore(subscribe, getState)
}

/** Returns the current recording state. */
export function getRecordingState(): RecordingState {
  return state
}

export function toggleRecordingBar(): void {
  if (state.active) return
  setState({ barVisible: !state.barVisible })
}

export function startRecording(): void {
  setState({ active: true, paused: false, actions: [], barVisible: true })
}

export function setRecordingPaused(paused: boolean): void {
  if (!state.active) return
  setState({ paused })
}

export function setRecordedActions(actions: Action[]): void {
  setState({ actions })
}

/**
 * Ends the recording mode, throwing away the recorded actions.
 *
 * Returns the recorded actions.
 */
export function endRecording(): Action[] {
  const { actions } = state
  setState({ active: false, paused: false, actions: [] })
  return actions
}

// Recording

function sortedIds(ids: IdType | IdType[]): IdType[] {
  return [...toArray(ids)].sort()
}

/**
 * Returns a key for actions that control the same thing,
 * so they can be merged into a single action.
 */
function getActionKey(action: Action): string | undefined {
  switch (action.type) {
    case 'channels':
    case 'dmx-master':
      return action.type
    case 'global':
      return ['pause', 'resume', 'toggle-pause'].includes(action.control)
        ? 'pause'
        : undefined
    case 'fixture':
      return `fixture:${JSON.stringify(sortedIds(action.members ?? []))}`
    case 'fixture-group':
    case 'memory':
    case 'live-memory':
    case 'live-chase':
    case 'live-movement':
    case 'button':
    case 'sequence':
      return `${action.type}:${JSON.stringify(sortedIds(action.ids ?? []))}`
    default:
      return undefined
  }
}

/**
 * Adds the given action, or merges it with an existing action for the same control.
 *
 * Merged actions are moved to the end, so that they are still applied after
 * other actions that may affect the same entities.
 *
 * @param merge returns the merged action, or `undefined` to remove the existing one.
 */
function recordAction<T extends Action>(
  action: T,
  merge: (existing: T, action: T) => T | undefined = (_, it) => it
) {
  const key = getActionKey(action)
  const existingIndex = state.actions.findLastIndex(
    it => getActionKey(it) === key
  )
  if (existingIndex === -1) {
    setState({ actions: [...state.actions, action] })
    return
  }

  const merged = merge(state.actions[existingIndex] as T, action)
  const actions = state.actions.filter((_, index) => index !== existingIndex)
  if (merged) actions.push(merged)
  setState({ actions })
}

function mergeEntityState<T extends Action & { state: object }>(
  existing: T,
  action: T
): T {
  return { ...existing, state: mergeObjects(existing.state, action.state) }
}

/** State keys that are never recorded. */
const ignoredStateKeys = ['initial']

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Returns the values of the given state that differ from the current one.
 *
 * Nested objects (e.g. fixture channels) are compared value by value.
 */
function getStateChanges(
  state: Record<string, any>,
  current: Record<string, any> | undefined
): Record<string, any> {
  const changes: Record<string, any> = {}
  for (const [key, value] of Object.entries(state)) {
    if (value === undefined) continue
    const currentValue = current?.[key]
    if (isPlainObject(value) && isPlainObject(currentValue)) {
      const nestedChanges = getStateChanges(value, currentValue)
      if (Object.keys(nestedChanges).length) changes[key] = nestedChanges
    } else if (!deepEqual(value, currentValue)) {
      changes[key] = value
    }
  }
  return changes
}

/**
 * Returns the state to record from an entity state message.
 *
 * Messages that replace the complete state (e.g. turning on a fixture through its widget)
 * are reduced to the values that differ from the displayed state.
 */
function getStateToRecord(
  state: Record<string, any>,
  merge: boolean | undefined,
  currentStates: Dictionary<any>,
  ids: IdType[]
): Record<string, any> {
  const filteredState = Object.fromEntries(
    Object.entries(state).filter(
      ([key, value]) => value !== undefined && !ignoredStateKeys.includes(key)
    )
  )
  if (merge) return filteredState
  return ids.reduce<Record<string, any>>(
    (result, id) =>
      mergeObjects(result, getStateChanges(filteredState, currentStates[id])),
    {}
  )
}

function recordLiveEntityMessage(
  message: Extract<
    ApiInMessage,
    { type: 'live-memory' | 'live-chase' | 'live-movement' }
  >,
  stateKey: 'liveMemories' | 'liveChases' | 'liveMovements'
): boolean {
  // deleting and creating are applied directly
  if (message.state === null || !backendApiState[stateKey][message.id]) {
    return false
  }

  const step = 'step' in message && !!message.step
  const reset = 'reset' in message && !!message.reset

  const uiEntries = Object.entries(message.state).filter(([key]) =>
    liveEntityUiKeys.includes(key)
  )
  const recordedEntries = Object.entries(message.state).filter(
    ([key]) => !liveEntityUiKeys.includes(key)
  )
  if (recordedEntries.length === 0 && !step && !reset) return false

  if (uiEntries.length) {
    sendUnrecordedApiMessage({
      type: message.type,
      id: message.id,
      state: Object.fromEntries(uiEntries),
      merge: true,
    })
  }

  recordAction(
    {
      type: message.type,
      ids: [message.id],
      state: Object.fromEntries(recordedEntries),
      partial: true,
      ...(step && { step: true }),
      ...(reset && { reset: true }),
    } as Extract<Action, { type: typeof message.type }>,
    (existing: any, action: any) => ({
      ...mergeEntityState(existing, action),
      ...(action.step && { step: true }),
      ...(action.reset && { reset: true }),
    })
  )
  return true
}

/**
 * Records the given API message as an action if recording mode is active.
 *
 * Returns whether the message was recorded (and should therefore not be sent to the backend).
 */
export function recordApiMessage(message: ApiInMessage): boolean {
  if (!isRecording()) return false

  switch (message.type) {
    case 'channels':
      recordAction<ChannelsAction>(
        { type: 'channels', channels: message.channels },
        (existing, action) => ({
          ...existing,
          channels: { ...existing.channels, ...action.channels },
        })
      )
      return true

    case 'dmx-master':
      recordAction<DmxMasterAction>(
        {
          type: 'dmx-master',
          ...(message.value !== undefined && { value: message.value }),
          ...(message.fade !== undefined && { fade: message.fade }),
        },
        (existing, action) => ({ ...existing, ...action })
      )
      return true

    case 'pause':
      recordAction({
        type: 'global',
        control: message.paused ? 'pause' : 'resume',
      })
      return true

    case 'fixture': {
      const ids = sortedIds(message.id)
      const state = getStateToRecord(
        message.state,
        message.merge,
        apiState.fixtures,
        ids
      )
      if (Object.keys(state).length) {
        recordAction(
          { type: 'fixture', members: ids, state, partial: true },
          mergeEntityState
        )
      }
      return true
    }

    case 'fixture-group':
    case 'memory': {
      const ids = sortedIds(message.id)
      const state = getStateToRecord(
        message.state,
        message.merge,
        message.type === 'memory' ? apiState.memories : apiState.fixtureGroups,
        ids
      )
      if (Object.keys(state).length) {
        recordAction(
          {
            type: message.type,
            ids,
            state,
            partial: true,
          } as Extract<Action, { type: typeof message.type }>,
          mergeEntityState
        )
      }
      return true
    }

    case 'live-memory':
      return recordLiveEntityMessage(message, 'liveMemories')
    case 'live-chase':
      return recordLiveEntityMessage(message, 'liveChases')
    case 'live-movement':
      return recordLiveEntityMessage(message, 'liveMovements')

    case 'button':
      // While recording, buttons behave like toggles: Pressing again removes the action
      if (message.down) {
        recordAction<ButtonAction>(
          { type: 'button', ids: [message.id], down: true },
          () => undefined
        )
      }
      return true

    case 'sequence':
      recordAction(
        { type: 'sequence', ids: [message.id], control: message.control },
        (existing, action) =>
          existing.control === 'toggle' && action.control === 'toggle'
            ? undefined
            : action
      )
      return true

    default:
      return false
  }
}

setApiMessageInterceptor(recordApiMessage)

// Overlay

function overlayEntities<T>(
  backendValue: Dictionary<T>,
  actions: Action[],
  type: Action['type'],
  getIds: (action: any) => IdType[],
  merge: (current: T | undefined, action: any) => T
): Dictionary<T> {
  let result = backendValue
  for (const action of actions) {
    if (action.type !== type) continue
    for (const id of getIds(action)) {
      if (result[id] === undefined) continue
      if (result === backendValue) result = { ...backendValue }
      result[id] = merge(result[id], action)
    }
  }
  return result
}

const getActionIds = (action: { ids?: IdType[] }) => action.ids ?? []

function getFixtureIds(action: { members?: string[] }) {
  const masterData = backendApiState.masterData
  if (!masterData) return []
  return mapFixtureList(action.members ?? [], {
    masterData,
    masterDataMaps: getMasterDataMaps(),
  })
}

const mergeFixtureAction = (current: any, action: any) =>
  mergeFixtureStates(action.partial ? current : undefined, action.state)

const mergeLiveEntityAction = (current: any, action: any) =>
  mergeObjects(current, action.state)

function overlayButtons(
  backendValue: Dictionary<boolean>,
  actions: Action[]
): Dictionary<boolean> {
  const buttons = getMasterDataMaps().buttons
  let result = backendValue
  for (const action of actions) {
    if (action.type !== 'button') continue
    for (const id of action.ids ?? []) {
      const toggle = buttons.get(id)?.mode === 'toggle'
      if (toggle && !action.down) continue
      if (result === backendValue) result = { ...backendValue }
      result[id] = toggle ? !result[id] : action.down
    }
  }
  return result
}

/**
 * Computes the displayed state from the backend state and the recorded actions.
 */
const recordingOverlay: ApiStateOverlay = (key, backendValue) => {
  const { actions } = state
  const value: any = backendValue

  switch (key) {
    case 'channels': {
      let result: number[] | undefined = value
      for (const action of actions) {
        if (action.type !== 'channels') continue
        result = [...(result ?? [])]
        for (const [channel, channelValue] of Object.entries(
          action.channels ?? {}
        )) {
          result[getUniverseIndex(+channel)] = channelValue
        }
      }
      return result as any
    }

    case 'dmxMaster':
    case 'dmxMasterFade': {
      let result = value
      for (const action of actions) {
        if (action.type !== 'dmx-master') continue
        const actionValue = key === 'dmxMaster' ? action.value : action.fade
        if (actionValue !== undefined) result = actionValue
      }
      return result
    }

    case 'paused': {
      let result = value
      for (const action of actions) {
        if (action.type !== 'global') continue
        if (action.control === 'pause') result = true
        else if (action.control === 'resume') result = false
        else if (action.control === 'toggle-pause') result = !result
      }
      return result
    }

    case 'fixtures':
      return overlayEntities(
        value,
        actions,
        'fixture',
        getFixtureIds,
        mergeFixtureAction
      ) as any
    case 'fixtureGroups':
      return overlayEntities(
        value,
        actions,
        'fixture-group',
        getActionIds,
        mergeFixtureAction
      ) as any
    case 'memories':
      // the backend always merges memory states
      return overlayEntities(
        value,
        actions,
        'memory',
        getActionIds,
        (current: any, action: any) => mergeMemoryStates(current, action.state)
      ) as any
    case 'liveMemories':
      return overlayEntities(
        value,
        actions,
        'live-memory',
        getActionIds,
        mergeLiveEntityAction
      ) as any
    case 'liveChases':
      return overlayEntities(
        value,
        actions,
        'live-chase',
        getActionIds,
        mergeLiveEntityAction
      ) as any
    case 'liveMovements':
      return overlayEntities(
        value,
        actions,
        'live-movement',
        getActionIds,
        mergeLiveEntityAction
      ) as any

    case 'buttons':
      return overlayButtons(value, actions) as any

    default:
      return backendValue
  }
}
