import { join } from 'path'
import fs from 'fs'

import prettier from 'prettier'
import { EntityDictionary, EntityName, EntityArray } from '@vlight/entities'

import { configDirectoryPath, project } from '../../config'
import { logWarn } from '../../../util/log'

import { DatabaseBackend } from './database-backend'

const { writeFile } = fs.promises

// TODO move to entity definition
const globalEntities = new Set<EntityName>(['fixtureTypes'])

const entityToTypeName: EntityDictionary = {
  fixtureTypes: 'FixtureType[]',
  fixtures: 'Fixture[]',
  fixtureGroups: 'FixtureGroup[]',
  memories: 'Memory[]',
  dynamicPages: 'DynamicPage[]',
}

const entityToFileName: EntityDictionary = {
  fixtureTypes: 'fixture-types',
  fixtures: 'fixtures',
  fixtureGroups: 'fixture-groups',
  memories: 'memories',
  dynamicPages: 'dynamic-pages',
}

function getModulePath(entity: EntityName) {
  const fileName = entityToFileName[entity]
  return globalEntities.has(entity)
    ? join(configDirectoryPath, fileName)
    : join(configDirectoryPath, project, fileName)
}

export class JsDatabaseBackend implements DatabaseBackend {
  async loadEntities<T extends EntityName>(entity: T) {
    const configPath = getModulePath(entity)

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
    entries: EntityArray<T>
  ) {
    const filePath = getModulePath(entity) + '.js'

    const prettierConfig = await prettier.resolveConfig(filePath)

    const fileContent = prettier.format(
      `// @ts-check
  /** @type {import('@vlight/shared/types/entities').${
    entityToTypeName[entity]
  }} */
  const ${entity} = ${JSON.stringify(entries, null, 2)}
  
  module.exports = ${entity}
`,
      prettierConfig ?? undefined
    )

    await writeFile(filePath, fileContent)
  }
}
