import { useRef, useEffect } from 'react'

export const useCurrentRef = <T>(value: T) => {
  const ref = useRef<T>(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
