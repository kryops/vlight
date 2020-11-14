import {
  ApiChannelMessage,
  ApiFixtureStateMessage,
  ApiFixtureGroupStateMessage,
  ApiMemoryStateMessage,
  ApiRemoveEntityMessage,
  ApiUpdateEntityMessage,
  ApiAddEntityMessage,
  ApiEntityMessage,
  FixtureState,
  IdType,
  MemoryState,
  EntityName,
  EntityType,
  ApiResetStateMessage,
  LiveMemory,
  ApiLiveMemoryMessage,
} from '@vlight/types'

export function getApiChannelMessage(
  channels: number[],
  value: number
): ApiChannelMessage {
  const message: ApiChannelMessage = {
    type: 'channels',
    channels: {},
  }
  channels.forEach(channel => (message.channels[channel] = value))
  return message
}

export function getApiFixtureStateMessage(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge: boolean
): ApiFixtureStateMessage {
  return {
    type: 'fixture',
    id,
    state,
    merge,
  }
}

export function getApiFixtureGroupStateMessage(
  id: IdType | IdType[],
  state: Partial<FixtureState>,
  merge: boolean
): ApiFixtureGroupStateMessage {
  return {
    type: 'fixture-group',
    id,
    state,
    merge,
  }
}

export function getApiMemoryStateMessage(
  id: IdType | IdType[],
  state: Partial<MemoryState>,
  merge: boolean
): ApiMemoryStateMessage {
  return {
    type: 'memory',
    id,
    state,
    merge,
  }
}

export function getApiEditEntityMessage<T extends EntityName>(
  entity: T,
  entry: EntityType<T>
): ApiAddEntityMessage<T> | ApiUpdateEntityMessage<T> {
  return {
    type: entry.id ? 'update-entity' : 'add-entity',
    entity,
    entry,
  }
}

export function getApiRemoveEntityMessage<T extends EntityName>(
  entity: T,
  id: IdType
): ApiRemoveEntityMessage<T> {
  return {
    type: 'remove-entity',
    entity,
    id,
  }
}

export function getApiSetEntitiesMessage<T extends EntityName>(
  entity: T,
  entries: EntityType<T>[]
): ApiEntityMessage<T> {
  return {
    type: 'entity',
    entity,
    entries,
  }
}

export function getResetStateMessage(): ApiResetStateMessage {
  return { type: 'reset-state' }
}

export function getApiLiveMemoryMessage(
  id: IdType,
  liveMemory: Partial<LiveMemory>,
  merge: boolean
): ApiLiveMemoryMessage {
  return {
    type: 'live-memory',
    id,
    state: liveMemory,
    merge,
  }
}
