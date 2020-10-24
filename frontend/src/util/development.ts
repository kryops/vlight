import { FC, memo } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function memoInProduction<T>(component: FC<T>) {
  // This is necessary because react-hot-loader does not support updating memo-components again.
  // return memo(component)
  return process.env.NODE_ENV === 'production' ? memo(component) : component
}
