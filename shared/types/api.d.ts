import {
  Action,
  Dictionary,
  FixtureState,
  IdType,
  MasterData,
  MemoryState,
  EntityName,
  EntityArray,
  LiveMemory,
  LiveChase,
  LiveMovement,
  EntityType,
  SequenceControl,
  SequenceState,
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

/** Create/update a live movement */
export interface ApiLiveMovementMessage {
  type: 'live-movement'
  id: IdType

  /** `null` = Delete live movement */
  state: Partial<LiveMovement> | null

  /**
   * If set, the movement's phase is reset so that all members return to the center.
   *
   * Should be combined with `stopped: true` to keep them there.
   */
  reset?: boolean

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
  value?: number

  /**
   * Fade speed in seconds.
   *
   * To support fading constantly changing universes, this value is converted into
   * into a speed of moving the fader that matches the fade time for a complete off-on fade.
   *
   * Defaults to 0.
   */
  fade?: number
}

/**
 * Globally pause/resume all controls that continuously recompute their universe
 * (live chases, moving live memory gradients, live movements).
 *
 * When resuming, they continue from where they were paused.
 */
export interface ApiPauseMessage {
  type: 'pause'
  paused: boolean
}

// Incoming messages

/**
 * Presses or releases a programmable button, executing its actions
 * depending on its mode.
 */
export interface ApiButtonMessage {
  type: 'button'
  id: IdType

  /** `true` when the button is pressed, `false` when it is released. */
  down: boolean
}

/**
 * Controls a sequence, e.g. starting or stopping it.
 */
export interface ApiSequenceMessage {
  type: 'sequence'
  id: IdType
  control: SequenceControl
}

/**
 * Executes the given actions immediately, in order.
 *
 * Their changes are not reverted.
 */
export interface ApiActionsMessage {
  type: 'actions'
  actions: Action[]
}

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

/**
 * Subscribes or unsubscribes the sending client to DMX universe updates.
 *
 * Only subscribed clients receive `universe-delta` messages.
 * Upon subscribing, the client is sent the complete universe.
 * Subscriptions end when the connection is closed.
 */
export interface ApiUniverseSubscriptionMessage {
  type: 'universe-subscription'
  subscribe: boolean
}

/** Messages that can flow from the client to the server. */
export type ApiInMessage<T extends EntityName = any> =
  | ApiChannelMessage
  | ApiFixtureStateMessage
  | ApiFixtureGroupStateMessage
  | ApiMemoryStateMessage
  | ApiLiveMemoryMessage
  | ApiLiveChaseMessage
  | ApiLiveMovementMessage
  | ApiEntityMessage<T>
  | ApiAddEntityMessage<T>
  | ApiUpdateEntityMessage<T>
  | ApiRemoveEntityMessage<T>
  | ApiResetStateMessage
  | ApiDmxMasterMessage
  | ApiPauseMessage
  | ApiButtonMessage
  | ApiSequenceMessage
  | ApiActionsMessage
  | ApiUniverseSubscriptionMessage

// Outgoing messages

/**
 * Notifies about a changed state of a programmable button.
 */
export interface ApiButtonStateMessage {
  type: 'button-state'
  id: IdType

  /**
   * Whether the button is currently active, i.e.
   * - pressed in `flash` mode
   * - toggled on in `toggle` mode
   */
  active: boolean
}

/**
 * Notifies about a changed state of a sequence.
 *
 * Sent when the sequence is started/paused/stopped, when a step is reached,
 * and about once a second while it is running to update the elapsed time.
 */
export interface ApiSequenceStateMessage {
  type: 'sequence-state'
  id: IdType

  /** The new state, or `null` if the sequence was stopped. */
  state: SequenceState | null
}

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

  /** Dictionary of all live movement control states. */
  liveMovements: Dictionary<LiveMovement>

  /** Global DMX master value. */
  dmxMaster: number

  /** Global DMX master fade time in seconds. */
  dmxMasterFade: number

  /** Whether all continuously recomputing controls are globally paused. */
  paused: boolean

  /**
   * Dictionary of the active state of all programmable buttons
   * (see {@link ApiButtonStateMessage.active}).
   *
   * Not persisted, as the changes to revert cannot be restored after a restart.
   */
  buttons: Dictionary<boolean>

  /**
   * Dictionary of the runtime state of all started (running or paused) sequences.
   *
   * Not persisted, as the changes to revert cannot be restored after a restart.
   */
  sequences: Dictionary<SequenceState>
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
  | ApiLiveMovementMessage
  | ApiDmxMasterMessage
  | ApiPauseMessage
  | ApiButtonStateMessage
  | ApiSequenceStateMessage
