import { useRef } from 'react'

export function useCurrentRef<T>(arg: T): React.MutableRefObject<T> {
  const ref = useRef(arg)
  ref.current = arg
  return ref
}
