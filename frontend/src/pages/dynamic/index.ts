import { lazy } from 'react'

export const dynamicPageRoute = (id = ':id') => `/dynamic/${id}`

export const DynamicPage = lazy(() =>
  import(/* webpackChunkName: "dynamic" */ './dynamic-page')
)
