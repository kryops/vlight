import {
  Dictionary,
  FixtureState,
  IdType,
  MasterData,
  MemoryState,
  EntityName,
  EntityArray,
  LiveMemory,
  LiveChase,
  EntityType,
} from './entities'

// Both ingoing + outgoing

/** Set one or multiple DMX channels. */
export interface ApiChannelMessage {
  type: 'channels'

  /**
   * The channels to set:
   * - keys from 1-512
   * - values from 0-255
   */
  channels: Dictionary<number>
}

/** Change the state of one or multiple fixtures. */
export interface ApiFixtureStateMessage {
  type: 'fixture'
  id: IdType | IdType[]
  state: Partial<FixtureState>

  /**
   * If set, the given {@link state} is merged onto the existing one instead of
   * overwriting it completely.
   *
   * Defaults to `false`.
   */
  merge?: boolean
}

/** Change the state of one or multiple fixture groups. */
export interface ApiFixtureGroupStateMessage {
  type: 'fixture-group'
  id: IdType | IdType[]
  state: Partial<FixtureState>

  /**
   * If set, the given {@link state} is merged onto the existing one instead of
   * overwriting it completely.
   *
   * Defaults to `false`.
   */
  merge?: boolean
}

/** Change the state of one or multiple memories. */
export interface ApiMemoryStateMessage {
  type: 'memory'
  id: IdType | IdType[]
  state: Partial<MemoryState>

  /**
   * If set, the given {@link state} is merged onto the existing one instead of
   * overwriting it completely.
   *
   * Defaults to `false`.
   */
  merge?: boolean
}

/** Create/update a live memory. */
export interface ApiLiveMemoryMessage {
  type: 'live-memory'
  id: IdType
  /** `null` = Delete live memory */
  state: Partial<LiveMemory> | null

  /**
   * If set, the given {@link state} is merged onto the existing one instead of
   * overwriting it completely.
   *
   * Defaults to `false`.
   */
  merge?: boolean
}

/** Create/update a live chase */
export interface ApiLiveChaseMessage {
  type: 'live-chase'
  id: IdType

  /** `null` = Delete live chase */
  state: Partial<LiveChase> | null

  /**
   * If set, the chase is moved one step forward:
   * - Moves a single step when stopped
   * - Re-syncs the step interval when started
   */
  step?: boolean

  /**
   * If set, the given {@link state} is merged onto the existing one instead of
   * overwriting it completely.
   *
   * Defaults to `false`.
   */
  merge?: boolean
}

/** Change the DMX master value. */
export interface ApiDmxMasterMessage {
  type: 'dmx-master'

  /**
   * DMX master value from 0-255.
   */
  value: number
}

// Incoming messages

/** Overwrite the master data entities of a certain type. */
export interface ApiEntityMessage<T extends EntityName> {
  type: 'entity'
  entity: T
  entries: EntityArray<T>
}

/** Add a master data entity. */
export interface ApiAddEntityMessage<T extends EntityName> {
  type: 'add-entity'
  entity: T
  entry: EntityType<T>
}

/** Update a master data entity. */
export interface ApiUpdateEntityMessage<T extends EntityName> {
  type: 'update-entity'
  entity: T
  entry: EntityType<T>
}

/** Remove a master data entity. */
export interface ApiRemoveEntityMessage<T extends EntityName> {
  type: 'remove-entity'
  entity: T
  id: IdType
}

/** Reset the application state. */
export interface ApiResetStateMessage {
  type: 'reset-state'
}

/** Messages that can flow from the client to the server. */
export type ApiInMessage<T extends EntityName = any> =
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage
  | ApiMemoryStateMessage
  | ApiLiveMemoryMessage
  | ApiLiveChaseMessage
  | ApiEntityMessage<T>
  | ApiAddEntityMessage<T>
  | ApiUpdateEntityMessage<T>
  | ApiRemoveEntityMessage<T>
  | ApiResetStateMessage
  | ApiDmxMasterMessage

// Outgoing messages

export interface ApiHeartBeatMessage {
  type: 'heartbeat'
}

/**
 * Backend state to be synced to the client.
 * This message is sent automatically after a socket connects.
 */
export interface ApiStateMessage {
  type: 'state'

  /** Dictionary of all (pre-processed) master data entities as arrays. */
  masterData: MasterData

  /** Dictionary of all raw (non pre-processed) master data entities as arrays. */
  rawMasterData: MasterData

  /** The complete DMX512 universe. */
  universe: number[]

  /** State of the channel controls. */
  channels: number[]

  /** Dictionary of all fixture control states. */
  fixtures: Dictionary<FixtureState>

  /** Dictionary of all fixture group control states. */
  fixtureGroups: Dictionary<FixtureState>

  /** Dictionary of all memory control states. */
  memories: Dictionary<MemoryState>

  /** Dictionary of all live memory control states. */
  liveMemories: Dictionary<LiveMemory>

  /** Dictionary of all live chase control states. */
  liveChases: Dictionary<LiveChase>

  /** Global DMX master value. */
  dmxMaster: number
}

/**
 * master data to be synced to the client after changes.
 */
export interface ApiMasterDataMessage {
  type: 'masterdata'
  /** Dictionary of all (pre-processed) master data entities as arrays. */
  masterData: MasterData

  /** Dictionary of all raw (non pre-processed) master data entities as arrays. */
  rawMasterData: MasterData
}

/** Contains the whole DMX universe */
export interface ApiUniverseMessage {
  type: 'universe'
  universe: number[]
}

/** Contains an object with changed DMX channels */
export interface ApiUniverseDeltaMessage {
  type: 'universe-delta'

  /**
   * The channels that have changed:
   * - keys from 1-512
   * - values from 0-255
   */
  channels: Dictionary<number>
}

/** Messages that can flow from the server to the client. */
export type ApiOutMessage =
  | ApiHeartBeatMessage
  | ApiStateMessage
  | ApiMasterDataMessage
  | ApiUniverseMessage
  | ApiUniverseDeltaMessage
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage
  | ApiMemoryStateMessage
  | ApiLiveMemoryMessage
  | ApiLiveChaseMessage
  | ApiDmxMasterMessage
