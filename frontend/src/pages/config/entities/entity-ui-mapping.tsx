import React from 'react'
import { EntityName, EntityType } from '@vlight/entities'

import {
  iconFixtureType,
  iconLight,
  iconGroup,
  iconMemory,
  iconDynamicPage,
} from '../../../ui/icons'

import { FixtureTypeEditor } from './editors/fixture-type-editor'

export interface EntityEditorProps<T extends EntityName> {
  entry: EntityType<T>
  onChange: (entry: EntityType<T>) => void
}

export interface EntityEntry<T extends EntityName> {
  name: string
  icon: string
  editor?: React.ComponentType<EntityEditorProps<T>>
  newEntityFactory?: () => Omit<EntityType<T>, 'id'>
}

export const entityUiMapping: { [key in EntityName]: EntityEntry<key> } = {
  fixtureTypes: {
    name: 'Fixture Types',
    icon: iconFixtureType,
    editor: FixtureTypeEditor,
    newEntityFactory: () => ({ name: 'New Fixture Type', mapping: ['m'] }),
  },
  fixtures: {
    name: 'Fixtures',
    icon: iconLight,
  },
  fixtureGroups: {
    name: 'Fixture Groups',
    icon: iconGroup,
  },
  memories: {
    name: 'Memories',
    icon: iconMemory,
  },
  dynamicPages: {
    name: 'Dynamic Pages',
    icon: iconDynamicPage,
  },
}
