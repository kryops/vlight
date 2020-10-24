import { DbEntity, EntityName, EntityType, IdType } from '@vlight/types'
import { ComponentType } from 'react'

import { showDialog } from '../../../../ui/overlays/dialog'
import { editEntity } from '../../../../api'
import { okCancel } from '../../../../ui/overlays/buttons'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'
import { apiState } from '../../../../api/api-state'

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

export async function openEntityEditor<T extends EntityName>(
  type: T,
  entry?: EntityType<T>
) {
  const Editor:
    | ComponentType<EntityEditorProps<T>>
    | undefined = entityUiMapping[type].editor as any

  if (!Editor) return

  const factory = entityUiMapping[type].newEntityFactory

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
    editEntity(type, newEntry)
  }
}
