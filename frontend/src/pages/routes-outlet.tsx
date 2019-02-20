import React, { memo } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { entryRoute, mainNavigationItems } from '.'

const _RoutesOutlet: React.SFC = () => (
  <Switch>
    {mainNavigationItems.map(({ route, page }) => (
      <Route key={route} path={route} exact component={page} />
    ))}
    <Redirect to={entryRoute} />
  </Switch>
)

export const RoutesOutlet = memo(_RoutesOutlet)
