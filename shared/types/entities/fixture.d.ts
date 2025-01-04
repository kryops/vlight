import { DbEntity, Dictionary, IdType } from './util'

/**
 * One or multiple fixtures of the same type.
 */
export interface Fixture extends DbEntity {
  /**
   * The type of the fixture.
   * References a {@link FixtureType}.
   */
  type: IdType

  /**
   * The DMX channel of the first fixture.
   *
   * NOTE: vLight does not support fixtures with overlapping channels.
   * Only fixtures of the same type sharing the same channel are supported via {@link fixturesSharingChannel}.
   */
  channel: number

  /**
   * The display name of the fixture.
   *
   * If it contains the `#` character and {@link count} is set, the `#` is replaced
   * by the fixture's number.
   */
  name?: string

  /**
   * The fixture count for this definition. The fixtures' channels are mapped in a row,
   * starting at the configured {@link channel}, leaving {@link channelOffset} channels in between.
   *
   * Defaults to 1.
   */
  count?: number

  /**
   * Specifies the channel offset between the fixtures.
   *
   * Only relevant if {@link count} is greater than 1.
   *
   * Defaults to 0.
   */
  channelOffset?: number

  /**
   * The count of fixtures sharing the same channel.
   * Only affects the display on the map - the rest of the application will treat it as a single fixture.
   *
   * Defaults to 1.
   */
  fixturesSharingChannel?: number

  /**
   * The X coordinate of the first fixture on the map, starting from the left.
   *
   * If not set, the fixtures are not displayed on the map.
   */
  x?: number

  /**
   * The Y coordinate of the first fixture on the map, starting from the top.
   *
   * If not set, the fixtures are not displayed on the map.
   */
  y?: number

  /**
   * The X offset of multiple fixtures on the map defined via {@link count} or
   * {@link fixturesSharingChannel}.
   *
   * Only relevant if {@link x} and {@link y} are set.
   *
   * Defaults to 8.
   */
  xOffset?: number

  /**
   * The Y offset of multiple fixtures on the map defined via {@link count} or
   * {@link fixturesSharingChannel}.
   *
   * Only relevant if {@link x} and {@link y} are set.
   *
   * Defaults to 0.
   */
  yOffset?: number

  /**
   * The rotation of the fixture in degrees.
   * Only affects the display on the map.
   *
   * Defaults to 0.
   */
  rotation?: number

  /**
   * The rotation offset between multiple fixtures in degrees.
   * Only affects fixtures created via {@link count} or {@link fixturesSharingChannel}.
   *
   * Defaults to 0.
   */
  rotationOffset?: number

  /**
   * Internal reference to the original fixture definition ID if multiple fixtures
   * are defined via {@link count}.
   */
  originalId?: IdType

  /**
   * If set, a group is created in addition to the fixture definition.
   *
   * Only used during fixture creation.
   */
  createGroup?: boolean
}

/**
 * A state of fixture channels is represented by a dictionary containing the channel type
 * as keys and the values (0-255) as values.
 */
export type FixtureChannels = Dictionary<number>

/**
 * The state of a fixture.
 * Also used for the state of higher-level entities (groups, memories, chases).
 */
export interface FixtureState {
  /**
   * Turns the fixture on and off.
   *
   * Unlike the virtual master channel, turning off a fixture will set all of its
   * channels to 0.
   */
  on: boolean

  /**
   * The active channels.
   * Channels not set default to 0.
   */
  channels: FixtureChannels

  /**
   * Internal flag to mark the state as "initial" in order to skip it while
   * persisting the current application state.
   */
  initial?: boolean
}

/**
 * The stop of a gradient that is applied to fixtures.
 */
export interface FixtureStateGradient {
  /**
   * The position of the gradient stop in a range from 0 - 100.
   *
   * Defaults to the middle between the surrounding stops, or 0/100 for the first/last stop.
   */
  position?: number

  /** The channels that define the state for this gradient stop. */
  channels: FixtureChannels

  /**
   * Controls whether the gradient should be mirrored on the right side,
   * i.e. repeated once in the alternate direction.
   */
  mirrored?: boolean
}
