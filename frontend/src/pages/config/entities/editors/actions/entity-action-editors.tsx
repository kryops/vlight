import {
  getCommonFixtureMapping,
  getCommonFixtureState,
  mapFixtureList,
} from '@vlight/controls'
import {
  FixtureAction,
  FixtureGroupAction,
  FixtureState,
  IdType,
  LiveChase,
  LiveChaseAction,
  LiveMemory,
  LiveMemoryAction,
  LiveMovement,
  LiveMovementAction,
  MemoryAction,
  MemoryState,
} from '@vlight/types'
import { isTruthy, isUnique } from '@vlight/utils'
import { useCallback } from 'react'

import { useApiState, useMasterDataAndMaps } from '../../../../../hooks/api'
import { useCommonFixtureMapping } from '../../../../../hooks/fixtures'
import {
  useDeepEqualMemo,
  useShallowEqualMemo,
} from '../../../../../hooks/performance'
import { Widget } from '../../../../../ui/containers/widget'
import { Fader } from '../../../../../ui/controls/fader/fader'
import { faderContainer } from '../../../../../ui/css/fader-container'
import { FixtureListInput } from '../../../../../ui/forms/fixture-list-input'
import { MultiToggleInput } from '../../../../../ui/forms/multi-toggle-input'
import { iconGroup, iconLights, iconMemory } from '../../../../../ui/icons'
import { StatelessLiveChaseWidget } from '../../../../../widgets/chase/stateless-live-chase-widget'
import { FixtureStateWidget } from '../../../../../widgets/fixture/fixture-state-widget'
import { StatelessLiveMemoryWidget } from '../../../../../widgets/memory/stateless-live-memory-widget'
import { StatelessLiveMovementWidget } from '../../../../../widgets/movement/stateless-live-movement-widget'

import {
  ActionFadeOptions,
  ActionOptionToggle,
  EntityStateActionEditor,
  FadeOptions,
} from './entity-state-action-editor'

export interface ActionEditorProps<T> {
  action: T
  onChange: (action: T) => void
}

/** Renders the fade options of the given action. */
function renderFadeOptions<T extends FadeOptions>(
  action: T,
  onChange: (action: T) => void
) {
  return (
    <ActionFadeOptions
      value={action}
      onChange={fadeOptions => onChange({ ...action, ...fadeOptions })}
    />
  )
}

const fixtureStateDefaults: FixtureState = { on: false, channels: {} }

/** Keys that are not copied from the current state when switching to non-partial mode. */
const ignoredFixtureStateKeys = ['initial']
const ignoredLiveEntityKeys = ['name', 'compact', 'colorsDraft']

/**
 * Editor for actions that change the state of fixtures.
 */
export function FixtureActionEditor({
  action,
  onChange,
}: ActionEditorProps<FixtureAction>) {
  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterDataMaps } = masterDataAndMaps
  const fixtureStates = useApiState('fixtures')
  const members = action.members ?? []
  const mapping = useCommonFixtureMapping(members)

  const fixtures = mapFixtureList(members, masterDataAndMaps)
    .map(id => masterDataMaps.fixtures.get(id))
    .filter(isTruthy)

  const commonState = useDeepEqualMemo(
    getCommonFixtureState(
      fixtures.map(fixture => ({
        state: fixtureStates[fixture.id],
        mapping: masterDataMaps.fixtureTypes.get(fixture.type)?.mapping ?? [],
      }))
    )
  )

  return (
    <EntityStateActionEditor
      state={action.state}
      partial={!!action.partial}
      currentState={fixtures.length ? commonState : undefined}
      fullModeDefaults={fixtures.length ? fixtureStateDefaults : undefined}
      options={renderFadeOptions(action, onChange)}
      ignoredKeys={ignoredFixtureStateKeys}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      selection={
        <FixtureListInput
          value={members}
          onChange={newMembers => onChange({ ...action, members: newMembers })}
          compact
        />
      }
      renderWidget={(displayedState, change) => (
        <FixtureStateWidget
          icon={iconLights}
          title={`${fixtures.length} Fixtures`}
          mapping={mapping}
          fixtureState={displayedState}
          onChange={change}
        />
      )}
    />
  )
}

