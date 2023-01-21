import { FC, memo } from 'react'

/**
 * Wraps a component in React.memo.
 *
 * As we sometimes had problems with hot reloading when memoization
 * was active in development, we left it in place although it
 * does not do anything currently.
 */
export function memoInProduction<T extends FC<any>>(component: T): T {
  // This sometimes becomes necessary when hot reloading does not work with memo components.
  // we do not use React's MemoExoticComponent type as it can break generic components
  return memo(component) as unknown as T
  // return process.env.NODE_ENV === 'production' ? memo(component) : component
}
