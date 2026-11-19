import { join } from 'path'
import { writeFile, stat, mkdir } from 'fs/promises'

import { format, FormatOptions } from 'oxfmt'
import { EntityName, EntityArray, EntityType, IdType } from '@vlight/types'
import { logger } from '@vlight/utils'

import { configDirectoryPath, project } from '../../config'

import { DatabaseBackend, DatabaseEntityOptions } from './database-backend'

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

/**
 * Generates an ID for a new entry.
 *
 * Currently, the IDs are created as integer numbers in ascending order.
 * This may change in the future.
 */
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

/**
 * Formatting options for the generated files,
 * matching the `fmt` config in the root vite.config.ts.
 */
const formatConfig: FormatOptions = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'avoid',
}

const cache = new Map<EntityName, EntityArray<any>>()

/**
 * Simple database backend that stores its data as JavaScript files
 * under `/config/<project>/<entityType>.js`.
 *
 * The data can be checked into version control easily, and edited manually if desired.
 */
export class JsDatabaseBackend implements DatabaseBackend {
  async loadEntities<T extends EntityName>(
    entity: T,
    { global }: DatabaseEntityOptions = {}
  ): Promise<EntityArray<T>> {
    const cached = cache.get(entity)
    if (cached) return cached

    const configPath = getModulePath(entity, !!global)

    // enable reloading
    try {
      delete require.cache[require.resolve(configPath)]
    } catch {
      // do nothing
    }
    try {
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

    const { code: fileContent, errors } = await format(
      filePath,
      `const ${entity} = ${JSON.stringify(entries, null, 2)}

  module.exports = ${entity}
`,
      formatConfig
    )
    if (errors.length) {
      throw new Error(
        `Failed to format ${filePath}: ${errors.map(e => e.message).join(', ')}`
      )
    }

    // Create project directory if it does not exist
    const projectDirectory = join(filePath, '..')
    try {
      await stat(projectDirectory)
    } catch {
      await mkdir(projectDirectory)
    }

    await writeFile(filePath, fileContent)
  }

  async addEntry<T extends EntityName>(
    entity: T,
    entry: EntityType<T>,
    options?: DatabaseEntityOptions
  ): Promise<EntityArray<T>> {
    const oldEntries = await this.loadEntities(entity, options)
    const newEntry = { ...entry, id: entry.id || generateId(oldEntries) }
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
