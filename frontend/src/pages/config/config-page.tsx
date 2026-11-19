import { EntityName } from '@vlight/types'

import { settingsPageRoute, entitiesPageRoute } from '../routes'
import { TileGrid, Tile } from '../../ui/containers/tiles'
import { iconConfig } from '../../ui/icons'

import { entityUiMapping } from './entities/entity-ui-mapping'

/**
 * Configuration page.
 *
 * Displays links to
 * - the settings page
 * - configuration pages for all master data entities
 */
const ConfigPage = () => {
  return (
    <div>
      <h1>Config</h1>
      <TileGrid>
        <Tile icon={iconConfig} title="Settings" target={settingsPageRoute} />
        {Object.entries(entityUiMapping).map(
          ([type, { name, icon }], index) => (
            <Tile
              key={index}
              title={name}
              icon={icon}
              target={entitiesPageRoute(type as EntityName)}
            />
          )
        )}
      </TileGrid>
    </div>
  )
}

export default ConfigPage
