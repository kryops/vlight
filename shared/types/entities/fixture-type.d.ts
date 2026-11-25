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
   * The channel types (from the {@link mapping}) that depend on the fixture's master.
   *
   * - Fixtures without a master channel: these channels are dimmed by the (virtual) master
   *   in fixture/group controls, as well as by memory/chase values and the global DMX master.
   *   All other channels are left untouched.
   * - Fixtures with a master channel: the master channel is assumed to dim these channels
   *   physically; vLight only uses this to fade them down if a different control sets the
   *   master channel to a higher value. Channels that are not physically dimmed by the
   *   fixture's master channel cannot be dimmed by vLight in this case.
   *
   * Memories with `forceMaster` dim all channels regardless of this setting.
   *
   * Defaults to all color channels (r, g, b, w, a, uv).
   * Fixtures without a master channel that contain none of these channels default
   * to all of their channels instead (e.g. a single dimmer channel).
   *
   * An empty array means that no channels depend on the master (e.g. for fog machines).
   */
  masterDependentChannels?: string[]

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
