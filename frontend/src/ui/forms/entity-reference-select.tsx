import React from 'react'
import { EntityName, IdType, EntityType } from '@vlight/types'

import { useApiState } from '../../hooks/api'

import { Select, SelectEntry } from './select'

export interface EntityReferenceSelectProps {
  entity: EntityName
  value: IdType | undefined
  onChange: (value: IdType | undefined) => void
  useOriginalId?: boolean
  addUndefinedOption?: boolean
  className?: string
}

export function EntityReferenceSelect({
  entity,
  useOriginalId,
  addUndefinedOption,
  ...rest
}: EntityReferenceSelectProps) {
  const originalEntries = useApiState(
    useOriginalId ? 'rawMasterData' : 'masterData'
  )[entity] as EntityType<EntityName>[]
  const displayEntries: Array<SelectEntry<IdType> | undefined> = originalEntries
    .map(({ id, name }) => ({
      value: id,
      label: name ?? id,
    }))
    .sort((a, b) => {
      if (a.label === b.label) return 0
      return a.label > b.label ? 1 : -1
    })

  if (addUndefinedOption) {
    displayEntries.unshift(undefined)
  }

  return <Select entries={displayEntries} {...rest} />
}
