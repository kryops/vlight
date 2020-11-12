import { EntityName, WidgetConfig } from '@vlight/types'
import { css } from 'linaria'
import { ensureBetween } from '@vlight/utils'

import { baseline, primaryShade } from '../styles'
import { cx } from '../../util/styles'
import { Icon } from '../icons/icon'
import { iconDelete } from '../icons'
import { apiState } from '../../api/api-state'

import { Label } from './label'
import { Select, SelectEntry } from './select'
import { NumberInput, TextInput } from './typed-input'
import { EntityReferenceSelect } from './entity-reference-select'

type WidgetType = WidgetConfig['type']
type WidgetOfType<T extends WidgetType> = Extract<WidgetConfig, { type: T }>

interface WidgetMapping<T extends WidgetType> {
  name: string
  defaultValueFactory: () => WidgetOfType<T>
  entityReference?: EntityName
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
  map: {
    name: 'Map',
    defaultValueFactory: () => ({
      type: 'map',
    }),
  },
}

const typeSelectEntries: SelectEntry<WidgetType>[] = Object.entries(
  widgetTypes
).map(([key, value]) => ({ value: key as WidgetType, label: value.name }))

const container = css`
  padding: ${baseline(2)};
  margin: ${baseline()} ${baseline(-2)};
  background: ${primaryShade(2)};
  cursor: pointer;
`

const deleteIcon = css`
  float: right;
  padding: ${baseline(2)};
  margin: ${baseline(-2)};
  margin-left: 0;
`

export interface WidgetInputProps {
  value: WidgetConfig | undefined
  onChange: (value: WidgetConfig) => void
  onDelete?: () => void
  className?: string
}

export function WidgetInput({
  value,
  onChange,
  onDelete,
  className,
}: WidgetInputProps) {
  return (
    <div className={cx(container, className)}>
      {onDelete && (
        <Icon
          icon={iconDelete}
          className={deleteIcon}
          hoverable
          inline
          onClick={event => {
            event.stopPropagation()
            onDelete()
          }}
        />
      )}
      <Label
        label="Type"
        input={
          <Select
            entries={typeSelectEntries}
            value={value?.type}
            onChange={newValue => {
              if (!newValue) return
              onChange(widgetTypes[newValue].defaultValueFactory())
            }}
          />
        }
      />

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
        <>
          <Label
            label="Entity"
            input={
              <EntityReferenceSelect
                entity={widgetTypes[value.type].entityReference!}
                value={value.id}
                onChange={newValue =>
                  onChange({
                    ...value,
                    id: newValue ?? '',
                  })
                }
              />
            }
          />
        </>
      )}
    </div>
  )
}
