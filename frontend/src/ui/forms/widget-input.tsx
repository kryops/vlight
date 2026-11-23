import {
  ButtonsWidgetConfig,
  ChannelsWidgetConfig,
  EntityName,
  FixtureGroupWidgetConfig,
  FixtureWidgetConfig,
  IdType,
  LiveChaseWidgetConfig,
  LiveMemoryWidgetConfig,
  LiveMovementWidgetConfig,
  MemoryWidgetConfig,
  SequenceWidgetConfig,
  UniverseWidgetConfig,
  WidgetConfig,
} from '@vlight/types'
import { css } from '@linaria/core'
import { commaStringToArray, ensureBetween, shallowEqual } from '@vlight/utils'
import { JSX, ReactNode, useCallback, useState } from 'react'

import { baseline, primaryShade } from '../styles'
import { cx } from '../../util/styles'
import { iconDelete } from '../icons'
import { apiState } from '../../api/api-state'
import type { ApiState } from '../../api/worker/processing'
import { Button } from '../buttons/button'
import { flexContainer } from '../css/flex'
import { useApiState } from '../../hooks/api'

import { Label } from './label'
import { Select, SelectEntry } from './select'
import { NumberInput, TextInput, TypedInputProps } from './typed-input'
import { EntityReferenceSelect } from './entity-reference-select'
import { ArrayInput } from './array-input'

type WidgetType = WidgetConfig['type']
type WidgetOfType<T extends WidgetType> = Extract<WidgetConfig, { type: T }>

interface WidgetMapping<T extends WidgetType> {
  name: string
  defaultValueFactory: () => WidgetOfType<T>
  entityReference?: EntityName
  stateReference?: keyof ApiState
}

export const widgetTypes: { [type in WidgetType]: WidgetMapping<type> } = {
  universe: {
    name: 'Universe',
    defaultValueFactory: () => ({
      type: 'universe',
      from: 1,
      to: 8,
    }),
  },
  channels: {
    name: 'Channels',
    defaultValueFactory: () => ({
      type: 'channels',
      from: 1,
      to: 8,
    }),
  },
  fixture: {
    name: 'Fixture',
    defaultValueFactory: () => ({
      type: 'fixture',
      id: apiState.masterData?.fixtures[0]?.id ?? '',
    }),
    entityReference: 'fixtures',
  },
  'fixture-group': {
    name: 'Fixture Group',
    defaultValueFactory: () => ({
      type: 'fixture-group',
      id: apiState.masterData?.fixtureGroups[0]?.id ?? '',
    }),
    entityReference: 'fixtureGroups',
  },
  memory: {
    name: 'Memory',
    defaultValueFactory: () => ({
      type: 'memory',
      id: apiState.masterData?.memories[0]?.id ?? '',
    }),
    entityReference: 'memories',
  },
  sequence: {
    name: 'Sequence',
    defaultValueFactory: () => ({
      type: 'sequence',
      id: apiState.masterData?.sequences[0]?.id ?? '',
    }),
    entityReference: 'sequences',
  },
  'live-memory': {
    name: 'Live Memory',
    defaultValueFactory: () => ({
      type: 'live-memory',
      id: Object.keys(apiState.liveMemories)[0] ?? '',
    }),
    stateReference: 'liveMemories',
  },
  'live-chase': {
    name: 'Live Chase',
    defaultValueFactory: () => ({
      type: 'live-chase',
      id: Object.keys(apiState.liveChases)[0] ?? '',
    }),
    stateReference: 'liveChases',
  },
  'live-movement': {
    name: 'Movement',
    defaultValueFactory: () => ({
      type: 'live-movement',
      id: Object.keys(apiState.liveMovements)[0] ?? '',
    }),
    stateReference: 'liveMovements',
  },
  map: {
    name: 'Map',
    defaultValueFactory: () => ({
      type: 'map',
    }),
  },
  'dmx-master': {
    name: 'DMX Master',
    defaultValueFactory: () => ({
      type: 'dmx-master',
    }),
  },
  controls: {
    name: 'Controls (all off)',
    defaultValueFactory: () => ({
      type: 'controls',
    }),
  },
  buttons: {
    name: 'Buttons',
    defaultValueFactory: () => ({
      type: 'buttons',
      ids: apiState.masterData?.buttons[0]
        ? [apiState.masterData.buttons[0].id]
        : [],
    }),
    entityReference: 'buttons',
  },
}

