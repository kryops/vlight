import { css } from '@linaria/core'
import { memo, useEffect, useRef } from 'react'
import { DynamicPageRow, WidgetConfig } from '@vlight/types'
import {
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
} from '@hello-pangea/dnd'

import { iconAdd, iconDelete, iconDrag } from '../../../../ui/icons'
import { Icon } from '../../../../ui/icons/icon'
import { baseline, primaryShade } from '../../../../ui/styles'
import { TextInput } from '../../../../ui/forms/typed-input'
import { WidgetInput, widgetTypes } from '../../../../ui/forms/widget-input'
import { Button } from '../../../../ui/buttons/button'
import { cx } from '../../../../util/styles'

/** Type of the drag & drop operation to move widgets. */
export const widgetDragType = 'widget'

/** Droppable ID prefix of the widget list of a row. */
export const widgetDroppablePrefix = 'row-widgets-'

const rowHeader = css`
  display: flex;
  align-items: center;
  gap: ${baseline()};
`

const dragHandle = css`
  flex: 0 0 auto;
  padding: ${baseline()};
  cursor: grab;
  touch-action: none;
`

const widgetArea = css`
  display: flex;
  align-items: flex-start;
  gap: ${baseline()};
  margin-top: ${baseline(2)};
`

const widgetList = css`
  display: flex;
  align-items: flex-start;
  flex: 1 1 auto;
  min-width: 0;
  min-height: ${baseline(16)};
  overflow-x: auto;
  padding-bottom: ${baseline()};
  border: 1px dashed transparent;
  transition: border-color 0.2s;
`

const widgetList_draggingOver = css`
  border-color: ${primaryShade(0)};
`

const widgetList_empty = css`
  align-items: center;
  justify-content: center;
  border-color: ${primaryShade(1)};
`

const widgetCard = css`
  flex: 0 0 auto;
  width: min(${baseline(76)}, 75vw);
  padding: 0 ${baseline()};
  box-sizing: border-box;

  & select,
  & input {
    min-width: 0;
  }
`

const widgetInput = css`
  margin: 0;
  cursor: default;
`

const widgetCard_dragging = css`
  & > * {
    box-shadow: 0 ${baseline(2)} ${baseline(6)} rgba(0, 0, 0, 0.6);
  }
`

const emptyHint = css`
  opacity: 0.6;
  font-style: italic;
`

const addWidgetButton = css`
  flex: 0 0 auto;
  align-self: stretch;
  margin: 0;
`

/** Updates a row based on its previous value. */
export type RowUpdater = (
  rowIndex: number,
  updater: (row: DynamicPageRow) => DynamicPageRow
) => void

interface DraggableWidgetProps {
  widget: WidgetConfig
  rowIndex: number
  widgetIndex: number
  onChange: (widgetIndex: number, widget: WidgetConfig) => void
  onRemove: (widgetIndex: number) => void
}

interface WidgetCardProps {
  widget: WidgetConfig
  widgetIndex: number
  dragHandleProps: DraggableProvidedDragHandleProps | null
  onChange: (widgetIndex: number, widget: WidgetConfig) => void
  onRemove: (widgetIndex: number) => void
}

/**
 * The content of a draggable widget.
 *
 * Memoized separately from the Draggable, as the Draggable's render function
 * is called for every drag movement (e.g. when the widget is shifted
 * to make room for the dragged one).
 */
const WidgetCard = memo(function WidgetCard({
  widget,
  widgetIndex,
  dragHandleProps,
  onChange,
  onRemove,
}: WidgetCardProps) {
  const changeWidget = (newWidget: WidgetConfig) =>
    onChange(widgetIndex, newWidget)
  const removeWidget = () => onRemove(widgetIndex)

  return (
    <WidgetInput
      value={widget}
      onChange={changeWidget}
      onDelete={removeWidget}
      headerPrefix={
        <div className={dragHandle} title="Move widget" {...dragHandleProps}>
          <Icon icon={iconDrag} />
        </div>
      }
      className={widgetInput}
      compact
    />
  )
})

/**
 * A single draggable widget editor.
 *
 * Memoized so that it is only re-rendered when its own props change,
 * not whenever the row is re-rendered.
 */
const DraggableWidget = memo(function DraggableWidget({
  widget,
  rowIndex,
  widgetIndex,
  onChange,
  onRemove,
}: DraggableWidgetProps) {
  return (
    <Draggable
      draggableId={`widget-${rowIndex}-${widgetIndex}`}
      index={widgetIndex}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cx(widgetCard, snapshot.isDragging && widgetCard_dragging)}
        >
          <WidgetCard
            widget={widget}
            widgetIndex={widgetIndex}
            dragHandleProps={provided.dragHandleProps}
            onChange={onChange}
            onRemove={onRemove}
          />
        </div>
      )}
    </Draggable>
  )
})

