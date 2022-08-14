import { useEffect, useState } from 'react'

function isLarger(breakpoint: number): boolean {
  return window.innerWidth >= breakpoint
}

/**
 * React Hook that returns whether the viewport is wider than the given breakpoint.
 */
export function useBreakpoint(breakpoint: number): boolean {
  const [match, setMatch] = useState(isLarger(breakpoint))

  useEffect(() => {
    let oldMatch = isLarger(breakpoint)
    const listener = () => {
      const newMatch = isLarger(breakpoint)
      if (newMatch !== oldMatch) {
        oldMatch = newMatch
        setMatch(newMatch)
      }
    }

    window.addEventListener('resize', listener, false)
    window.addEventListener('orientationchange', listener, false)

    return () => {
      window.removeEventListener('resize', listener, false)
      window.removeEventListener('orientationchange', listener, false)
    }
  }, [breakpoint])

  return match
}
