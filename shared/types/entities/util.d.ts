/** An entity ID. */
export type IdType = string

/** Base type for an entity that is persisted in the database. */
export interface DbEntity {
  id: IdType
}

export interface Dictionary<T> {
  [key: string]: T
}

/**
 * Definitions of members to group fixtures together in different ways.
 *
 * Accepts
 * - fixture IDs
 * - `all:foobar` -> maps all fixtures of the same definition
 *    (with this ID originally configured)
 * - `type:foobar` -> maps all fixtures of type `foobar`
 * - `group:foobar` -> maps all fixtures of group `foobar`
 */
export type EntityMembers = string[]
