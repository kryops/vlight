import React from 'react'
import { css } from 'linaria'
import { EntityType, EntityName } from '@vlight/entities'

import { removeEntity } from '../../../api'
import { useClassName } from '../../../hooks/ui'
import { baseline, primaryShade } from '../../../ui/styles'
import { Icon } from '../../../ui/icons/icon'
import { iconDelete } from '../../../ui/icons'
import { showDialog } from '../../../ui/overlays/dialog'
import { yesNo } from '../../../ui/overlays/buttons'

const padding = 3

const listEntry = css`
  display: flex;
  padding: ${baseline(padding)};
  margin: ${baseline(2)} 0;
  background: ${primaryShade(3)};
  font-size: 1.25rem;
  cursor: pointer;

  &:hover {
    background: ${primaryShade(2)};
  }
`

const listEntry_light = css`
  background: ${primaryShade(3, true)};

  &:hover {
    background: ${primaryShade(2, true)};
  }
`

const entryContent = css`
  flex: 1 1 auto;
`

const entryIcon = css`
  flex: 0 0 auto;
  margin: ${baseline(-padding)};
  margin-left: 0;
  padding: ${baseline(padding)};
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`

export interface EntityListProps<T extends EntityType> {
  type: EntityName
  entries: T[]
}

export function EntityList<T extends EntityType>({
  type,
  entries,
}: EntityListProps<T>) {
  const listEntryClassName = useClassName(listEntry, listEntry_light)
  return (
    <>
      {entries.map(entry => (
        <div key={entry.id} className={listEntryClassName}>
          <div className={entryContent}>{entry.name ?? entry.id}</div>
          <Icon
            icon={iconDelete}
            className={entryIcon}
            onClick={async () => {
              const result = await showDialog<boolean | null>(
                `Really delete "${entry.name}"?`,
                yesNo,
                { closeOnBackDrop: true }
              )
              if (result) {
                removeEntity(type, entry.id)
              }
            }}
          />
        </div>
      ))}
    </>
  )
}
