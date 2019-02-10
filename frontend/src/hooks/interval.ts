import { useEffect, useRef } from 'react'

export function useInterval(
  fn: () => void,
  ms: number,
  shouldUpdate: any[] = []
) {
  const instance = useRef<number | undefined>(undefined)

  useEffect(() => {
    instance.current = window.setInterval(fn, ms)

    return () => {
      window.clearInterval(instance.current)
    }
  }, shouldUpdate)
}
