import React from 'react'
import { css } from 'linaria'
import { EntityType } from '@vlight/entities'

import { baseline, primaryShade } from '../../../ui/styles'
import { useClassName } from '../../../hooks/ui'

const listEntry = css`
  padding: ${baseline(3)};
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

export interface EntityListProps<T extends EntityType> {
  type: T['id']
  entries: T[]
}

export function EntityList<T extends EntityType>({
  entries,
}: EntityListProps<T>) {
  const listEntryClassName = useClassName(listEntry, listEntry_light)
  return (
    <>
      {entries.map(entry => (
        <div key={entry.id} className={listEntryClassName}>
          {entry.name ?? entry.id}
        </div>
      ))}
    </>
  )
}
