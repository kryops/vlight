import { EntityName, WidgetConfig } from '@vlight/types'
import { css } from '@linaria/core'
import { ensureBetween } from '@vlight/utils'

import { baseline, primaryShade } from '../styles'
import { cx } from '../../util/styles'
import { iconDelete } from '../icons'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { Button } from '../buttons/button'
import { flexContainer } from '../css/flex'

import { Label } from './label'
import { Select, SelectEntry } from './select'
import { NumberInput, TextInput } from './typed-input'
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
export function WidgetInput({
  value,
  onChange,
  onDelete,
  className,
}: WidgetInputProps) {
  return (
    <div className={cx(container, className)}>
      <div className={flexContainer}>
        <Select
          entries={typeSelectEntries}
          value={value?.type}
          onChange={newValue => {
            if (!newValue) return
            onChange(widgetTypes[newValue].defaultValueFactory())
          }}
        />
        {onDelete && (
          <Button
            icon={iconDelete}
            title="Remove widget"
            transparent
            onClick={event => {
              event?.stopPropagation()
              onDelete()
            }}
          />
        )}
      </div>

      {(value?.type === 'universe' || value?.type === 'channels') && (
        <>
          <Label
            label="From"
            input={
              <NumberInput
                value={value.from}
                onChange={newValue =>
                  onChange({
                    ...value,
                    from: ensureBetween(newValue ?? 1, 1, 512),
                  })
                }
                min={1}
                max={512}
              />
            }
          />
          <Label
            label="To"
            input={
              <NumberInput
                value={value.to}
                onChange={newValue =>
                  onChange({
                    ...value,
                    to: ensureBetween(newValue ?? 512, 1, 512),
                  })
                }
                min={1}
                max={512}
              />
            }
          />
          <Label
            label="Title"
            input={
              <TextInput
                value={value.title}
                onChange={newValue =>
                  onChange({
                    ...value,
                    title: newValue,
                  })
                }
              />
            }
          />
        </>
      )}

      {(value?.type === 'fixture' ||
        value?.type === 'fixture-group' ||
        value?.type === 'memory') && (
        <Label
          label="Entities"
          input={
            <ArrayInput
              value={value.id}
              onChange={newValue =>
                onChange({
                  ...value,
                  id: newValue,
                })
              }
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
      )}

      {(value?.type === 'live-memory' || value?.type === 'live-chase') && (
        <Label
          label="Entities"
          input={
            <ArrayInput
              value={value.id}
              onChange={newValue =>
                onChange({
                  ...value,
                  id: newValue,
                })
              }
              renderInput={inputProps => (
                <Select
                  entries={[
                    undefined,
                    ...Object.keys(
                      apiState[widgetTypes[value.type].stateReference!] ?? {}
                    ).map(id => {
                      const stateReference =
                        apiState[widgetTypes[value.type].stateReference!]
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
              )}
              displayRemoveButtons
            />
          }
        />
      )}
    </div>
  )
}
