import { useRef } from 'react'

const resetMsThreshold = 5000
const resetDifferenceThreshold = 2
const useMaxTaps = 3

export function useTapSync(cb: (speed: number) => any): () => void {
  const tapsRef = useRef<number[]>([])

  const registerTap = () => {
    const now = Date.now()

    // reset after threshold has passed
    if (
      tapsRef.current.length &&
      tapsRef.current[tapsRef.current.length - 1] < now - resetMsThreshold
    ) {
      tapsRef.current = []
    }

    if (tapsRef.current.length > 1) {
      const lastValue = tapsRef.current[tapsRef.current.length - 1]
      const lastDiff = lastValue - tapsRef.current[tapsRef.current.length - 2]
      const currentDiff = now - lastValue

      // when going faster => only keep last tap
      if (currentDiff < lastDiff / resetDifferenceThreshold) {
        tapsRef.current = tapsRef.current.slice(-1)
      }
      // when going slower => reset completely
      else if (currentDiff > lastDiff * resetDifferenceThreshold) {
        tapsRef.current = []
      }
    }

    // count 3 taps max
    if (tapsRef.current.length >= useMaxTaps) {
      tapsRef.current = tapsRef.current.slice(-1 * useMaxTaps + 1)
    }

    tapsRef.current.push(now)

    const speed = tapsRef.current.reduce((currentSpeed, value, index, arr) => {
      if (index === 0) return 0
      const prevValue = arr[index - 1]
      const diff = (value - prevValue) / 1000
      return currentSpeed + diff / (arr.length - 1)
    }, 0)
    if (speed !== 0) cb(speed)
  }

  return registerTap
}
