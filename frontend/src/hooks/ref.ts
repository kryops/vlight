import { useRef } from 'react'

export const useCurrentRef = <T>(state: T) => {
  const ref = useRef<T>(state)
  ref.current = state
  return ref
}
