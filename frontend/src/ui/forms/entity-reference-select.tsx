import React from 'react'
import { EntityName, IdType, EntityType } from '@vlight/entities'

import { useMasterData } from '../../hooks/api'

import { Select } from './select'

export interface EntityReferenceSelectProps {
  entity: EntityName
  value: IdType
  onChange: (value: IdType) => void
  className?: string
}

export function EntityReferenceSelect({
  entity,
  ...rest
}: EntityReferenceSelectProps) {
  const originalEntries = useMasterData()[entity] as EntityType<EntityName>[]
  const displayEntries = originalEntries
    .map(({ id, name }) => ({
      value: id,
      label: name ?? id,
    }))
    .sort((a, b) => {
      if (a.label === b.label) return 0
      return a.label > b.label ? 1 : -1
    })

  return <Select entries={displayEntries} {...rest} />
}
