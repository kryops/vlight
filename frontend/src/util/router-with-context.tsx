import React from 'react'
import { RouteChildrenProps } from 'react-router'
import { BrowserRouter, Route } from 'react-router-dom'

export const RouterContext = React.createContext<RouteChildrenProps>(
  undefined as any
)

export const RouterLocationPathContext = React.createContext<string>('')

export const RouterWithContext: React.SFC = ({ children }) => (
  <BrowserRouter>
    <Route>
      {routeProps => (
        <RouterContext.Provider value={routeProps}>
          {children}
        </RouterContext.Provider>
      )}
    </Route>
  </BrowserRouter>
)
