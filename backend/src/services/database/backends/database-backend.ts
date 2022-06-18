import { EntityName, EntityArray, EntityType, IdType } from '@vlight/types'

export interface DatabaseEntityOptions {
  /**
   * Controls whether the entity type is saved globally independent of the current project.
   *
   * Defaults to `false`.
   */
  global?: boolean
}

/**
 * Abstraction of a database backend to manage loading and storing the application's master data.
 *
 * The application state is persisted separately.
 */
export interface DatabaseBackend {
  /** Loads all entries of the given entity type. */
  loadEntities<T extends EntityName>(
    entity: T,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  /** Writes all entries of the given entity type. */
  writeEntities<T extends EntityName>(
    entity: T,
    entries: EntityArray<T>,
    options?: DatabaseEntityOptions
  ): Promise<void>

  /** Adds a single entry of the given entity type. */
  addEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  /** Updates a single entry of the given entity type. */
  updateEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  /** Removes a single entry of the given entity type. */
  removeEntry<T extends EntityName>(
    entity: T,
    id: IdType,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>>

  /** Clears the database cache in order to reload data from the backend. */
  clearCache(): Promise<void>
}
