import { Navigate, Route, Routes } from 'react-router-dom'

import { memoInProduction } from '../util/development'

import { DynamicPage } from './dynamic'
import { dynamicPageRoute, _entryRoute } from './routes'

import { mainNavigationItems, standaloneRoutes } from '.'

export const RoutesOutlet = memoInProduction(() => (
  <Routes>
    {[...mainNavigationItems, ...standaloneRoutes].map(
      ({ route, page: Page }) => (
        <Route key={route} path={route} element={<Page />} />
      )
    )}
    <Route path={dynamicPageRoute()} element={<DynamicPage />} />
    <Route path="/" element={<Navigate to={_entryRoute} replace />} />
  </Routes>
))
