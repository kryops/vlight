import { css } from '@linaria/core'
import { memo } from 'react'
import { DynamicPageRow } from '@vlight/types'
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd'

import { useFormState, useFormStateArray } from '../../../../hooks/form'
import { FormTextInput } from '../../../../ui/forms/form-input'
import { EntityEditorProps } from '../types'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { iconAdd } from '../../../../ui/icons'
import { newDynamicPageFactory } from '../new-entity-factories'
import { Button } from '../../../../ui/buttons/button'
import { backgroundColor, baseline, primaryShade } from '../../../../ui/styles'
import { cx } from '../../../../util/styles'

import {
  DynamicPageRowEditor,
  RowUpdater,
  widgetDragType,
  widgetDroppablePrefix,
} from './dynamic-page-row-editor'

const rowDragType = 'row'

const rowStyle = css`
  padding: ${baseline(2)};
  margin-bottom: ${baseline(4)};
  border: 1px solid ${primaryShade(1)};
  background: ${backgroundColor};
`

const rowStyle_dragging = css`
  border-color: ${primaryShade(0)};
  box-shadow: 0 ${baseline(2)} ${baseline(8)} rgba(0, 0, 0, 0.6);
`

const rowList = css`
  margin: ${baseline(4)} 0;
`

function moveEntry<T>(entries: T[], from: number, to: number): T[] {
  const result = [...entries]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

function getRowIndex(droppableId: string): number {
  return Number(droppableId.slice(widgetDroppablePrefix.length))
}

/**
 * Moves a widget within a row or between rows.
 */
function moveWidget(
  rows: DynamicPageRow[],
  { source, destination }: DropResult
): DynamicPageRow[] {
  if (!destination) return rows
  const sourceRowIndex = getRowIndex(source.droppableId)
  const destinationRowIndex = getRowIndex(destination.droppableId)

  if (sourceRowIndex === destinationRowIndex) {
    return rows.map((row, index) =>
      index === sourceRowIndex
        ? {
            ...row,
            widgets: moveEntry(row.widgets, source.index, destination.index),
          }
        : row
    )
  }

  const widget = rows[sourceRowIndex].widgets[source.index]
  return rows.map((row, index) => {
    if (index === sourceRowIndex) {
      return {
        ...row,
        widgets: row.widgets.filter((_, i) => i !== source.index),
      }
    }
    if (index === destinationRowIndex) {
      const widgets = [...row.widgets]
      widgets.splice(destination.index, 0, widget)
      return { ...row, widgets }
    }
    return row
  })
}

interface DraggableRowProps {
  row: DynamicPageRow
  rowIndex: number
  onUpdate: RowUpdater
  onRemove: (rowIndex: number) => void
}

/**
 * A single draggable row.
 *
 * Extracted into a separate component so that it is only re-rendered
 * when its own props change.
 */
const DraggableRow = memo(function DraggableRow({
  row,
  rowIndex,
  onUpdate,
  onRemove,
}: DraggableRowProps) {
  return (
    <Draggable draggableId={`row-${rowIndex}`} index={rowIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cx(rowStyle, snapshot.isDragging && rowStyle_dragging)}
        >
          <DynamicPageRowEditor
            row={row}
            rowIndex={rowIndex}
            dragHandleProps={provided.dragHandleProps}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </div>
      )}
    </Draggable>
  )
})

interface RowListProps {
  rows: DynamicPageRow[]
  onUpdate: RowUpdater
  onRemove: (rowIndex: number) => void
}

/**
 * The draggable rows of the page.
 *
 * Extracted into a separate component so that the Droppable's drag state
 * changes do not re-render all rows (see the @hello-pangea/dnd docs).
 */
const RowList = ({ rows, onUpdate, onRemove }: RowListProps) => (
  <>
    {rows.map((row, rowIndex) => (
      <DraggableRow
        key={rowIndex}
        row={row}
        rowIndex={rowIndex}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    ))}
  </>
)

export interface DynamicPageEditProps extends EntityEditorProps<'dynamicPages'> {
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

  const addRow = () => rows.add(newDynamicPageFactory().rows[0])

  // only depend on the stable updater, so that the row callbacks do not
  // change on every edit (which would re-render all rows)
  const { updateValue } = formState

  const updateRow: RowUpdater = (rowIndex, updater) =>
    updateValue('rows', oldRows =>
      oldRows.map((it, index) => (index === rowIndex ? updater(it) : it))
    )

  const removeRow = (rowIndex: number) =>
    updateValue('rows', oldRows =>
      oldRows.filter((_, index) => index !== rowIndex)
    )

  const onDragEnd = (result: DropResult) => {
    const { type, source, destination } = result
    if (!destination) return
    if (type === rowDragType) {
      if (source.index === destination.index) return
      rows.overwrite(moveEntry(rows.value, source.index, destination.index))
    } else if (type === widgetDragType) {
      rows.overwrite(moveWidget(rows.value, result))
    }
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rows" type={rowDragType}>
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={rowList}
            >
              <RowList
                rows={rows.value}
                onUpdate={updateRow}
                onRemove={removeRow}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button icon={iconAdd} block onClick={addRow}>
        Add row
      </Button>
    </>
  )
}
