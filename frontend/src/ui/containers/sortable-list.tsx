import { ReactNode, useId } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

export interface SortableListProps<T> {
  /**
   * The list's entries.
   *
   * Can be anything, use {@link renderEntryContent} to render them.
   */
  entries: T[]

  /**
   * Renders a list entry.
   * Wrapped in drag/drop containers.
   */
  renderEntryContent: (entry: T) => ReactNode

  /** Called after an element was dragged to reorder the list. */
  onChange: (entries: T[]) => void

  /** CSS class name to be applied to the container. */
  containerClassName?: string

  /**
   * CSS class name to be applied to each list entry
   * (the parent element of what {@link renderEntryContent}) renders.
   */
  entryClassName?: string

  /**
   * Creates a unique key for the given entry.
   *
   * Defaults to the index.
   */
  getKey?: (entry: T) => string | number

  /**
   * Sorting direction.
   *
   * Defaults to vertical.
   */
  direction?: 'vertical' | 'horizontal'

  /**
   * Disables reordering, e.g. while the list is filtered.
   *
   * Defaults to `false`.
   */
  disabled?: boolean
}

/**
 * Not necessary to extract this into a separate component,
 * but recommended for performance reasons.
 */
const InnerSortableList = ({
  entries,
  entryClassName,
  renderEntryContent,
  getKey,
  disabled,
}: Omit<SortableListProps<any>, 'containerClassName' | 'onChange'>) => {
  return (
    <>
      {entries.map((entry, index) => (
        <Draggable
          key={getKey?.(entry) ?? index}
          draggableId={String(getKey?.(entry) ?? index)}
          index={index}
          isDragDisabled={disabled || entries.length < 2}
        >
          {provided => (
            <div
              className={entryClassName}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {renderEntryContent(entry)}
            </div>
          )}
        </Draggable>
      ))}
    </>
  )
}

/**
 * Sortable list of entries of the same type.
 */
export const SortableList = <T extends any>({
  entries,
  onChange,
  containerClassName,
  entryClassName,
  renderEntryContent,
  getKey,
  direction,
  disabled,
}: SortableListProps<T>) => {
  const droppableId = useId()

  return (
    <DragDropContext
      onDragEnd={result => {
        if (!result.destination) return

        const newEntries = [...entries]
        const [removed] = newEntries.splice(result.source.index, 1)
        newEntries.splice(result.destination.index, 0, removed)

        onChange(newEntries)
      }}
    >
      <Droppable
        droppableId={droppableId}
        isDropDisabled={disabled || entries.length < 2}
        direction={direction}
      >
        {provided => (
          <div
            className={containerClassName}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <InnerSortableList
              entries={entries}
              renderEntryContent={renderEntryContent}
              entryClassName={entryClassName}
              getKey={getKey}
              disabled={disabled}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