/**
 * Editor for actions that change the state of fixture groups.
 */
export function FixtureGroupActionEditor({
  action,
  onChange,
}: ActionEditorProps<FixtureGroupAction>) {
  const masterDataAndMaps = useMasterDataAndMaps()
  const { masterData, masterDataMaps } = masterDataAndMaps
  const fixtureGroupStates = useApiState('fixtureGroups')
  const ids = action.ids ?? []

  const groups = ids
    .map(id => masterDataMaps.fixtureGroups.get(id))
    .filter(isTruthy)
  const mapping = useCommonFixtureMapping(
    groups.flatMap(group => group.fixtures).filter(isUnique)
  )

  const commonState = useDeepEqualMemo(
    getCommonFixtureState(
      groups.map(group => ({
        state: fixtureGroupStates[group.id],
        mapping: getCommonFixtureMapping(group.fixtures, masterDataAndMaps),
      }))
    )
  )

  const groupIds = useShallowEqualMemo(
    masterData.fixtureGroups.map(it => it.id)
  )
  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.fixtureGroups.get(id)?.name ?? id,
    [masterDataMaps]
  )

  return (
    <EntityStateActionEditor
      state={action.state}
      partial={!!action.partial}
      currentState={groups.length ? commonState : undefined}
      fullModeDefaults={groups.length ? fixtureStateDefaults : undefined}
      options={renderFadeOptions(action, onChange)}
      ignoredKeys={ignoredFixtureStateKeys}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      selection={
        <MultiToggleInput
          value={ids}
          entries={groupIds}
          onChange={newIds => onChange({ ...action, ids: newIds })}
          getDisplayValue={getDisplayValue}
        />
      }
      renderWidget={(displayedState, change) => (
        <FixtureStateWidget
          icon={iconGroup}
          title={`${groups.length} Groups`}
          mapping={mapping}
          fixtureState={displayedState}
          onChange={change}
        />
      )}
    />
  )
}

/**
 * Editor for actions that change the state of memories.
 */
export function MemoryActionEditor({
  action,
  onChange,
}: ActionEditorProps<MemoryAction>) {
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const memoryStates = useApiState('memories')
  const ids = action.ids ?? []
  const firstState = ids
    .map(id => memoryStates[id])
    .find((state): state is MemoryState => !!state)

  const memoryIds = useShallowEqualMemo(masterData.memories.map(it => it.id))
  const getDisplayValue = useCallback(
    (id: IdType) => masterDataMaps.memories.get(id)?.name ?? id,
    [masterDataMaps]
  )

  return (
    <EntityStateActionEditor
      state={action.state}
      partial={!!action.partial}
      currentState={firstState}
      ignoredKeys={['initial', 'forceMaster']}
      options={renderFadeOptions(action, onChange)}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      selection={
        <MultiToggleInput
          value={ids}
          entries={memoryIds}
          onChange={newIds => onChange({ ...action, ids: newIds })}
          getDisplayValue={getDisplayValue}
        />
      }
      renderWidget={(displayedState, change) => (
        <Widget
          icon={iconMemory}
          title={`${ids.length} Memories`}
          onTitleClick={() => change({ on: !displayedState.on })}
          turnedOn={displayedState.on}
        >
          <div className={faderContainer}>
            <Fader
              max={255}
              step={1}
              value={displayedState.value ?? 0}
              onChange={value => change({ value })}
            />
          </div>
        </Widget>
      )}
    />
  )
}

type LiveStateKey = 'liveMemories' | 'liveChases' | 'liveMovements'

/**
 * Returns the IDs of all live entities of the given type, the state of the first selected one,
 * and a function to get the display name of an entry.
 */
