export { default as DynamicPage } from './dynamic-page'

export const dynamicPageRoute = (id = ':id'): string => `/dynamic/${id}`