const typeSelectEntries: SelectEntry<WidgetType>[] = Object.entries(widgetTypes)
  .map(([key, value]) => ({ value: key as WidgetType, label: value.name }))
  .sort((a, b) => a.label.localeCompare(b.label))

const container = css`
  padding: ${baseline(2)};
  margin: ${baseline()} 0;
  background: ${primaryShade(2)};
  cursor: pointer;
`

const header = css`
  align-items: center;
`

interface WidgetTypeInputProps<T> {
  value: T
  onChange: (value: T) => void
  compact?: boolean
}

function UniverseChannelWidgetInput({
  value,
  onChange,
  compact,
}: WidgetTypeInputProps<UniverseWidgetConfig | ChannelsWidgetConfig>) {
  const changeFrom = (newValue: number | undefined): void =>
    onChange({
      ...value,
      from: ensureBetween(newValue ?? 1, 1, 512),
    })
  const changeTo = (newValue: number | undefined): void =>
    onChange({
      ...value,
      to: ensureBetween(newValue ?? 512, 1, 512),
    })
  const changeTitle = (newValue: string | undefined): void =>
    onChange({
      ...value,
      title: newValue,
    })

  return (
    <>
      <Label
        forceSmall={compact}
        label="From"
        input={
          <NumberInput
            value={value.from}
            onChange={changeFrom}
            min={1}
            max={512}
          />
        }
      />
      <Label
        forceSmall={compact}
        label="To"
        input={
          <NumberInput value={value.to} onChange={changeTo} min={1} max={512} />
        }
      />
      <Label
        forceSmall={compact}
        label="Title"
        input={<TextInput value={value.title} onChange={changeTitle} />}
      />
    </>
  )
}

function StaticEntitiesWidgetInput({
  value,
  onChange,
  compact,
}: WidgetTypeInputProps<
  | FixtureWidgetConfig
  | FixtureGroupWidgetConfig
  | MemoryWidgetConfig
  | SequenceWidgetConfig
>) {
  const initialMappingString =
    value.type === 'fixture' || value.type === 'fixture-group'
      ? value.mapping?.join(',')
      : ''

  const [mappingString, setMappingString] = useState(initialMappingString)

  // Needed e.g. for reordering widgets
  const [prevInitialMappingString, setPrevInitialMappingString] =
    useState(initialMappingString)
  if (initialMappingString !== prevInitialMappingString) {
    setPrevInitialMappingString(initialMappingString)
    if (
      !shallowEqual(
        commaStringToArray(initialMappingString),
        commaStringToArray(mappingString)
      )
    ) {
      setMappingString(initialMappingString)
    }
  }

  const changeEntities = (newValue: IdType[]): void =>
    onChange({
      ...value,
      id: newValue,
    })

  const changeMapping = (newValue: string | undefined): void => {
    setMappingString(newValue)
    if (value.type === 'fixture' || value.type === 'fixture-group') {
      onChange({
        ...value,
        mapping: commaStringToArray(newValue),
      })
    }
  }

  return (
    <>
      <Label
        forceSmall={compact}
        label="Entities"
        input={
          <ArrayInput
            value={value.id}
            onChange={changeEntities}
            renderInput={inputProps => (
              <EntityReferenceSelect
                entity={widgetTypes[value.type].entityReference!}
                addUndefinedOption
                {...inputProps}
              />
            )}
            displayRemoveButtons
            sortable
          />
        }
      />
      {(value.type === 'fixture' || value.type === 'fixture-group') && (
        <Label
          forceSmall={compact}
          label="Only channels"
          description="Comma-separated"
          input={<TextInput value={mappingString} onChange={changeMapping} />}
        />
      )}
    </>
  )
}

