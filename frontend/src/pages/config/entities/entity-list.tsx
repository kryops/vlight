import { css } from '@linaria/core'
import { EntityType, EntityName } from '@vlight/types'
import { getId } from '@vlight/utils'
import { useCallback } from 'react'

import { setEntities } from '../../../api'
import { setRawMasterDataEntriesLocally } from '../../../api/api-state'
import { baseline, primaryShade } from '../../../ui/styles'
import { Icon } from '../../../ui/icons/icon'
import { iconCopy, iconDelete, iconDrag } from '../../../ui/icons'
import { showDialog } from '../../../ui/overlays/dialog'
import { yesNo } from '../../../ui/overlays/buttons'
import { SortableList } from '../../../ui/containers/sortable-list'
import { useMasterDataMaps } from '../../../hooks/api'

import { openEntityEditor } from './editors'
import {
  entityUiMapping,
  removeEntityWithCustomLogic,
} from './entity-ui-mapping'
import { copyEntity, getEntityName } from '../../../util/entities'

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

  /**
   * Disables reordering via drag & drop, e.g. while the list is filtered.
   *
   * Defaults to `false`.
   */
  sortingDisabled?: boolean
}

/**
 * Sortable list of master data entries that can be edited or deleted.
 */
export function EntityList<T extends EntityName>({
  type,
  entries,
  sortingDisabled = false,
}: EntityListProps<T>) {
  const masterDataMaps = useMasterDataMaps()

  const changeEntities = (newEntries: EntityType<T>[]) => {
    // Update the client in real-time to prevent flickering
    setRawMasterDataEntriesLocally(type, newEntries)

    setEntities(type, newEntries)
  }

  const renderEntryContent = useCallback(
    (entry: EntityType<T>) => (
      <>
        <div
          role="button"
          className={entryContent}
          onClick={() => openEntityEditor(type, entry)}
        >
          {!sortingDisabled && <Icon icon={iconDrag} inline />}
          {entityUiMapping[type]?.listPreview?.(entry as any, masterDataMaps) ??
            getEntityName(entry) ??
            entry.id}
        </div>
        <Icon
          title="Copy"
          icon={iconCopy}
          className={entryIcon}
          hoverable
          onClick={() => openEntityEditor(type, copyEntity(entry))}
        />
        <Icon
          title="Delete"
          icon={iconDelete}
          className={entryIcon}
          hoverable
          onClick={async () => {
            const result = await showDialog<boolean | null>(
              `Really delete "${getEntityName(entry) ?? entry.id}"?`,
              yesNo,
              { closeOnBackDrop: true }
            )
            if (result) {
              removeEntityWithCustomLogic(type, entry)
            }
          }}
        />
      </>
    ),
    [type, masterDataMaps, sortingDisabled]
  )

  return (
    <SortableList
      entries={entries}
      onChange={changeEntities}
      entryClassName={listEntry}
      getKey={getId}
      renderEntryContent={renderEntryContent}
      disabled={sortingDisabled}
    />
  )
}
