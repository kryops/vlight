import React from 'react'
import { createRangeArray } from '@vlight/utils'

import { setChannels } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiState } from '../../hooks/api'

const allChannels = createRangeArray(1, 512)

export function ChannelsActions() {
  const channelsState = useApiState('channels')
  const isActive = channelsState.some(value => value !== 0)
  const isFullOn = isActive && channelsState.every(value => value === 255)

  return (
    <>
      <Button
        icon={iconLight}
        onDown={() => setChannels(allChannels, 255)}
        disabled={isFullOn}
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onDown={() => setChannels(allChannels, 0)}
        disabled={!isActive}
      >
        OFF
      </Button>
    </>
  )
}
