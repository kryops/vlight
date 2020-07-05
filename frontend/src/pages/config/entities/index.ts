import { RouteEntry } from '../../index'
import { entitiesPageRoute } from '../../routes'

import EntitiesPage from './entities-page'

export const entitiesPageEntry: RouteEntry = {
  route: entitiesPageRoute(),
  page: EntitiesPage,
}
