import { Action, ActionType } from '@vlight/types'
import {
  deepEqual,
  getPathValue,
  mergeObjects,
  ObjectPath,
  setPathValue,
} from '@vlight/utils'

/** Display names of all action types. */
export const actionTypeNames: { [type in ActionType]: string } = {
  fixture: 'Fixtures',
  'fixture-group': 'Fixture Groups',
  memory: 'Memories',
  'live-memory': 'Live Memories',
  'live-chase': 'Live Chases',
  'live-movement': 'Movements',
  channels: 'Channels',
  'dmx-master': 'DMX Master',
  global: 'Global Controls',
  sequence: 'Sequences',
  button: 'Buttons',
  action: 'Actions',
}

/**
 * Creates a new action of the given type with default values.
 */
export function createAction(type: ActionType): Action {
  switch (type) {
    case 'channels':
      return { type, channels: {} }
    case 'dmx-master':
      return { type }
    case 'global':
      return { type, control: 'all-off' }
    case 'sequence':
      return { type, ids: [], control: 'start' }
    case 'button':
      return { type, ids: [], down: true }
    case 'action':
      return { type, ids: [] }
    case 'fixture':
      return { type, members: [], state: {}, partial: true }
    case 'fixture-group':
    case 'memory':
    case 'live-memory':
    case 'live-chase':
    case 'live-movement':
      return { type, ids: [], state: {}, partial: true }
  }
}

/**
 * Keys whose (object) values are dictionaries that are changed per entry.
 *
 * All other values are changed as a whole, as e.g. partial value ranges
 * would not make sense on their own.
 */
const dictionaryKeys = ['channels']

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Returns the paths of all individual changes contained in the given partial state.
 */
export function getStateChangePaths(state: object): ObjectPath[] {
  return Object.entries(state).flatMap(([key, value]) =>
    dictionaryKeys.includes(key) && isPlainObject(value)
      ? Object.keys(value).map(subKey => [key, subKey])
      : [[key]]
  )
}

/**
 * Returns the values of the given change that differ from the current state.
 */
export function getChangedValues<T extends object>(
  current: T | undefined,
  change: Partial<T>
): Partial<T> {
  let result: Record<string, any> = {}
  for (const path of getStateChangePaths(change)) {
    const value = getPathValue(change, path)
    if (!deepEqual(getPathValue(current, path), value)) {
      result = setPathValue(result, path, value)
    }
  }
  return result as Partial<T>
}

/**
 * Applies a change made in an editor to the state of an action.
 *
 * In partial mode, only values that differ from the displayed state are recorded.
 */
export function applyStateChange<T extends object>({
  state,
  displayedState,
  change,
  partial,
}: {
  state: Partial<T>
  displayedState: T | undefined
  change: Partial<T>
  partial: boolean
}): Partial<T> {
  const changedValues = partial
    ? getChangedValues(displayedState, change)
    : change
  if (Object.keys(changedValues).length === 0) return state
  return mergeObjects(state, changedValues) as Partial<T>
}

/**
 * Formats a value of a state change for display.
 */
export function formatStateChangeValue(value: unknown): string {
  if (value === undefined) return '(none)'
  const result =
    typeof value === 'string'
      ? value
      : JSON.stringify(value, (_key, it: unknown) =>
          typeof it === 'number' ? Math.round(it * 100) / 100 : it
        )
  return result.length > 60 ? `${result.slice(0, 57)}...` : result
}
