import { DbEntity } from './util'

/**
 * A group containing multiple fixtures.
 */
export interface FixtureGroup extends DbEntity {
  /** The name of the group. */
  name?: string

  /**
   * References the fixtures that are members of this group.
   *
   * Also accepts the following prefixes:
   * - `all:foobar` -> maps all fixtures with this ID originally configured
   * - `type:foobar` -> maps all fixtures of type `foobar`
   */
  fixtures: string[]
}
