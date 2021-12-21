import { useParams } from 'react-router'
import { EntityName } from '@vlight/types'

import { memoInProduction } from '../../../util/development'
import { BackArrow } from '../../../ui/components/back-arrow'
import { useRawMasterData } from '../../../hooks/api'
import { Icon } from '../../../ui/icons/icon'
import { iconAdd } from '../../../ui/icons'
import { BackLink } from '../../../ui/components/back-link'
import { Header } from '../../../ui/containers/header'

import { entityUiMapping } from './entity-ui-mapping'
import { EntityList } from './entity-list'
import { openEntityEditor } from './editors'

const EntitiesPage = memoInProduction(() => {
  const { type } = useParams<{ type: EntityName }>()
  const rawMasterData = useRawMasterData()

  if (!type || !entityUiMapping[type]) return null
  const entries = rawMasterData[type]

  return (
    <div>
      <Header
        rightContent={
          <Icon
            icon={iconAdd}
            size={8}
            hoverable
            inline
            onClick={() => openEntityEditor(type)}
          />
        }
      >
        <BackArrow />
        <BackLink>{entityUiMapping[type].name}</BackLink>
      </Header>
      <EntityList type={type} entries={entries as any} />
    </div>
  )
})

export default EntitiesPage
