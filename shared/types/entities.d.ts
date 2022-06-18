import { ValueOrRandom } from './util'

/** An entity ID. */
export type IdType = string

/** Base type for an entity that is persisted in the database. */
export interface DbEntity {
  id: IdType
}

export interface Dictionary<T> {
  [key: string]: T
}

// MasterData

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
   * starting at the configured {@link channel}.
   *
   * Defaults to 1.
   */
  count?: number

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
   * Internal reference to the original fixture definition ID if multiple fixtures
   * are defined via {@link count}.
   */
  originalId?: IdType
}

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

/**
 * A state of a {@link MemoryScene}.
 * Can be either a simple fixture state or a gradient.
 */
export type MemorySceneState = FixtureState | FixtureStateGradient[]

/**
 * A scene of a {@link Memory}.
 */
export interface MemoryScene {
  /** The members that this scene is applied to. */
  members: EntityMembers

  /**
   * Defaults how multiple {@link states} are applied to the given {@link members}:
   * - `row` tries to distribute the states equally in a row
   * - `alternate` cycles through the states for each member
   *
   * Defaults to `'row'`.
   */
  pattern?: 'row' | 'alternate'

  /** The states of the scene. */
  states: Array<MemorySceneState>
}

/**
 * A *memory* is a prepared state of multiple fixtures.
 *
 * It can contain multiple *scenes*, which can contain multiple *states* each,
 * displayed in different *patterns*.
 */
export interface Memory extends DbEntity {
  /** The name of the memory. */
  name?: string

  /** The scenes that make up this memory. */
  scenes: MemoryScene[]
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
}

/** Mapping of entity keys to their type. */
interface MasterDataMapping {
  fixtureTypes: FixtureType
  fixtures: Fixture
  fixtureGroups: FixtureGroup
  memories: Memory
  dynamicPages: DynamicPage
}

/**
 * Dictionary of all master data entities as arrays.
 */
export type MasterData = {
  [key in keyof MasterDataMapping]: Array<MasterDataMapping[key]>
}

/**
 * Dictionary of all master data entities as maps.
 */
export type MasterDataMaps = {
  [key in keyof MasterData]: Map<
    IdType,
    MasterData[key] extends Array<infer U> ? U : never
  >
}

/**
 * Object that contains the master data both as arrays and as maps
 * in order to optimize the type of access that fits best.
 */
export interface MasterDataWithMaps {
  masterData: MasterData
  masterDataMaps: MasterDataMaps
}

/** The name of a master data entity type. */
export type EntityName = keyof MasterDataMapping

/** An array of a certain master data entity type. */
export type EntityArray<T extends EntityName = EntityName> = Array<
  MasterDataMapping[T]
>

/** The type definition of a certain master data entity type. */
export type EntityType<T extends EntityName = EntityName> = MasterDataMapping[T]

// State

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
 * The state of a {@link Memory}.
 */
export interface MemoryState {
  /** Turns the memory on and off. */
  on: boolean

  /**
   * The intensity of the memory (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel unless {@link forceMaster} is set.
   */
  value: number

  /**
   * Flag to fade all of the channels the memory controls according to the {@link value},
   * independent of its master channels.
   *
   * This is usually used to control single channels for fixtures that are already
   * turned on through other controls.
   *
   * Defaults to `false`.
   */
  forceMaster?: boolean

  /**
   * Internal flag to mark the state as "initial" in order to skip it while
   * persisting the current application state.
   */
  initial?: boolean
}

/**
 * A live memory is a simpler form of a memory that is meant to be frequently
 * changed throughout a live show.
 *
 * It consists of a single scene that is directly displayed in the memory's widget.
 */
export interface LiveMemory extends MemoryScene {
  /** Turns the memory on and off. */
  on: boolean

  /**
   * The intensity of the memory (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel.
   */
  value: number
}

/**
 * A state of fixture channels that can contain random values computed from a set
 * or a range of possible values.
 */
export type RandomChannels = Dictionary<ValueOrRandom<number>>

/**
 * A color definition for a {@link LiveChase}, which may contain random values.
 */
export interface ChaseColor {
  /** The channels that define this color. */
  channels: RandomChannels

  /** default: 1 */
  // distribution?: number
}

/**
 * A live chase steps through partially random states of one or more *colors*.
 *
 * The randomness saves the effort of having to program every single step, when all
 * that is needed is a certain color theme flashing at a certain speed.
 *
 * It is meant to be changed frequently throughout a live show.
 */
export interface LiveChase {
  /**
   * Turns the chase on and off.
   *
   * When turned off, the chase is **not** stopped automatically; when turned on again,
   * it will continue as before.
   */
  on: boolean

