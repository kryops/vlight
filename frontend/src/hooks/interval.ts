import { useEffect } from 'react'

import { useCurrentRef } from './ref'

export function useInterval(fn: () => void, ms: number) {
  const fnRef = useCurrentRef(fn)
  useEffect(() => {
    const interval = window.setInterval(() => fnRef.current(), ms)

    return () => {
      window.clearInterval(interval)
    }
  }, [fnRef, ms])
}
