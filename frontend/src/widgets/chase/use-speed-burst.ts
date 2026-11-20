import { IdType, LiveChase } from '@vlight/types'
import { useRef } from 'react'

import { setLiveChaseState, setLiveChaseStep } from '../../api'
import { apiState } from '../../api/api-state'

import { liveChaseMaxSpeed } from './constants'

/**
 * Returns handlers to start and stop a speed burst for a live chase.
 */
export function useSpeedBurst(id: IdType, state: LiveChase) {
  const update = (newState: Partial<LiveChase>) =>
    setLiveChaseState(id, newState, true)

  const speedBurstBackup = useRef<
    Partial<LiveChase> & { otherChases?: string[] }
  >({})

  const startSpeedBurst = () => {
    // likely hit the button multiple times
    if (!state.burst) {
      // disable other chases temporarily in single mode
      const otherChases =
        state.single && !state.on
          ? Object.keys(apiState.liveChases).filter(
              chase => chase !== id && apiState.liveChases[chase].on
            )
          : []
      otherChases.forEach(chase =>
        setLiveChaseState(chase, { on: false }, true)
      )

      speedBurstBackup.current = {
        speed: state.speed,
        fade: state.fade,
        stopped: state.stopped,
        on: state.on,
        burst: false,
        otherChases,
      }
    }
    update({
      speed: liveChaseMaxSpeed,
      fade: 0,
      stopped: false,
      on: true,
      burst: true,
    })
  }

  const stopSpeedBurst = () => {
    const { otherChases, ...chaseState } = speedBurstBackup.current
    update({ ...chaseState, burst: false })
    // If the chase was fading before, this will trigger an additional step to start fading again immediately
    setLiveChaseStep(id)
    otherChases?.forEach(chase => setLiveChaseState(chase, { on: true }, true))
  }

  return { startSpeedBurst, stopSpeedBurst }
}
