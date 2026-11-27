/**
 * Dimensions of the fixture map.
 *
 * All map coordinates and sizes (fixture positions, offsets, fixture type sizes)
 * are relative to these dimensions.
 */
export interface MapSettings {
  /**
   * The width of the map.
   *
   * Defaults to 100.
   */
  width: number

  /**
   * The height of the map.
   *
   * Defaults to 100.
   */
  height: number
}

/**
 * Project-wide settings that are persisted on the server
 * in `/config/<project>/settings.json`.
 */
export interface ProjectSettings {
  map: MapSettings
}
