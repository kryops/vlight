import { EntityName } from '@vlight/entities'

import { logError } from '../../util/log'

import { getMasterDataEntityDefinition } from './registry'
import { allEntityNames } from './data'

export function getEntitiesInDependencyOrder(): EntityName[] {
  const entityCount = allEntityNames.length
  const order: EntityName[] = []

  while (order.length < entityCount) {
    const currentCount = order.length
    for (const entity of allEntityNames) {
      if (order.includes(entity)) continue
      const definition = getMasterDataEntityDefinition(entity)
      if (
        !definition?.dependencies ||
        definition.dependencies.every(dep => order.includes(dep))
      ) {
        order.push(entity)
      }
    }
    if (currentCount === order.length) {
      logError('Masterdata entity dependency loop detected')
      break
    }
  }

  return order
}

export function getAffectedEntities(changedEntity: EntityName): EntityName[] {
  const entityNamesInOrder = getEntitiesInDependencyOrder()

  const affected: EntityName[] = [changedEntity]
  while (true) {
    const currentCount = affected.length
    for (const entity of entityNamesInOrder) {
      if (affected.includes(entity)) continue
      const definition = getMasterDataEntityDefinition(entity)
      if (definition?.dependencies?.some(dep => affected.includes(dep))) {
        affected.push(entity)
      }
    }
    if (currentCount === affected.length) {
      break
    }
  }

  return affected
}
