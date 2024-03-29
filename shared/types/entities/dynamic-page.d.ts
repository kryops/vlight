import { DbEntity } from './util'

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
 * Widget to control the state of one or multiple fixtures.
 */
export interface FixtureWidgetConfig {
  type: 'fixture'
  id: string | string[]
  mapping?: string[]
}

/**
 * Widget to control the state of one or multiple fixture groups.
 */
export interface FixtureGroupWidgetConfig {
  type: 'fixture-group'
  id: string | string[]
  mapping?: string[]
}

/**
 * Widget to control the state of one or multiple memories.
 */
export interface MemoryWidgetConfig {
  type: 'memory'
  id: string | string[]
}

/**
 * Widget to control the state of one or multiple live memories.
 */
export interface LiveMemoryWidgetConfig {
  type: 'live-memory'
  id: string | string[]
}

/**
 * Widget to control the state of one or multiple live chases.
 */
export interface LiveChaseWidgetConfig {
  type: 'live-chase'
  id: string | string[]
}

/**
 * Widget to display the fixture map.
 */
export interface MapWidgetConfig {
  type: 'map'
}

/**
 * Widget to display the DMX master and blackout controls.
 */
export interface DmxMasterWidgetConfig {
  type: 'dmx-master'
}

/**
 * Widget to display the controls widget (all off).
 */
export interface ControlsWidgetConfig {
  type: 'controls'
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
  | DmxMasterWidgetConfig
  | ControlsWidgetConfig

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
