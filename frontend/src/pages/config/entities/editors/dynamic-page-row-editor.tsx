import { css } from '@linaria/core'
import {
  Dictionary,
  DynamicPage,
  DynamicPageCell,
  DynamicPageRow,
  LiveChase,
  LiveMemory,
  MasterDataMaps,
  WidgetConfig,
} from '@vlight/types'
import { assertNever, toArray } from '@vlight/utils'
import { useCallback } from 'react'

import { FormState, useFormStateArray } from '../../../../hooks/form'
import { iconAdd, iconDelete, iconDown, iconUp } from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline, primaryShade } from '../../../../ui/styles'
import { TextInput } from '../../../../ui/forms/typed-input'
import { useApiState, useMasterDataMaps } from '../../../../hooks/api'
import { showDialogWithReturnValue } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import { SortableList } from '../../../../ui/containers/sortable-list'
import { useBreakpoint } from '../../../../ui/hooks/breakpoint'
import { Button } from '../../../../ui/buttons/button'
import { flexContainer } from '../../../../ui/css/flex'
import { cx } from '../../../../util/styles'
import { useEvent } from '../../../../hooks/performance'
import { memoInProduction } from '../../../../util/development'

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
  padding-bottom: 0;
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

export interface DynamicPageRowEditorProps {
  row: DynamicPageRow
  rowIndex: number
  formState: FormState<DynamicPage>
}

export const DynamicPageRowEditor = memoInProduction(
  ({ row, rowIndex, formState }: DynamicPageRowEditorProps) => {
    const masterDataMaps = useMasterDataMaps()
    const liveChases = useApiState('liveChases')
    const liveMemories = useApiState('liveMemories')

    const rows = useFormStateArray(formState, 'rows')

    const isLarge = useBreakpoint(600)

    function changeRowProperty<TKey extends keyof DynamicPageRow>(
      row: DynamicPageRow,
      key: TKey,
      value: DynamicPageRow[TKey]
    ) {
      rows.update(row, { ...row, [key]: value })
    }

    function moveRow(offset: 1 | -1) {
      const newRows = [...rows.value]
      const row = newRows[rowIndex]
      newRows[rowIndex] = newRows[rowIndex + offset]
      newRows[rowIndex + offset] = row
      formState.changeValue('rows', newRows)
    }

    const changeCells = useEvent((newCells: DynamicPageCell[]) =>
      changeRowProperty(row, 'cells', newCells)
    )

    const changeCell = useEvent(
      (cell: DynamicPageCell, changes: DynamicPageCell) => {
        changeRowProperty(
          row,
          'cells',
          row.cells.map(it => (it === cell ? changes : it))
        )
      }
    )

    const removeCell = useEvent((cell: DynamicPageCell) => {
      changeRowProperty(
        row,
        'cells',
        row.cells.filter(it => it !== cell)
      )
    })

    const addCell = useEvent(async () => {
      const initialValue: DynamicPageCell = {
        widgets: [{ type: 'map' }],
      }
      const result = await showDialogWithReturnValue<DynamicPageCell>(
        onChange => (
          <DynamicPageCellEditor cell={initialValue} onChange={onChange} />
        ),
        okCancel,
        { showCloseButton: true, initialValue }
      )
      if (result) changeRowProperty(row, 'cells', [...row.cells, result])
    })

    const renderCellContent = useCallback(
      (cell: DynamicPageCell) => (
        <div
          onClick={async () => {
            const result = await showDialogWithReturnValue<DynamicPageCell>(
              onChange => (
                <DynamicPageCellEditor cell={cell} onChange={onChange} />
              ),
              okCancel,
              { showCloseButton: true }
            )
            if (result) changeCell(cell, result)
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
                  removeCell(cell)
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
      ),
      [
        row.cells.length,
        changeCell,
        removeCell,
        masterDataMaps,
        liveChases,
        liveMemories,
      ]
    )

    const removeRow = useEvent(() => rows.remove(row))
    const changeHeadline = useEvent((newValue: string | undefined): void =>
      changeRowProperty(row, 'headline', newValue)
    )
    const moveDown = useEvent(() => moveRow(1))
    const moveUp = useEvent(() => moveRow(-1))

    return (
      <div className={rowStyle}>
        <div className={flexContainer}>
          {rowIndex > 0 && (
            <Button
              icon={iconUp}
              transparent
              onClick={moveUp}
              title="Move up"
            />
          )}
          {rowIndex < rows.value.length - 1 && (
            <Button
              icon={iconDown}
              transparent
              onClick={moveDown}
              title="Move down"
            />
          )}
          <TextInput value={row.headline} onChange={changeHeadline} />
          <Button
            icon={iconDelete}
            transparent
            onClick={removeRow}
            title="Remove row"
          />
        </div>
        <div className={cx(cellsContainer, isLarge && flexContainer)}>
          {row.cells.length > 0 && (
            <SortableList
              direction={isLarge ? 'horizontal' : 'vertical'}
              entries={row.cells}
              onChange={changeCells}
              entryClassName={cellStyle}
              containerClassName={isLarge ? horizontalCellContainer : undefined}
              renderEntryContent={renderCellContent}
            />
          )}
          <Button
            icon={iconAdd}
            className={addCellButton}
            title="Add cell"
            onClick={addCell}
          />
        </div>
      </div>
    )
  }
)
