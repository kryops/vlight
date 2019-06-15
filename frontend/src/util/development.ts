import { memo } from 'react'

export function memoInProduction<T>(component: React.ComponentType<T>) {
  return process.env.NODE_ENV === 'production' ? memo(component) : component
}
