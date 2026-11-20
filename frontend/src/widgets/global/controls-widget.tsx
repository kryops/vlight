import { setPaused } from '../../api'
import { apiState } from '../../api/api-state'
import { ApiState } from '../../api/worker/processing'
import { useApiState, useApiStateSelector } from '../../hooks/api'
import {
  isAnyChannelOn,
  turnAllChannelsOff,
} from '../../pages/channels/channels-actions'
import {
  isAnyChaseOn,
  isAnyChaseRunning,
  stopAllChases,
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
  isAnyMemoryRunning,
  stopAllMemories,
  turnAllMemoriesOff,
} from '../../pages/memories/memories-actions'
import { Button } from '../../ui/buttons/button'
import { Widget, WidgetPassthrough } from '../../ui/containers/widget'
import { iconControl } from '../../ui/icons'

export type ControlsWidgetProps = WidgetPassthrough

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

const stopAll = () => {
  stopAllChases()
  stopAllMemories()
}

const togglePaused = () => setPaused(!apiState.paused)

export const ControlsWidget = ({ ...passThrough }: ControlsWidgetProps) => {
  const [isAnyOn, isAnyRunning] = useApiStateSelector(apiState => [
    allOffMapping.some(([check]) => check(apiState)),
    isAnyChaseRunning(apiState) || isAnyMemoryRunning(apiState),
  ])
  const paused = useApiState('paused')

  return (
    <Widget title="Controls" icon={iconControl} {...passThrough}>
      <div>
        <Button
          block
          onDown={turnAllOff}
          title="Turn all controls off"
          hotkey="m"
          disabled={!isAnyOn}
        >
          ALL OFF
        </Button>
        <Button
          block
          onDown={stopAll}
          title="Stop all chases"
          hotkey="n"
          disabled={!isAnyRunning}
        >
          STOP ALL
        </Button>
        <Button
          block
          onDown={togglePaused}
          title={
            paused
              ? 'Resume all live chases, memories and movements'
              : 'Pause all live chases, memories and movements'
          }
          hotkey="b"
          active={paused}
        >
          PAUSE
        </Button>
      </div>
    </Widget>
  )
}