  /**
   * Starts and stops the chase.
   *
   * Starting the chase will automatically turn it on when off.
   *
   * When stopped, the chase will stay at the same state unless
   * - it is started again
   * - a {@link step} is made
   * - it is turned off, modified, and turned on again
   */
  stopped: boolean

  /** The members that the chase is applied to. */
  members: EntityMembers

  /**
   * The intensity of the chase (0-255).
   * Behaves like an additional master channel for all contained fixtures.
   *
   * This means that it will not fade any channels that do not depend on a fixture's
   * master channel.
   */
  value: number

  /** The duration between two steps in seconds. */
  speed: number

  /**
   * Value or random definition between 0 and 1 that controls how many of the {@link members}
   * should be turned on for each step:
   * - 0: no fixtures are turned on
   * - 1: all fixtures are turned on
   */
  light: ValueOrRandom<number>

  /** The colors that make up this chase. */
  colors: ChaseColor[]

  /**
   * The fade speed in seconds.
   * For values greater than {@link speed}, the fading will never complete, but
   * switch to fading to the next step mid-fade.
   *
   * Defaults to 0.
   */
  fade?: number

  /**
   * Controls whether the {@link fade} time should be locked to the {@link speed}.
   *
   * This way, the fade time can be set to "half the speed", and stay in sync when
   * the speed is changed.
   */
  fadeLockedToSpeed?: boolean

  /**
   * Single chase mode.
   *
   * When the chase is turned on or started, all other live chases in single mode
   * are stopped and turned off.
   */
  single?: boolean

  /**
   * Burst mode - the chase is temporarily set to step very fast.
   *
   * In burst mode, {@link single} mode is ignored, i.e. other active chases are **not**
   * turned off.
   */
  burst?: boolean
}

// Widgets

/**
 * Widget that displays a part of the current DMX universe state
 */
export interface UniverseWidgetConfig {
  type: 'universe'
  /** DMX channel to start from. */
  from: number
  /** DMX channel to display up to. */
  to: number
  /** Display title of the widget. */
  title?: string
}

/**
 * Widget that displays channel faders for a part of the DMX universe
 */
export interface ChannelsWidgetConfig {
  type: 'channels'
  /** DMX channel to start from. */
  from: number
  /** DMX channel to display up to. */
  to: number
  /** Display title of the widget. */
  title?: string
}

/**
 * Widget to control the state of a fixture.
 */
export interface FixtureWidgetConfig {
  type: 'fixture'
  id: string
}

/**
 * Widget to control the state of a fixture group.
 */
export interface FixtureGroupWidgetConfig {
  type: 'fixture-group'
  id: string
}

/**
 * Widget to control the state of a memory.
 */
export interface MemoryWidgetConfig {
  type: 'memory'
  id: string
}

/**
 * Widget to control the state of a live memory.
 */
export interface LiveMemoryWidgetConfig {
  type: 'live-memory'
  id: string
}

/**
 * Widget to control the state of a live chase.
 */
export interface LiveChaseWidgetConfig {
  type: 'live-chase'
  id: string
}

/**
 * Widget to display the fixture map.
 */
export interface MapWidgetConfig {
  type: 'map'
}

/**
 * Configuration for a widget to be displayed on a dynamic page.
 */
export type WidgetConfig =
  | UniverseWidgetConfig
  | ChannelsWidgetConfig
  | FixtureWidgetConfig
  | FixtureGroupWidgetConfig
  | MemoryWidgetConfig
  | LiveMemoryWidgetConfig
  | MapWidgetConfig
  | LiveChaseWidgetConfig

/** A cell of a {@link DynamicPageRow}. */
export interface DynamicPageCell {
  /**
   * The width factor
   * Defaults to 1.
   */
  factor?: number

  /**
   * The widgets in a cell.
   *
   * Displayed next to each other; wrap into multiple lines if there is not enough space.
   */
  widgets: WidgetConfig[]
}

/** A row of a {@link DynamicPage}. */
export interface DynamicPageRow {
  /** The row's display headline. */
  headline?: string

  /**
   * The cells that make up the row.
   *
   * Displayed next to each other; wrap into multiple lines if there is not enough space.
   */
  cells: DynamicPageCell[]
}

/**
 * A configurable dynamic page to combine certain controls on a single page.
 *
 * Consists of *rows*, which consist of *cells*, which can contain
 * multiple *widgets*.
 */
export interface DynamicPage extends DbEntity {
  /** The page's display name. */
  name?: string

  /**
   * Icon to display in the navigation.
   *
   * Accepts an identifier from [materialdesignicons.com](https://materialdesignicons.com/)
   * as used in the code, e.g. `mdiAirplaneLanding`.
   *
   * In the master data processing in the backend, the identifier is resolved to its SVG path.
   */
  icon?: string

  /** The page's display headline. */
  headline?: string

  /** The rows that make up the page's content. */
  rows: DynamicPageRow[]
}
