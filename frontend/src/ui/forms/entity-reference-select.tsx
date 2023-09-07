import { EntityName, IdType, EntityType } from '@vlight/types'
import { useMemo } from 'react'

import { useApiState } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { useShallowEqualMemo } from '../../hooks/performance'

import { Select, SelectEntry } from './select'

export interface EntityReferenceSelectProps {
  /** Name of the target entity type. */
  entity: EntityName

  value: IdType | undefined

  onChange: (value: IdType | undefined) => void

  /**
   * Controls whether to use the original ID of the raw (non pre-processed)
   * master data entry instead of the pre-processed one.
   *
   * Defaults to `false`.
   */
  useOriginalId?: boolean

  /**
   * Controls whether to add an undefined option for "no reference".
   *
   * Defaults to `false`.
   */
  addUndefinedOption?: boolean

  /**
   * If set, the given values are excluded from the select options.
   */
  excludeValues?: IdType[]

  className?: string
}

/**
 * Select input wrapper to reference an entity of a certain type.
 */
export const EntityReferenceSelect = memoInProduction(
  ({
    entity,
    useOriginalId = false,
    addUndefinedOption = false,
    excludeValues,
    ...rest
  }: EntityReferenceSelectProps) => {
    const originalEntries = useApiState(
      useOriginalId ? 'rawMasterData' : 'masterData'
    )[entity] as EntityType<EntityName>[]

    const memoExcludeValues = useShallowEqualMemo(excludeValues)

    const displayEntries = useMemo(() => {
      const result: Array<SelectEntry<IdType> | undefined> = originalEntries
        .filter(
          ({ id }) => !memoExcludeValues?.includes(id) || id === rest.value
        )
        .map(({ id, name }) => ({
          value: id,
          label: name ?? id,
        }))
        .sort((a, b) => {
          if (a.label === b.label) return 0
          return a.label > b.label ? 1 : -1
        })

      if (addUndefinedOption) {
        result.unshift(undefined)
      }

      return result
    }, [originalEntries, memoExcludeValues, rest.value, addUndefinedOption])

    return <Select entries={displayEntries} {...rest} />
  }
)
