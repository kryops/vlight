import { EntityName, EntityArray } from '@vlight/entities'

export interface DatabaseBackend {
  loadEntities<T extends EntityName>(entity: T): Promise<EntityArray<T>>

  writeEntities<T extends EntityName>(
    entity: T,
    entries: EntityArray<T>
  ): Promise<void>
}
