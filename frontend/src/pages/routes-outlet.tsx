import React, { memo } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { mainNavigationItems } from '.'
import { channelsPageRoute } from './channels'

const _RoutesOutlet: React.SFC = () => (
  <Switch>
    {mainNavigationItems.map(({ route, page }) => (
      <Route key={route} path={route} exact component={page} />
    ))}
    <Redirect to={channelsPageRoute} />
  </Switch>
)

export const RoutesOutlet = memo(_RoutesOutlet)