function useLiveEntities<TKey extends LiveStateKey>(
  key: TKey,
  ids: IdType[],
  fallbackName: string
) {
  const states = useApiState(key)
  const allIds = useShallowEqualMemo(Object.keys(states))
  const firstId = ids.find(id => states[id])
  const getDisplayValue = useCallback(
    (id: IdType) => states[id]?.name ?? `${fallbackName} ${id}`,
    [states, fallbackName]
  )
  return {
    allIds,
    firstId,
    firstState: firstId
      ? (states[firstId] as (typeof states)[string])
      : undefined,
    getDisplayValue,
  }
}

/**
 * Editor for actions that change the state of live memories.
 */
export function LiveMemoryActionEditor({
  action,
  onChange,
}: ActionEditorProps<LiveMemoryAction>) {
  const ids = action.ids ?? []
  const { allIds, firstId, firstState, getDisplayValue } = useLiveEntities(
    'liveMemories',
    ids,
    'Live Memory'
  )

  return (
    <EntityStateActionEditor<LiveMemory>
      state={action.state}
      partial={!!action.partial}
      currentState={firstState}
      ignoredKeys={ignoredLiveEntityKeys}
      options={renderFadeOptions(action, onChange)}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      selection={
        <MultiToggleInput
          value={ids}
          entries={allIds}
          onChange={newIds => onChange({ ...action, ids: newIds })}
          getDisplayValue={getDisplayValue}
        />
      }
      renderWidget={(displayedState, change) => (
        <StatelessLiveMemoryWidget
          id={firstId!}
          state={displayedState}
          title={`${ids.length} Live Memories`}
          onChange={change}
        />
      )}
    />
  )
}

/**
 * Editor for actions that change the state of live chases.
 */
export function LiveChaseActionEditor({
  action,
  onChange,
}: ActionEditorProps<LiveChaseAction>) {
  const ids = action.ids ?? []
  const { allIds, firstId, firstState, getDisplayValue } = useLiveEntities(
    'liveChases',
    ids,
    'Live Chase'
  )

  return (
    <EntityStateActionEditor<LiveChase>
      state={action.state}
      partial={!!action.partial}
      currentState={firstState}
      ignoredKeys={ignoredLiveEntityKeys}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      options={
        <>
          <ActionOptionToggle
            value={!!action.step}
            onChange={step => onChange({ ...action, step: step || undefined })}
            label="Step"
            title="Moves the chases one step forward after applying the state"
          />
          {renderFadeOptions(action, onChange)}
        </>
      }
      selection={
        <MultiToggleInput
          value={ids}
          entries={allIds}
          onChange={newIds => onChange({ ...action, ids: newIds })}
          getDisplayValue={getDisplayValue}
        />
      }
      renderWidget={(displayedState, change) => (
        <StatelessLiveChaseWidget
          id={firstId!}
          state={displayedState}
          title={`${ids.length} Live Chases`}
          onChange={change}
        />
      )}
    />
  )
}

/**
 * Editor for actions that change the state of live movements.
 */
export function LiveMovementActionEditor({
  action,
  onChange,
}: ActionEditorProps<LiveMovementAction>) {
  const ids = action.ids ?? []
  const { allIds, firstId, firstState, getDisplayValue } = useLiveEntities(
    'liveMovements',
    ids,
    'Movement'
  )

  return (
    <EntityStateActionEditor<LiveMovement>
      state={action.state}
      partial={!!action.partial}
      currentState={firstState}
      ignoredKeys={ignoredLiveEntityKeys}
      onChange={(state, partial) => onChange({ ...action, state, partial })}
      options={
        <ActionOptionToggle
          value={!!action.reset}
          onChange={reset => onChange({ ...action, reset: reset || undefined })}
          label="Reset to center"
          title="Resets the movements so that all members return to the center"
        />
      }
      selection={
        <MultiToggleInput
          value={ids}
          entries={allIds}
          onChange={newIds => onChange({ ...action, ids: newIds })}
          getDisplayValue={getDisplayValue}
        />
      }
      renderWidget={(displayedState, change) => (
        <StatelessLiveMovementWidget
          id={firstId!}
          state={displayedState}
          title={`${ids.length} Movements`}
          onChange={change}
        />
      )}
    />
  )
}
