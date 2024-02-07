import { EntityName } from '@vlight/types'
import { logger } from '@vlight/utils'

import { getMasterDataEntityDefinition } from './registry'
import { allEntityNames } from './data'

/**
 * Entites can define dependencies they need for processing their values
 * (e.g. memories -> fixture groups -> fixtures -> fixture types).
 *
 * This function determines the correct order to load the entities in
 * while satisfying all dependencies.
 */
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
      logger.error('Masterdata entity dependency loop detected')
      break
    }
  }

  return order
}

/**
 * Returns the names of all entity types that are affected (directly or transitively)
 * by a change of the given entity type.
 *
 * The names are returned in the correct order respecting their dependencies.
 */
export function getAffectedEntities(
  changedEntities: EntityName[]
): EntityName[] {
  const entityNamesInOrder = getEntitiesInDependencyOrder()

  const affected: EntityName[] = [...changedEntities]
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

  return entityNamesInOrder.filter(it => affected.includes(it))
}
