import { EntityName, EntityArray } from '@vlight/entities'
import { ApiEntityMessage } from '@vlight/api'

import { reloadControls } from '../../controls'
import { logInfo } from '../../util/log'
import { writeDatabaseEntity } from '../database'
import { broadcastApplicationStateToApiClients } from '../api'
import { registerApiMessageHandler } from '../api/registry'
import { howLong } from '../../util/time'

import {
  reloadAffectedMasterDataEntities,
  initMasterDataEntities,
} from './entities'

// TODO currently unused
export async function reloadMasterData() {
  logInfo('Reloading master data')
  await initMasterDataEntities()
  reloadControls()
  broadcastApplicationStateToApiClients()
}

async function updateMasterDataEntity<T extends EntityName>(
  entity: T,
  entries: EntityArray<T>
) {
  logInfo(`Updating "${entity}"`)
  await writeDatabaseEntity(entity, entries)
  await reloadAffectedMasterDataEntities(entity)
  reloadControls()
  broadcastApplicationStateToApiClients()
}

function handleApiMessage(message: ApiEntityMessage<any>) {
  updateMasterDataEntity(message.entity, message.entries)
  return false
}

export function initMasterData() {
  const start = Date.now()
  registerApiMessageHandler('entity', handleApiMessage)
  howLong(start, 'initMasterData')
}

export * from './data'
