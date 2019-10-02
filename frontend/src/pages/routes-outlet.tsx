import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { memoInProduction } from '../util/development'

import { dynamicPageRoute, DynamicPage } from './dynamic'

import { entryRoute, mainNavigationItems } from '.'

export const RoutesOutlet = memoInProduction(() => (
  <Switch>
    {mainNavigationItems.map(({ route, page }) => (
      <Route key={route} path={route} exact component={page} />
    ))}
    <Route path={dynamicPageRoute()} exact component={DynamicPage} />
    <Redirect to={entryRoute} />
  </Switch>
))
