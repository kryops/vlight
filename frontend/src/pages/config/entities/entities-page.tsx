import { useParams } from 'react-router'
import { useState } from 'react'
import { EntityName, EntityType } from '@vlight/types'

import { BackArrow } from '../../../ui/components/back-arrow'
import { useRawMasterData } from '../../../hooks/api'
import { Icon } from '../../../ui/icons/icon'
import { iconAdd } from '../../../ui/icons'
import { BackLink } from '../../../ui/components/back-link'
import { Header } from '../../../ui/containers/header'
import { useSearch } from '../../../hooks/search'
import { SearchToggle } from '../../../ui/components/search-toggle'
import { NoSearchResults } from '../../../ui/components/no-search-results'
import { getEntityName } from '../../../util/entities'

import { entityUiMapping } from './entity-ui-mapping'
import { EntityList } from './entity-list'
import { openEntityEditor } from './editors'

/**
 * Page to edit raw (non pre-processed) master data entities of a certain type
 * set by a route param.
 *
 * Displays a sortable list of entries that can be edited or deleted,
 * and a button to add one.
 *
 * The list can be filtered by name; sorting is disabled while filtering.
 */
const EntitiesPage = () => {
  const { type } = useParams<{ type: EntityName }>()
  const rawMasterData = useRawMasterData()
  const search = useSearch()

  // reset the search when navigating to another entity type
  const [prevType, setPrevType] = useState(type)
  if (type !== prevType) {
    setPrevType(type)
    search.setQuery('')
  }

  const openEditor = () => type && openEntityEditor(type)

  if (!type || !entityUiMapping[type]) return null
  const allEntries = rawMasterData[type] as EntityType[]
  const entries = search.active
    ? allEntries.filter(entry =>
        search.matches(getEntityName(entry) ?? entry.id)
      )
    : allEntries

  return (
    <div>
      <Header
        rightContent={
          <>
            <SearchToggle {...search} />
            <Icon
              title="Add"
              icon={iconAdd}
              size={8}
              hoverable
              inline
              onClick={openEditor}
            />
          </>
        }
      >
        <BackArrow />
        <BackLink>{entityUiMapping[type]?.name}</BackLink>
      </Header>
      <EntityList
        type={type}
        entries={entries as any}
        sortingDisabled={search.active}
      />
      {search.active && entries.length === 0 && <NoSearchResults />}
    </div>
  )
}

export default EntitiesPage
