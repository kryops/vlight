import {
  ChannelsWidgetConfig,
  EntityName,
  FixtureGroupWidgetConfig,
  FixtureWidgetConfig,
  IdType,
  LiveChaseWidgetConfig,
  LiveMemoryWidgetConfig,
  MemoryWidgetConfig,
  UniverseWidgetConfig,
  WidgetConfig,
} from '@vlight/types'
import { css } from '@linaria/core'
import { ensureBetween } from '@vlight/utils'
import { useCallback } from 'react'

import { baseline, primaryShade } from '../styles'
import { cx } from '../../util/styles'
import { iconDelete } from '../icons'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { Button } from '../buttons/button'
import { flexContainer } from '../css/flex'
import { useEvent } from '../../hooks/performance'
import { memoInProduction } from '../../util/development'
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
}

const typeSelectEntries: SelectEntry<WidgetType>[] = Object.entries(
  widgetTypes
).map(([key, value]) => ({ value: key as WidgetType, label: value.name }))

const container = css`
  padding: ${baseline(2)};
  margin: ${baseline()} 0;
  background: ${primaryShade(2)};
  cursor: pointer;
`

interface WidgetTypeInputProps<T> {
  value: T
  onChange: (value: T) => void
}

function UniverseChannelWidgetInput({
  value,
  onChange,
}: WidgetTypeInputProps<UniverseWidgetConfig | ChannelsWidgetConfig>) {
  const changeFrom = useEvent((newValue: number | undefined): void =>
    onChange({
      ...value,
      from: ensureBetween(newValue ?? 1, 1, 512),
    })
  )
  const changeTo = useEvent((newValue: number | undefined): void =>
    onChange({
      ...value,
      to: ensureBetween(newValue ?? 512, 1, 512),
    })
  )
  const changeTitle = useEvent((newValue: string | undefined): void =>
    onChange({
      ...value,
      title: newValue,
    })
  )

  return (
    <>
      <Label
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
        label="To"
        input={
          <NumberInput value={value.to} onChange={changeTo} min={1} max={512} />
        }
      />
      <Label
        label="Title"
        input={<TextInput value={value.title} onChange={changeTitle} />}
      />
    </>
  )
}

function StaticEntitiesWidgetInput({
  value,
  onChange,
}: WidgetTypeInputProps<
  FixtureWidgetConfig | FixtureGroupWidgetConfig | MemoryWidgetConfig
>) {
  const changeEntities = useEvent((newValue: IdType[]): void =>
    onChange({
      ...value,
      id: newValue,
    })
  )

  return (
    <Label
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
        />
      }
    />
  )
}

function LiveEntitiesWidgetInput({
  value,
  onChange,
}: WidgetTypeInputProps<LiveMemoryWidgetConfig | LiveChaseWidgetConfig>) {
  const state = useApiState(widgetTypes[value.type].stateReference!)

  const changeEntities = useEvent((newValue: IdType[]): void =>
    onChange({
      ...value,
      id: newValue,
    })
  )

  const renderInput = useCallback(
    (inputProps: TypedInputProps<string>): JSX.Element => (
      <Select
        entries={[
          undefined,
          ...Object.keys(state ?? {}).map(id => {
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
      label="Entities"
      input={
        <ArrayInput
          value={value.id}
          onChange={changeEntities}
          renderInput={renderInput}
          displayRemoveButtons
        />
      }
    />
  )
}

export interface WidgetInputProps {
  value: WidgetConfig | undefined
  onChange: (value: WidgetConfig) => void

  /** If set, allows deleting the widget. */
  onDelete?: () => void

  className?: string
}

/**
 * Input to select a widget with.
 */
export const WidgetInput = memoInProduction(
  ({ value, onChange, onDelete, className }: WidgetInputProps) => {
    const onChangeType = useEvent(
      (newValue: WidgetConfig['type'] | undefined): void => {
        if (!newValue) return
        onChange(widgetTypes[newValue].defaultValueFactory())
      }
    )

    const onDeleteInternal = useEvent(
      (event?: { stopPropagation: () => void }) => {
        event?.stopPropagation()
        onDelete?.()
      }
    )

    return (
      <div className={cx(container, className)}>
        <div className={flexContainer}>
          <Select
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
          <UniverseChannelWidgetInput value={value} onChange={onChange} />
        )}

        {(value?.type === 'fixture' ||
          value?.type === 'fixture-group' ||
          value?.type === 'memory') && (
          <StaticEntitiesWidgetInput value={value} onChange={onChange} />
        )}

        {(value?.type === 'live-memory' || value?.type === 'live-chase') && (
          <LiveEntitiesWidgetInput value={value} onChange={onChange} />
        )}
      </div>
    )
  }
)
