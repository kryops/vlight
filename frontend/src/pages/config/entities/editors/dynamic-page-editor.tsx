import React from 'react'
import { css } from 'linaria'
import {
  DynamicPageCell,
  DynamicPageRow,
  MasterDataMaps,
  WidgetConfig,
} from '@vlight/types'
import { assertNever } from '@vlight/utils'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline, primaryShade } from '../../../../ui/styles'
import { useClassNames } from '../../../../hooks/ui'
import { TextInput } from '../../../../ui/forms/typed-input'
import { useMasterDataMaps } from '../../../../hooks/api'

function getWidgetDisplayString(
  widget: WidgetConfig,
  masterDataMaps: MasterDataMaps
) {
  const titlePrefix =
    'title' in widget && widget.title ? `${widget.title}: ` : ''

  const { fixtures, fixtureGroups, memories } = masterDataMaps

  switch (widget.type) {
    case 'universe':
      return `${titlePrefix}Universe ${widget.from} - ${widget.to}`

    case 'channels':
      return `${titlePrefix}Channels ${widget.from} - ${widget.to}`

    case 'fixture':
      return `${titlePrefix}Fixture ${
        fixtures.get(widget.id)?.name ?? widget.id
      }`

    case 'fixture-group':
      return `${titlePrefix}Group ${
        fixtureGroups.get(widget.id)?.name ?? widget.id
      }`

    case 'memory':
      return `${titlePrefix}Memory ${
        memories.get(widget.id)?.name ?? widget.id
      }`

    case 'map':
      return `${titlePrefix}Map`

    default:
      assertNever(widget)
  }

  return JSON.stringify(widget)
}

const rowStyle = css`
  padding: ${baseline(2)};
  margin: ${baseline(2)} ${baseline(-2)};
  border: 1px solid ${primaryShade(1)};
`

const rowStyle_light = css`
  border-color: ${primaryShade(2, true)};
`

const cellStyle = css`
  padding: ${baseline(2)};
  margin: ${baseline()} ${baseline(-2)};
  background: ${primaryShade(2)};
`

const cellStyle_light = css`
  background: ${primaryShade(3, true)};
`

const cellDeleteIcon = css`
  float: right;
`

export function DynamicPageEditor({
  entry,
  onChange,
}: EntityEditorProps<'dynamicPages'>) {
  const formState = useFormState(entry, { onChange })
  const rows = useFormStateArray(formState, 'rows')
  const masterDataMaps = useMasterDataMaps()

  const [rowClassName, cellClassName] = useClassNames(
    [rowStyle, rowStyle_light],
    [cellStyle, cellStyle_light]
  )

  function changeRowProperty<TKey extends keyof DynamicPageRow>(
    row: DynamicPageRow,
    key: TKey,
    value: DynamicPageRow[TKey]
  ) {
    rows.update(row, { ...row, [key]: value })
  }

  function changeCellProperty<TKey extends keyof DynamicPageCell>(
    row: DynamicPageRow,
    cell: DynamicPageCell,
    key: TKey,
    value: DynamicPageCell[TKey]
  ) {
    changeRowProperty(
      row,
      'cells',
      row.cells.map(it => (it === cell ? { ...it, [key]: value } : it))
    )
  }

  return (
    <>
      <h2 className={editorTitle}>{entry.id ? 'Edit' : 'Add'} Dynamic Page</h2>
      <Label
        label="Name"
        input={<FormTextInput formState={formState} name="name" />}
      />
      <Label
        label="Headline"
        input={<FormTextInput formState={formState} name="headline" />}
      />
      <Label
        label="Icon"
        input={<FormTextInput formState={formState} name="icon" />}
        description={
          <>
            Use an icon name from{' '}
            <a
              href="https://materialdesignicons.com/"
              target="_blank"
              rel="noreferrer"
            >
              https://materialdesignicons.com/
            </a>{' '}
            prefixed with &quot;mdi&quot; and converted to camelCase, e.g.
            &quot;mdiAirplaneLanding&quot;
          </>
        }
      />
      {rows.value.map((row, rowIndex) => (
        <div key={rowIndex} className={rowClassName}>
          <Label
            label="Headline"
            input={
              <TextInput
                value={row.headline}
                onChange={newValue =>
                  changeRowProperty(row, 'headline', newValue)
                }
              />
            }
          />
          {row.cells.map((cell, cellIndex) => (
            <div key={cellIndex} className={cellClassName}>
              <div className={cellDeleteIcon}>
                {cell.factor && `x${cell.factor}`}
                <Icon
                  icon={iconDelete}
                  hoverable
                  inline
                  onClick={() =>
                    changeRowProperty(
                      row,
                      'cells',
                      row.cells.filter(it => it !== cell)
                    )
                  }
                />
              </div>
              {cell.widgets.map((widget, widgetIndex) => (
                <p key={widgetIndex}>
                  {getWidgetDisplayString(widget, masterDataMaps)}
                </p>
              ))}
              {cell.widgets.length === 0 && (
                <p>
                  <i>(empty)</i>
                </p>
              )}
            </div>
          ))}
          <a
            onClick={() =>
              changeRowProperty(row, 'cells', [
                ...row.cells,
                entityUiMapping.dynamicPages.newEntityFactory!().rows[0]
                  .cells[0],
              ])
            }
          >
            <Icon icon={iconAdd} inline /> Add cell
          </a>
          &nbsp; &nbsp;
          <a onClick={() => rows.remove(row)}>
            <Icon icon={iconDelete} inline /> Remove row
          </a>
        </div>
      ))}
      <a
        onClick={() =>
          rows.add(entityUiMapping.dynamicPages.newEntityFactory!().rows[0])
        }
      >
        <Icon icon={iconAdd} inline /> Add row
      </a>
    </>
  )
}
