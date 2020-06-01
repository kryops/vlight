import { EntityName, EntityArray, EntityType, IdType } from '@vlight/entities'

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

  addEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  updateEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  removeEntry<T extends EntityName>(
    entity: T,
    id: IdType,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  clearCache(): Promise<void>
}
