/**
 * A DMX universe is represented as a buffer of 512 bytes.
 */
export type Universe = Buffer

/**
 * State of a universe that controls how the final DMX universe is computed.
 */
export interface UniverseState {
  /**
   * The universe's master value.
   *
   * Defaults to 255.
   */
  masterValue?: number

  /**
   * Controls whether the universe's master value is applied to all of its channels,
   * even if they normally depend on a fixture master channel.
   *
   * Defaults to `false`.
   */
  forceMaster?: boolean
}
