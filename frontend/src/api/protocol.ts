import {
  ApiChannelMessage,
  ApiFixtureStateMessage,
  ApiFixtureGroupStateMessage,
  ApiMemoryStateMessage,
  ApiRemoveEntityMessage,
  ApiUpdateEntityMessage,
  ApiAddEntityMessage,
} from '@vlight/api'
import {
  FixtureState,
  IdType,
  MemoryState,
  EntityName,
  EntityType,
} from '@vlight/entities'

export function getApiChannelMessage(
  channel: number,
  value: number
): ApiChannelMessage {
  return {
    type: 'channels',
    channels: {
      [channel]: value,
    },
  }
}

export function getApiFixtureStateMessage(
  id: IdType,
  state: FixtureState
): ApiFixtureStateMessage {
  return {
    type: 'fixture',
    id,
    state,
  }
}

export function getApiFixtureGroupStateMessage(
  id: IdType,
  state: FixtureState
): ApiFixtureGroupStateMessage {
  return {
    type: 'fixture-group',
    id,
    state,
  }
}

export function getApiMemoryStateMessage(
  id: IdType,
  state: MemoryState
): ApiMemoryStateMessage {
  return {
    type: 'memory',
    id,
    state,
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