function LiveEntitiesWidgetInput({
  value,
  onChange,
  compact,
}: WidgetTypeInputProps<
  LiveMemoryWidgetConfig | LiveChaseWidgetConfig | LiveMovementWidgetConfig
>) {
  const state = useApiState(widgetTypes[value.type].stateReference!)

  const changeEntities = (newValue: IdType[]): void =>
    onChange({
      ...value,
      id: newValue,
    })

  const renderInput = useCallback(
    (
      inputProps: TypedInputProps<string> & { excludeValues?: IdType[] }
    ): JSX.Element => (
      <Select
        entries={[
          undefined,
          ...Object.keys(state ?? {})
            .filter(
              id =>
                !inputProps.excludeValues?.includes(id) ||
                id === inputProps.value
            )
            .map(id => {
              const stateReference = state
              return {
                value: id,
                label:
                  typeof stateReference === 'object' &&
                  (stateReference as any)[id] &&
                  (stateReference as any)[id].name
                    ? (stateReference as any)[id].name
                    : id,
              }
            }),
        ]}
        {...inputProps}
      />
    ),
    [state]
  )

  return (
    <Label
      forceSmall={compact}
      label="Entities"
      input={
        <ArrayInput
          value={value.id}
          onChange={changeEntities}
          renderInput={renderInput}
          displayRemoveButtons
          sortable
        />
      }
    />
  )
}

function ButtonsWidgetInput({
  value,
  onChange,
  compact,
}: WidgetTypeInputProps<ButtonsWidgetConfig>) {
  const changeIds = (ids: IdType[]): void => onChange({ ...value, ids })
  const changeTitle = (title: string | undefined): void =>
    onChange({ ...value, title })

  return (
    <>
      <Label
        forceSmall={compact}
        label="Buttons"
        input={
          <ArrayInput
            value={value.ids ?? []}
            onChange={changeIds}
            renderInput={inputProps => (
              <EntityReferenceSelect
                entity="buttons"
                addUndefinedOption
                {...inputProps}
              />
            )}
            displayRemoveButtons
            sortable
          />
        }
      />
      <Label
        forceSmall={compact}
        label="Title"
        input={<TextInput value={value.title} onChange={changeTitle} />}
      />
    </>
  )
}

export interface WidgetInputProps {
  value: WidgetConfig | undefined
  onChange: (value: WidgetConfig) => void

  /** If set, allows deleting the widget. */
  onDelete?: () => void

  /** Content rendered in front of the type select, e.g. a drag handle. */
  headerPrefix?: ReactNode

  /**
   * If set, always displays labels above their inputs
   * to save horizontal space.
   *
   * Defaults to `false`.
   */
  compact?: boolean

  className?: string
}

/**
 * Input to select a widget with.
 */
export const WidgetInput = ({
  value,
  onChange,
  onDelete,
  headerPrefix,
  compact,
  className,
}: WidgetInputProps) => {
  const onChangeType = (newValue: WidgetConfig['type'] | undefined): void => {
    if (!newValue) return
    onChange(widgetTypes[newValue].defaultValueFactory())
  }

  const onDeleteInternal = (event?: { stopPropagation: () => void }) => {
    event?.stopPropagation()
    onDelete?.()
  }

  return (
    <div className={cx(container, className)}>
      <div className={cx(flexContainer, header)}>
        {headerPrefix}
        <Select
          aria-label="Widget type"
          entries={typeSelectEntries}
          value={value?.type}
          onChange={onChangeType}
        />
        {onDelete && (
          <Button
            icon={iconDelete}
            title="Remove widget"
            transparent
            onClick={onDeleteInternal}
          />
        )}
      </div>

      {(value?.type === 'universe' || value?.type === 'channels') && (
        <UniverseChannelWidgetInput
          value={value}
          onChange={onChange}
          compact={compact}
        />
      )}

      {(value?.type === 'fixture' ||
        value?.type === 'fixture-group' ||
        value?.type === 'memory' ||
        value?.type === 'sequence') && (
        <StaticEntitiesWidgetInput
          value={value}
          onChange={onChange}
          compact={compact}
        />
      )}

      {(value?.type === 'live-memory' ||
        value?.type === 'live-chase' ||
        value?.type === 'live-movement') && (
        <LiveEntitiesWidgetInput
          value={value}
          onChange={onChange}
          compact={compact}
        />
      )}

      {value?.type === 'buttons' && (
        <ButtonsWidgetInput
          value={value}
          onChange={onChange}
          compact={compact}
        />
      )}
    </div>
  )
}
