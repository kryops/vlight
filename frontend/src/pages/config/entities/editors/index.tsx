import { DbEntity, EntityName, EntityType, IdType } from '@vlight/types'
import { ComponentType } from 'react'

import { showDialog } from '../../../../ui/overlays/dialog'
import { okCancel } from '../../../../ui/overlays/buttons'
import {
  editEntityWithCustomLogic,
  entityUiMapping,
} from '../entity-ui-mapping'
import { EntityEditorProps } from '../types'
import { apiState } from '../../../../api/api-state'

/**
 * Opens an editor for a master data entity type, editing the entry with the given ID.
 *
 * Does nothing if it does not exist.
 */
export function openEntityEditorForId<T extends EntityName>(
  type: T,
  id: IdType
) {
  const entry = (apiState.rawMasterData?.[type] as any)?.find(
    (it: DbEntity) => it.id === id
  )
  if (!entry) return

  openEntityEditor(type, entry as any)
}

/**
 * Opens an editor for a master data entity type.
 *
 * @param entry if given, an existing entry is edited;
 *   otherwise, a new one is created.
 */
export async function openEntityEditor<T extends EntityName>(
  type: T,
  entry?: EntityType<T>
) {
  const Editor: ComponentType<EntityEditorProps<T>> | undefined =
    entityUiMapping[type]?.editor as any

  if (!Editor) return

  const factory = entityUiMapping[type]?.newEntityFactory

  if (!entry && !factory) return

  const initialEntry = entry ?? ({ id: '', ...factory!() } as EntityType<T>)

  let newEntry = initialEntry
  const result = await showDialog(
    <Editor
      entry={initialEntry}
      onChange={newValue => {
        newEntry = newValue
      }}
    />,
    okCancel,
    { showCloseButton: true }
  )
  if (result) {
    editEntityWithCustomLogic(type, newEntry)
  }
}
