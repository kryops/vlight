import { memo } from 'react'

export function memoInProduction<T>(component: React.ComponentType<T>) {
  // This was necessary because react-hot-loader did not support updating memo-components.
  // We leave it in place in case this happens again
  return memo(component)
  // return process.env.NODE_ENV === 'production' ? memo(component) : component
}
