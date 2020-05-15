import { EntityName, EntityArray } from '@vlight/entities'

export interface DatabaseEntityOptions {
  global?: boolean
}

export interface DatabaseBackend {
  loadEntities<T extends EntityName>(
    entity: T,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  writeEntities<T extends EntityName>(
    entity: T,
    entries: EntityArray<T>,
    options?: DatabaseEntityOptions
  ): Promise<void>
}
