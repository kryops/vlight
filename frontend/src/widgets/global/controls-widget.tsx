import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { useApiStateSelector } from '../../hooks/api'
import {
  isAnyChannelOn,
  turnAllChannelsOff,
} from '../../pages/channels/channels-actions'
import {
  isAnyChaseOn,
  turnAllChasesOff,
} from '../../pages/chases/chases-actions'
import {
  isAnyFixtureGroupOn,
  turnAllFixtureGroupsOff,
} from '../../pages/fixture-groups/fixture-group-actions'
import {
  isAnyFixtureOn,
  turnAllFixturesOff,
} from '../../pages/fixtures/fixtures-actions'
import {
  isAnyMemoryOn,
  turnAllMemoriesOff,
} from '../../pages/memories/memories-actions'
import { Button } from '../../ui/buttons/button'
import { Widget } from '../../ui/containers/widget'
import { iconControl } from '../../ui/icons'
import { memoInProduction } from '../../util/development'

export interface ControlsWidgetProps {
  hotkeysActive?: boolean
}

const allOffMapping: Array<[(apiState: ApiState) => boolean, () => void]> = [
  [isAnyChannelOn, turnAllChannelsOff],
  [isAnyFixtureOn, turnAllFixturesOff],
  [isAnyFixtureGroupOn, turnAllFixtureGroupsOff],
  [isAnyMemoryOn, turnAllMemoriesOff], // covers live memories
  [isAnyChaseOn, turnAllChasesOff],
]

const turnAllOff = () => {
  for (const [check, fn] of allOffMapping) {
    if (check(apiState)) fn()
  }
}

export const ControlsWidget = memoInProduction(
  ({ hotkeysActive }: ControlsWidgetProps) => {
    const isAnyOn = useApiStateSelector(apiState =>
      allOffMapping.some(([check]) => check(apiState))
    )

    return (
      <Widget title="Controls" icon={iconControl} hotkeysActive={hotkeysActive}>
        <Button
          block
          onDown={turnAllOff}
          title="Turn all controls off"
          hotkey="m"
          disabled={!isAnyOn}
        >
          ALL OFF
        </Button>
      </Widget>
    )
  }
)
