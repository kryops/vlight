import { css } from '@linaria/core'
import {
  Dictionary,
  DynamicPageCell,
  DynamicPageRow,
  LiveChase,
  LiveMemory,
  MasterDataMaps,
  WidgetConfig,
} from '@vlight/types'
import { assertNever, toArray } from '@vlight/utils'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { iconAdd, iconDelete, iconDown, iconUp } from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline, primaryShade } from '../../../../ui/styles'
import { TextInput } from '../../../../ui/forms/typed-input'
import { useApiState, useMasterDataMaps } from '../../../../hooks/api'
import { showDialogWithReturnValue } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import { SortableList } from '../../../../ui/containers/sortable-list'
import { newDynamicPageFactory } from '../new-entity-factories'

import { DynamicPageCellEditor } from './dynamic-page-cell-editor'

function getWidgetDisplayString(
  widget: WidgetConfig,
  masterDataMaps: MasterDataMaps,
  liveChases: Dictionary<LiveChase>,
  liveMemories: Dictionary<LiveMemory>
) {
  const titlePrefix =
    'title' in widget && widget.title ? `${widget.title}: ` : ''

  const { fixtures, fixtureGroups, memories } = masterDataMaps

  switch (widget.type) {
    case 'universe':
      return `${titlePrefix}Universe ${widget.from} - ${widget.to}`

    case 'channels':
      return `${titlePrefix}Channels ${widget.from} - ${widget.to}`

    case 'fixture': {
      const name = toArray(widget.id)
        .map(id => fixtures.get(id)?.name ?? id)
        .join(', ')
      return `${titlePrefix}Fixture ${name}`
    }

    case 'fixture-group': {
      const name = toArray(widget.id)
        .map(id => fixtureGroups.get(id)?.name ?? id)
        .join(', ')
      return `${titlePrefix}Group ${name}`
    }

    case 'memory': {
      const name = toArray(widget.id)
        .map(id => memories.get(id)?.name ?? id)
        .join(', ')
      return `${titlePrefix}Memory ${name}`
    }

    case 'live-memory': {
      const name = toArray(widget.id)
        .map(id => liveMemories[id]?.name ?? id)
        .join(', ')
      return `${titlePrefix}Live Memory ${name}`
    }

    case 'live-chase': {
      const name = toArray(widget.id)
        .map(id => liveChases[id]?.name ?? id)
        .join(', ')
      return `${titlePrefix}Live Chase ${name}`
    }

    case 'map':
      return `${titlePrefix}Map`

    case 'dmx-master':
      return `${titlePrefix}DMX Master`

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

const cellStyle = css`
  padding: ${baseline(2)};
  margin: ${baseline()} ${baseline(-2)};
  background: ${primaryShade(2)};
  cursor: pointer;
`

const cellDeleteContainer = css`
  float: right;
  margin-left: ${baseline(3)};
`

const cellDeleteIcon = css`
  padding: ${baseline(2)};
  margin: ${baseline(-2)};
`

const paragraph = css`
  margin: ${baseline()} 0;
`

/**
 * Dialog content to edit a dynamic page.
 *
 * TODO improve UI/UX
 */
export function DynamicPageEditor({
  entry,
  onChange,
}: EntityEditorProps<'dynamicPages'>) {
  const formState = useFormState(entry, { onChange })
  const rows = useFormStateArray(formState, 'rows')
  const masterDataMaps = useMasterDataMaps()
  const liveChases = useApiState('liveChases')
  const liveMemories = useApiState('liveMemories')

  function changeRowProperty<TKey extends keyof DynamicPageRow>(
    row: DynamicPageRow,
    key: TKey,
    value: DynamicPageRow[TKey]
  ) {
    rows.update(row, { ...row, [key]: value })
  }

  function moveRow(rowIndex: number, offset: 1 | -1) {
    const newRows = [...rows.value]
    const row = newRows[rowIndex]
    newRows[rowIndex] = newRows[rowIndex + offset]
    newRows[rowIndex + offset] = row
    formState.changeValue('rows', newRows)
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
        <div key={rowIndex} className={rowStyle}>
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
          <SortableList
            entries={row.cells}
            onChange={newCells => changeRowProperty(row, 'cells', newCells)}
            entryClassName={cellStyle}
            renderEntryContent={cell => (
              <div
                onClick={async () => {
                  const result =
                    await showDialogWithReturnValue<DynamicPageCell>(
                      onChange => (
                        <DynamicPageCellEditor
                          cell={cell}
                          onChange={onChange}
                        />
                      ),
                      okCancel,
                      { showCloseButton: true }
                    )
                  if (result)
                    changeRowProperty(
                      row,
                      'cells',
                      row.cells.map(it => (it === cell ? result : it))
                    )
                }}
              >
                <div className={cellDeleteContainer}>
                  {cell.factor && `x${cell.factor}`}
                  <Icon
                    icon={iconDelete}
                    className={cellDeleteIcon}
                    hoverable
                    inline
                    onClick={event => {
                      event.stopPropagation()
                      changeRowProperty(
                        row,
                        'cells',
                        row.cells.filter(it => it !== cell)
                      )
                    }}
                  />
                </div>
                {cell.widgets.map((widget, widgetIndex) => (
                  <p key={widgetIndex} className={paragraph}>
                    {getWidgetDisplayString(
                      widget,
                      masterDataMaps,
                      liveChases,
                      liveMemories
                    )}
                  </p>
                ))}
                {cell.widgets.length === 0 && (
                  <p className={paragraph}>
                    <i>(empty)</i>
                  </p>
                )}
              </div>
            )}
          />
          <a
            onClick={() =>
              changeRowProperty(row, 'cells', [...row.cells, { widgets: [] }])
            }
          >
            <Icon icon={iconAdd} inline /> Add cell
          </a>
          &nbsp; &nbsp;
          <a onClick={() => rows.remove(row)}>
            <Icon icon={iconDelete} inline /> Remove row
          </a>
          {rowIndex > 0 && (
            <>
              &nbsp; &nbsp;
              <a onClick={() => moveRow(rowIndex, -1)}>
                <Icon icon={iconUp} inline /> Move up
              </a>
            </>
          )}
          {rowIndex < rows.value.length - 1 && (
            <>
              &nbsp; &nbsp;
              <a onClick={() => moveRow(rowIndex, 1)}>
                <Icon icon={iconDown} inline /> Move down
              </a>
            </>
          )}
        </div>
      ))}
      <a onClick={() => rows.add(newDynamicPageFactory().rows[0])}>
        <Icon icon={iconAdd} inline /> Add row
      </a>
    </>
  )
}
