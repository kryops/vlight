/**
 * Well-known DMX channel types that usually have certain features attached.
 */
export enum ChannelType {
  /**
   * The master channel usually controls the overall brightness of a fixture.
   *
   * In vLight, all fixture types are treated as if they had a master channel.
   *
   * For fixtures without an actual master channel, the dependent channels are
   * dimmed down accordingly.
   *
   * For fixtures without a master channel, the dependent channels are dimmed down
   * if another control sets the master channel to a higher value.
   */
  Master = 'm',

  /**
   * Red channel
   * - Depends on the fixture's master channel
   * - Can be controlled through the color picker
   */
  Red = 'r',

  /**
   * Green channel
   * - Depends on the fixture's master channel
   * - Can be controlled through the color picker
   */
  Green = 'g',

  /**
   * Blue channel
   * - Depends on the fixture's master channel
   * - Can be controlled through the color picker
   */
  Blue = 'b',

  /**
   * White channel
   * - Depends on the fixture's master channel
   */
  White = 'w',

  /**
   * UV channel
   * - Depends on the fixture's master channel
   */
  UV = 'uv',

  /**
   * Moving head pan channel
   */
  Pan = 'pan',

  /**
   * Moving head pan fine channel
   */
  PanFine = 'panf',

  /**
   * Moving head tilt channel
   */
  Tilt = 'tilt',

  /**
   * Moving head tilt fine channel
   */
  TiltFine = 'tiltf',
}

/**
 * Prefixes to identify different modes of grouping fixtures together.
 */
export enum FixtureMappingPrefix {
  /**
   * Groups fixtures together by their definition.
   */
  All = 'all:',

  /**
   * Groups fixtures together by their type.
   */
  Type = 'type:',

  /**
   * Groups fixtures together by linking to a fixture group.
   */
  Group = 'group:',
}
