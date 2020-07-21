import { join } from 'path'
import fs from 'fs'

import prettier from 'prettier'
import { EntityName, EntityArray, EntityType, IdType } from '@vlight/entities'

import { configDirectoryPath, project } from '../../config'
import { logger } from '../../../util/shared'

import { DatabaseBackend, DatabaseEntityOptions } from './database-backend'

const { writeFile } = fs.promises

function entityNameToFileName(entityName: EntityName) {
  return entityName
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function getModulePath(entity: EntityName, isGlobal: boolean) {
  const fileName = entityNameToFileName(entity)
  return isGlobal
    ? join(configDirectoryPath, fileName)
    : join(configDirectoryPath, project, fileName)
}

// TODO generate ID based on name?
function generateId(entries: EntityArray): string {
  let highestNumber = 0
  for (const entry of entries) {
    if (entry.id.match(/^\d+$/)) {
      const value = parseInt(entry.id)
      if (value > highestNumber) highestNumber = value
    }
  }
  return String(highestNumber + 1)
}

const cache = new Map<EntityName, EntityArray<any>>()

export class JsDatabaseBackend implements DatabaseBackend {
  async loadEntities<T extends EntityName>(
    entity: T,
    { global }: DatabaseEntityOptions = {}
  ): Promise<EntityArray<T>> {
    const cached = cache.get(entity)
    if (cached) return cached

    const configPath = getModulePath(entity, !!global)

    // enable reloading
    delete require.cache[require.resolve(configPath)]
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const rawEntries: EntityArray<T> = require(configPath)
      cache.set(entity, rawEntries)
      return rawEntries
    } catch (error) {
      logger.warn(`No database file found for entity "${entity}"`)
      return []
    }
  }

  async writeEntities<T extends EntityName>(
    entity: T,
    entries: EntityArray<T>,
    { global }: DatabaseEntityOptions = {}
  ): Promise<void> {
    cache.set(entity, entries)

    const filePath = getModulePath(entity, !!global) + '.js'

    const prettierConfig = await prettier.resolveConfig(filePath)

    const fileContent = prettier.format(
      `const ${entity} = ${JSON.stringify(entries, null, 2)}
  
  module.exports = ${entity}
`,
      prettierConfig ?? undefined
    )

    await writeFile(filePath, fileContent)
  }

  async addEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>> {
    const oldEntries = await this.loadEntities(entity, options)
    const newEntry = { ...entry, id: generateId(oldEntries) }
    const entries = [...oldEntries, newEntry]
    await this.writeEntities(entity, entries, options)
    return entries
  }

  async updateEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>> {
    const entries = (await this.loadEntities(entity, options)).map(it =>
      it.id === entry.id ? entry : it
    )
    await this.writeEntities(entity, entries, options)
    return entries
  }

  async removeEntry<T extends EntityName>(
    entity: T,
    id: IdType,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>> {
    const entries = (await this.loadEntities(entity, options)).filter(
      it => it.id !== id
    )
    await this.writeEntities(entity, entries, options)
    return entries
  }

  async clearCache(): Promise<void> {
    cache.clear()
  }
}
