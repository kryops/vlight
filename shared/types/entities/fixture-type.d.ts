import { DbEntity } from './util'

/** The shape of a {@link FixtureType} to display on the map. */
export type FixtureShape = 'square' | 'circle'

/** The border style of a {@link FixtureType} to display on the map. */
export type FixtureBorderStyle = 'solid' | 'dotted' | 'dashed'

/**
 * A type of a fixture.
 *
 * Unlike most other entities, fixture types are persisted globally independent of the current configured project.
 */
export interface FixtureType extends DbEntity {
  /** The display name of the fixture type. */
  name: string

  /**
   * The mapping of the fixtures channels.
   */
  mapping: string[]

  /**
   * The shape of the fixture to display on the map.
   */
  shape?: FixtureShape

  /**
   * The border style of the fixture to display on the map.
   */
  border?: FixtureBorderStyle

  /**
   * The width of the fixture to display on the map.
   *
   * Defaults to 5.
   */
  xSize?: number

  /**
   * The height of the fixture to display on the map.
   *
   * Defaults to 5.
   */
  ySize?: number
}
