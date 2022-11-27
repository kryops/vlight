import { RouteEntry } from '../../types'
import { entitiesPageRoute } from '../../routes'

import EntitiesPage from './entities-page'

export const entitiesPageEntry: RouteEntry = {
  route: entitiesPageRoute(),
  page: EntitiesPage,
}
