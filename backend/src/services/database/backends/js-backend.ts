import { join } from 'path'
import fs from 'fs'

import prettier from 'prettier'
import { EntityName, EntityArray } from '@vlight/entities'

import { configDirectoryPath, project } from '../../config'
import { logWarn } from '../../../util/log'

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

export class JsDatabaseBackend implements DatabaseBackend {
  async loadEntities<T extends EntityName>(
    entity: T,
    { global }: DatabaseEntityOptions = {}
  ): Promise<EntityArray<T>> {
    const configPath = getModulePath(entity, !!global)

    // enable reloading
    delete require.cache[require.resolve(configPath)]
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const rawEntries: EntityArray<T> = require(configPath)
      return rawEntries
    } catch (error) {
      logWarn(`No database file found for entity "${entity}"`)
      return []
    }
  }

  async writeEntities<T extends EntityName>(
    entity: T,
    entries: EntityArray<T>,
    { global }: DatabaseEntityOptions = {}
  ): Promise<void> {
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
}
