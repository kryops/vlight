import { createRangeArray } from '@vlight/utils'

import { setChannels } from '../../api'
import { Button } from '../../ui/buttons/button'
import { iconLight, iconLightOff } from '../../ui/icons'
import { useApiStateSelector } from '../../hooks/api'
import { HotkeyContext } from '../../hooks/hotkey'
import { memoInProduction } from '../../util/development'

const allChannels = createRangeArray(1, 512)

const turnAllOn = () => setChannels(allChannels, 255)
const turnAllOff = () => setChannels(allChannels, 0)

/**
 * Corner actions for the channels page:
 * - All on
 * - All off
 */
export const ChannelsActions = memoInProduction(() => {
  const { isActive, isFullOn } = useApiStateSelector(
    ({ channels }) => {
      const isActive = channels?.some(value => value !== 0)
      return {
        isActive,
        isFullOn: isActive && channels?.every(value => value === 255),
      }
    },
    { event: 'channels' }
  )

  return (
    <HotkeyContext.Provider value={true}>
      <Button
        icon={iconLight}
        onClick={turnAllOn}
        disabled={isFullOn}
        title="All on"
        hotkey="o"
      >
        ON
      </Button>
      <Button
        icon={iconLightOff}
        onClick={turnAllOff}
        disabled={!isActive}
        title="All off"
        hotkey="p"
      >
        OFF
      </Button>
    </HotkeyContext.Provider>
  )
})
