import { ReactNode, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { memoInProduction } from '../../util/development'

export interface SortableListProps<T> {
  entries: T[]
  onChange: (entries: T[]) => void
  containerClassName?: string
  entryClassName?: string
  renderEntryContent: (entry: T) => ReactNode
  getKey?: (entry: T) => string | number
}

let sortableListIndex = 0

// recommended performance optimization
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

export function SortableList<T>({
  entries,
  onChange,
  containerClassName,
  entryClassName,
  renderEntryContent,
  getKey,
}: SortableListProps<T>) {
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