interface WidgetListProps {
  widgets: WidgetConfig[]
  rowIndex: number
  onChange: (widgetIndex: number, widget: WidgetConfig) => void
  onRemove: (widgetIndex: number) => void
}

/**
 * The draggable widgets of a row.
 *
 * Extracted into a separate component so that the Droppable's drag state
 * changes do not re-render all widgets (see the @hello-pangea/dnd docs).
 */
const WidgetList = ({
  widgets,
  rowIndex,
  onChange,
  onRemove,
}: WidgetListProps) => (
  <>
    {widgets.map((widget, widgetIndex) => (
      <DraggableWidget
        key={widgetIndex}
        widget={widget}
        rowIndex={rowIndex}
        widgetIndex={widgetIndex}
        onChange={onChange}
        onRemove={onRemove}
      />
    ))}
  </>
)

export interface DynamicPageRowEditorProps {
  row: DynamicPageRow
  rowIndex: number
  dragHandleProps: DraggableProvidedDragHandleProps | null
  onUpdate: RowUpdater
  onRemove: (rowIndex: number) => void
}

/**
 * Editor for a single row of a dynamic page.
 *
 * Memoized, as the parent Draggable's render function is called
 * for every drag movement.
 *
 * Must be rendered inside a `DragDropContext` that handles moving
 * widgets of type {@link widgetDragType} between rows.
 */
export const DynamicPageRowEditor = memo(function DynamicPageRowEditor({
  row,
  rowIndex,
  dragHandleProps,
  onUpdate,
  onRemove,
}: DynamicPageRowEditorProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const scrollToEndRef = useRef(false)

  const widgetCount = row.widgets.length
  useEffect(() => {
    if (!scrollToEndRef.current) return
    scrollToEndRef.current = false
    const list = listRef.current
    list?.scrollTo({ left: list.scrollWidth, behavior: 'smooth' })
  }, [widgetCount])

  const changeHeadline = (headline: string | undefined) =>
    onUpdate(rowIndex, oldRow => ({ ...oldRow, headline }))

  const changeWidget = (widgetIndex: number, widget: WidgetConfig) =>
    onUpdate(rowIndex, oldRow => ({
      ...oldRow,
      widgets: oldRow.widgets.map((it, index) =>
        index === widgetIndex ? widget : it
      ),
    }))

  const removeWidget = (widgetIndex: number) =>
    onUpdate(rowIndex, oldRow => ({
      ...oldRow,
      widgets: oldRow.widgets.filter((_, index) => index !== widgetIndex),
    }))

  const addWidget = () => {
    scrollToEndRef.current = true
    onUpdate(rowIndex, oldRow => ({
      ...oldRow,
      widgets: [...oldRow.widgets, widgetTypes.map.defaultValueFactory()],
    }))
  }

  const removeRow = () => onRemove(rowIndex)

  return (
    <>
      <div className={rowHeader}>
        <div className={dragHandle} title="Move row" {...dragHandleProps}>
          <Icon icon={iconDrag} />
        </div>
        <TextInput
          value={row.headline}
          onChange={changeHeadline}
          placeholder="Headline"
        />
        <Button
          icon={iconDelete}
          transparent
          onClick={removeRow}
          title="Remove row"
        />
      </div>

      <div className={widgetArea}>
        <Droppable
          droppableId={widgetDroppablePrefix + rowIndex}
          type={widgetDragType}
          direction="horizontal"
        >
          {(provided, snapshot) => (
            <div
              ref={element => {
                provided.innerRef(element)
                listRef.current = element
              }}
              {...provided.droppableProps}
              className={cx(
                widgetList,
                widgetCount === 0 && widgetList_empty,
                snapshot.isDraggingOver && widgetList_draggingOver
              )}
            >
              <WidgetList
                widgets={row.widgets}
                rowIndex={rowIndex}
                onChange={changeWidget}
                onRemove={removeWidget}
              />
              {provided.placeholder}
              {widgetCount === 0 && !snapshot.isDraggingOver && (
                <span className={emptyHint}>Drop widgets here</span>
              )}
            </div>
          )}
        </Droppable>
        <Button
          icon={iconAdd}
          className={addWidgetButton}
          title="Add widget"
          onClick={addWidget}
        />
      </div>
    </>
  )
})
