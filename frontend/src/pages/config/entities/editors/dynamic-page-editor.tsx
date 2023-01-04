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
import { useBreakpoint } from '../../../../ui/hooks/breakpoint'
import { Button } from '../../../../ui/buttons/button'
import { flexContainer } from '../../../../ui/css/flex'
import { cx } from '../../../../util/styles'

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
  padding: ${baseline(2)} 0;
  margin: ${baseline(2)} ${baseline(-2)};
  border: 1px solid ${primaryShade(1)};
`

const cellsContainer = css`
  margin: ${baseline(2)} ${baseline(-1)};
`

const horizontalCellContainer = css`
  display: flex;
  flex: 1 1 auto;
`

const addCellButton = css`
  margin: ${baseline()};
  display: flex;
  align-items: center;
  justify-content: center;
`

const cellStyle = css`
  flex: 1 1 0;
  padding: ${baseline(2)};
  margin: ${baseline()};
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

export interface DynamicPageEditProps
  extends EntityEditorProps<'dynamicPages'> {
  inline?: boolean
}

/**
 * Dialog content to edit a dynamic page.
 */
export function DynamicPageEditor({
  entry,
  onChange,
  inline,
}: DynamicPageEditProps) {
  const formState = useFormState(entry, { onChange })
  const rows = useFormStateArray(formState, 'rows')
  const masterDataMaps = useMasterDataMaps()
  const liveChases = useApiState('liveChases')
  const liveMemories = useApiState('liveMemories')

  const isLarge = useBreakpoint(600)

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
      {!inline && (
        <h2 className={editorTitle}>
          {entry.id ? 'Edit' : 'Add'} Dynamic Page
        </h2>
      )}
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
          <div className={flexContainer}>
            {rowIndex > 0 && (
              <Button
                icon={iconUp}
                transparent
                onClick={() => moveRow(rowIndex, -1)}
                title="Move up"
              />
            )}
            {rowIndex < rows.value.length - 1 && (
              <Button
                icon={iconDown}
                transparent
                onClick={() => moveRow(rowIndex, 1)}
                title="Move down"
              />
            )}
            <TextInput
              value={row.headline}
              onChange={newValue =>
                changeRowProperty(row, 'headline', newValue)
              }
            />
            <Button
              icon={iconDelete}
              transparent
              onClick={() => rows.remove(row)}
              title="Remove row"
            />
          </div>
          <div className={cx(cellsContainer, isLarge && flexContainer)}>
            {row.cells.length > 0 && (
              <SortableList
                direction={isLarge ? 'horizontal' : 'vertical'}
                entries={row.cells}
                onChange={newCells => changeRowProperty(row, 'cells', newCells)}
                entryClassName={cellStyle}
                containerClassName={
                  isLarge ? horizontalCellContainer : undefined
                }
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
                      {row.cells.length > 1 && (
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
                      )}
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
            )}
            <Button
              icon={iconAdd}
              className={addCellButton}
              title="Add cell"
              onClick={async () => {
                const initialValue: DynamicPageCell = {
                  widgets: [{ type: 'map' }],
                }
                const result = await showDialogWithReturnValue<DynamicPageCell>(
                  onChange => (
                    <DynamicPageCellEditor
                      cell={initialValue}
                      onChange={onChange}
                    />
                  ),
                  okCancel,
                  { showCloseButton: true, initialValue }
                )
                if (result)
                  changeRowProperty(row, 'cells', [...row.cells, result])
              }}
            />
          </div>
        </div>
      ))}
      <Button
        icon={iconAdd}
        block
        onClick={() => rows.add(newDynamicPageFactory().rows[0])}
      >
        Add row
      </Button>
    </>
  )
}
