import { useParams } from 'react-router'
import { EntityName } from '@vlight/types'

import { BackArrow } from '../../../ui/components/back-arrow'
import { useRawMasterData } from '../../../hooks/api'
import { Icon } from '../../../ui/icons/icon'
import { iconAdd } from '../../../ui/icons'
import { BackLink } from '../../../ui/components/back-link'
import { Header } from '../../../ui/containers/header'

import { entityUiMapping } from './entity-ui-mapping'
import { EntityList } from './entity-list'
import { openEntityEditor } from './editors'

/**
 * Page to edit raw (non pre-processed) master data entities of a certain type
 * set by a route param.
 *
 * Displays a sortable list of entries that can be edited or deleted,
 * and a button to add one.
 */
const EntitiesPage = () => {
  const { type } = useParams<{ type: EntityName }>()
  const rawMasterData = useRawMasterData()

  const openEditor = () => type && openEntityEditor(type)

  if (!type || !entityUiMapping[type]) return null
  const entries = rawMasterData[type]

  return (
    <div>
      <Header
        rightContent={
          <Icon icon={iconAdd} size={8} hoverable inline onClick={openEditor} />
        }
      >
        <BackArrow />
        <BackLink>{entityUiMapping[type]?.name}</BackLink>
      </Header>
      <EntityList type={type} entries={entries as any} />
    </div>
  )
}

export default EntitiesPage
