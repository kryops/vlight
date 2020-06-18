import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { memoInProduction } from '../util/development'

import { DynamicPage } from './dynamic'
import { dynamicPageRoute, _entryRoute } from './routes'

import { mainNavigationItems, standaloneRoutes } from '.'

export const RoutesOutlet = memoInProduction(() => (
  <Switch>
    {[...mainNavigationItems, ...standaloneRoutes].map(({ route, page }) => (
      <Route key={route} path={route} exact component={page} />
    ))}
    <Route path={dynamicPageRoute()} exact component={DynamicPage} />
    <Redirect to={_entryRoute} />
  </Switch>
))
