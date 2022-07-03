import { createRangeArray } from '@vlight/utils'

import { setChannels } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiState } from '../../hooks/api'

const allChannels = createRangeArray(1, 512)

/**
 * Corner actions for the channels page:
 * - All on
 * - All off
 */
export function ChannelsActions() {
  const channelsState = useApiState('channels')
  const isActive = channelsState.some(value => value !== 0)
  const isFullOn = isActive && channelsState.every(value => value === 255)

  return (
    <>
      <Button
        icon={iconLight}
        onClick={() => setChannels(allChannels, 255)}
        disabled={isFullOn}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={() => setChannels(allChannels, 0)}
        disabled={!isActive}
      >
        OFF
      </Button>
    </>
  )
}
