import { css } from '@linaria/core'
import { EntityType, EntityName, MasterData } from '@vlight/types'

import { removeEntity, setEntities } from '../../../api'
import { apiStateEmitter, apiState } from '../../../api/api-state'
import { baseline, primaryShade } from '../../../ui/styles'
import { Icon } from '../../../ui/icons/icon'
import { iconDelete, iconDrag } from '../../../ui/icons'
import { showDialog } from '../../../ui/overlays/dialog'
import { yesNo } from '../../../ui/overlays/buttons'
import { SortableList } from '../../../ui/containers/sortable-list'
import { useMasterDataMaps } from '../../../hooks/api'

import { openEntityEditor } from './editors'
import { entityUiMapping } from './entity-ui-mapping'

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
}

/**
 * Sortable list of master data entries that can be edited or deleted.
 */
export function EntityList<T extends EntityName>({
  type,
  entries,
}: EntityListProps<T>) {
  const masterDataMaps = useMasterDataMaps()

  return (
    <SortableList
      entries={entries}
      onChange={newEntries => {
        // Update the client in real-time to prevent flickering
        ;(apiState.rawMasterData as MasterData) = {
          ...(apiState.rawMasterData as MasterData),
          [type]: newEntries as any,
        }
        apiStateEmitter.emit('rawMasterData')

        setEntities(type, newEntries)
      }}
      entryClassName={listEntry}
      getKey={entry => entry.id}
      renderEntryContent={entry => (
        <>
          <div
            className={entryContent}
            onClick={() => openEntityEditor(type, entry)}
          >
            <Icon icon={iconDrag} inline />
            {entityUiMapping[type]?.listPreview?.(
              entry as any,
              masterDataMaps
            ) ??
              entry.name ??
              entry.id}
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
        </>
      )}
    />
  )
}
