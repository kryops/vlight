import { EntityName } from '@vlight/entities'

import {
  iconFixtureType,
  iconLight,
  iconGroup,
  iconMemory,
  iconDynamicPage,
} from '../../../ui/icons'

interface EntityEntry {
  name: string
  icon: string
}

export const entityUiMapping: { [key in EntityName]: EntityEntry } = {
  fixtureTypes: {
    name: 'Fixture Types',
    icon: iconFixtureType,
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
