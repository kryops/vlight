import { EntityName, EntityType } from '@vlight/types'

export interface EntityEditorProps<T extends EntityName> {
  entry: EntityType<T>
  onChange: (entry: EntityType<T>) => void
}
