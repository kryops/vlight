import { createRangeArray } from '@vlight/utils'

import { setChannels } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { HotkeyContext } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'
import { ApiState } from '../../api/worker/processing'

const allChannels = createRangeArray(1, 512)

export function isAnyChannelOn(apiState: ApiState) {
  return apiState.channels?.some(value => value !== 0) ?? false
}

export const turnAllChannelsOn = () => setChannels(allChannels, 255)
export const turnAllChannelsOff = () => setChannels(allChannels, 0)

/**
 * Corner actions for the channels page:
 * - All on
 * - All off
 */
export const ChannelsActions = memoInProduction(() => {
  const { isActive, isFullOn } = useApiStateSelector(
    apiState => {
      const isActive = isAnyChannelOn(apiState)
      return {
        isActive,
        isFullOn: isActive && apiState.channels?.every(value => value === 255),
      }
    },
    { event: 'channels' }
  )

  return (
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconLight}
        onClick={turnAllChannelsOn}
        disabled={isFullOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllChannelsOff}
        disabled={!isActive}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
})
