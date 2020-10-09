import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { css } from 'linaria'
import { FixtureMappingPrefix } from '@vlight/controls'

import { iconDelete, iconDrag } from '../icons'
import { Icon } from '../icons/icon'
import { useMasterDataMaps, useRawMasterData } from '../../hooks/api'
import { baseline, primaryShade, textShade } from '../styles'
import { useClassName } from '../../hooks/ui'

const container = css`
  margin-top: ${baseline()};
  min-height: ${baseline(84)};
`

const entryStyle = css`
  display: flex;
  background: ${primaryShade(2)};
  margin-bottom: ${baseline()};
`

const entryStyle_light = css`
  background: ${primaryShade(3, true)};
  color: ${textShade(0, true)};
`

const entryButton = css`
  flex: 0 0 auto;
  padding: ${baseline(1)} ${baseline(2)};
`

const entryName = css`
  flex: 1 1 auto;
  padding: ${baseline(2)} 0;
`

export interface SortableFixtureMappingProps {
  value: string[]
  onChange: (newValue: string[]) => void
}

const InnerMapping = React.memo(
  ({ value, onChange }: SortableFixtureMappingProps) => {
    const rawMasterData = useRawMasterData()
    const masterDataMaps = useMasterDataMaps()
    const entryClassName = useClassName(entryStyle, entryStyle_light)

    return (
      <>
        {value?.map((entry, index) => {
          let name: string

          if (entry.startsWith(FixtureMappingPrefix.all)) {
            const id = entry.slice(FixtureMappingPrefix.all.length)
            name = `[All]: ${
              rawMasterData.fixtures.find(fixture => fixture.id === id)?.name ??
              id
            }`
          } else if (entry.startsWith(FixtureMappingPrefix.group)) {
            const id = entry.slice(FixtureMappingPrefix.group.length)
            name = `[Group]: ${
              masterDataMaps.fixtureGroups.get(id)?.name ?? id
            }`
          } else if (entry.startsWith(FixtureMappingPrefix.type)) {
            const id = entry.slice(FixtureMappingPrefix.type.length)
            name = `[Type]: ${masterDataMaps.fixtureTypes.get(id)?.name ?? id}`
          } else {
            name = masterDataMaps.fixtures.get(entry)?.name ?? entry
          }

          return (
            <Draggable
              key={entry}
              draggableId={entry}
              index={index}
              isDragDisabled={value.length < 2}
            >
              {provided => (
                <div
                  className={entryClassName}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <Icon className={entryButton} icon={iconDrag} />
                  <div className={entryName}>{name}</div>
                  <Icon
                    className={entryButton}
                    icon={iconDelete}
                    hoverable
                    onClick={() =>
                      onChange((value ?? []).filter(it => it !== entry))
                    }
                  />
                </div>
              )}
            </Draggable>
          )
        })}
      </>
    )
  }
)

export function SortableFixtureMapping({
  value,
  onChange,
}: SortableFixtureMappingProps) {
  return (
    <DragDropContext
      onDragEnd={result => {
        if (!result.destination) return

        const newValue = [...(value ?? [])]
        const [removed] = newValue.splice(result.source.index, 1)
        newValue.splice(result.destination.index, 0, removed)

        onChange(newValue)
      }}
    >
      <Droppable
        droppableId="fixtureListInput_selected"
        isDropDisabled={value.length < 2}
      >
        {provided => (
          <div
            className={container}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <InnerMapping value={value} onChange={onChange} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
