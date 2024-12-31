import { ReactNode, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

import { memoInProduction } from '../../util/development'

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
}

let sortableListIndex = 0

/**
 * Not necessary to extract this into a separate component,
 * but recommended for performance reasons.
 */
const InnerSortableList = memoInProduction(
  ({
    entries,
    entryClassName,
    renderEntryContent,
    getKey,
  }: Omit<SortableListProps<any>, 'containerClassName' | 'onChange'>) => {
    return (
      <>
        {entries.map((entry, index) => (
          <Draggable
            key={getKey?.(entry) ?? index}
            draggableId={String(getKey?.(entry) ?? index)}
            index={index}
            isDragDisabled={entries.length < 2}
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
)

/**
 * Sortable list of entries of the same type.
 */
export const SortableList = memoInProduction(
  <T extends any>({
    entries,
    onChange,
    containerClassName,
    entryClassName,
    renderEntryContent,
    getKey,
    direction,
  }: SortableListProps<T>) => {
    const [droppableId] = useState(() => sortableListIndex++)

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
          droppableId={String(droppableId)}
          isDropDisabled={entries.length < 2}
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
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
)
