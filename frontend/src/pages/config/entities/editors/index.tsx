import React from 'react'
import { EntityName, EntityType } from '@vlight/types'

import { showDialog } from '../../../../ui/overlays/dialog'
import { editEntity } from '../../../../api'
import { okCancel } from '../../../../ui/overlays/buttons'
import { EntityEditorProps, entityUiMapping } from '../entity-ui-mapping'

export async function openEntityEditor<T extends EntityName>(
  type: T,
  entry?: EntityType<T>
) {
  const Editor:
    | React.ComponentType<EntityEditorProps<T>>
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
    okCancel
  )
  if (result) {
    editEntity(type, newEntry)
  }
}
