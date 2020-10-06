import React from 'react'
import { css } from 'linaria'
import { EntityType, EntityName } from '@vlight/types'
import { sortByKey } from '@vlight/utils'

import { removeEntity } from '../../../api'
import { useClassName } from '../../../hooks/ui'
import { baseline, primaryShade } from '../../../ui/styles'
import { Icon } from '../../../ui/icons/icon'
import { iconDelete } from '../../../ui/icons'
import { showDialog } from '../../../ui/overlays/dialog'
import { yesNo } from '../../../ui/overlays/buttons'

import { openEntityEditor } from './editors'

const padding = 3

const listEntry = css`
  display: flex;
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
  padding: ${baseline(padding)};
  flex: 1 1 auto;
`

const entryIcon = css`
  flex: 0 0 auto;
  padding: ${baseline(padding)};
`

export interface EntityListProps<T extends EntityName> {
  type: T
  entries: EntityType<T>[]
}

export function EntityList<T extends EntityName>({
  type,
  entries,
}: EntityListProps<T>) {
  const listEntryClassName = useClassName(listEntry, listEntry_light)

  const orderedEntries = sortByKey(entries, 'name')

  return (
    <>
      {orderedEntries.map(entry => (
        <div key={entry.id} className={listEntryClassName}>
          <div
            className={entryContent}
            onClick={() => openEntityEditor(type, entry)}
          >
            {entry.name ?? entry.id}
          </div>
          <Icon
            icon={iconDelete}
            className={entryIcon}
            hoverable
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
