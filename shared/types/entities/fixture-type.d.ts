import { DbEntity } from './util'

/** The shape of a {@link FixtureType} to display on the map. */
export type FixtureShape = 'square' | 'circle'

/** The border style of a {@link FixtureType} to display on the map. */
export type FixtureBorderStyle = 'solid' | 'dotted' | 'dashed'

/**
 * A named state of a {@link FixtureType}'s channel, e.g. a color or gobo wheel position.
 */
export interface FixtureChannelState {
  /**
   * DMX value (0-255) at which the state starts.
   *
   * The state lasts until the next state's value (or 255).
   */
  value: number

  /** The display name of the state. */
  name: string
}

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
   * Named states/ranges per channel type (from the {@link mapping}),
   * e.g. for color wheels, gobos, or prism rotation.
   *
   * The states are sorted by their value.
   * They are only used for display; the channels can still be set to any value.
   */
  channelStates?: Record<string, FixtureChannelState[]>

  /**
   * Controls whether the fixture is split into multiple segments (light sources)
   * if its mapping contains repeated channel types.
   *
   * Segments are detected automatically: the channel types that appear most often
   * (at least twice) form the segments in order of their occurrence,
   * all other channels are shared between them (e.g. the master channel).
   * Master channels that appear once per segment are used as separate master
   * channels for each segment.
   *
   * Memories and chases can address the segments as separate members.
   *
   * Defaults to `true`.
   */
  segments?: boolean

  /**
   * The number of columns to arrange the segments in on the map.
   *
   * Defaults to all segments in a single row,
   * or to a ring for circle shapes.
   */
  segmentColumns?: number

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
