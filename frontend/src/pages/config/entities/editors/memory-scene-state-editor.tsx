import { useEffect, useState } from 'react'
import { css } from '@linaria/core'
import {
  MemorySceneState,
  MemoryScene,
  FixtureStateGradient,
  FixtureState,
} from '@vlight/types'
import { ensureBetween } from '@vlight/utils'
import {
  interpolateGradientPositions,
  mergeFixtureStates,
} from '@vlight/controls'

import { useCommonFixtureMapping } from '../../../../hooks/fixtures'
import { FixtureStateWidget } from '../../../../widgets/fixture/fixture-state-widget'
import { Select } from '../../../../ui/forms/select'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd, iconDelete } from '../../../../ui/icons'
import { baseline, iconShade } from '../../../../ui/styles'
import { NumberInput } from '../../../../ui/forms/typed-input'
import { formatNumber } from '../../../../util/format'
import { getMemorySceneStatePreviewBackground } from '../../../../util/memories'
import { getFixtureStateColor } from '../../../../util/fixtures'
import { cx } from '../../../../util/styles'
import { editorTitle } from '../../../../ui/css/editor-styles'
import { flexContainer } from '../../../../ui/css/flex'
import { useDeepEqualMemo, useEvent } from '../../../../hooks/performance'
import { Button } from '../../../../ui/buttons/button'
import { Checkbox } from '../../../../ui/forms/checkbox'

const widget = css`
  border: none;
`

const gradientPreview = css`
  height: ${baseline(6)};
  margin-top: ${baseline(2)};
  margin-bottom: ${baseline()};
  border: 1px solid ${iconShade(0)};
`

const stopSelectionContainer = css`
  display: flex;
  align-items: center;
  margin: 0 ${baseline(-0.5)};
`

const stopSelectionEntry = css`
  box-sizing: border-box;
  height: ${baseline(8)};
  flex: 1 1 0;
  margin: 0 ${baseline(0.5)};
  min-width: ${baseline(8)};
  border: 1px solid ${iconShade(0)};
`

const stopSelectionEntry_active = css`
  height: ${baseline(10)};
  margin-top: 0;
  margin-bottom: 0;
  border-width: 2px;
`

const optionsContainer = flexContainer

const positionContainer = css`
  flex: 1 0 auto;
`

const positionInput = css`
  width: ${baseline(12)};
`

const linkContainer = css`
  justify-content: space-between;
`

export interface MemorySceneStateEditorProps {
  scene: MemoryScene
  state: MemorySceneState
  onChange: (newValue: MemorySceneState) => void
}

enum MemoryScenePositionMode {
  Auto = 'Automatic',
  Manual = 'Manual',
}

function computeStopWidths(gradientPositions: number[]): number[] {
  return gradientPositions.map((position, index) => {
    const before = gradientPositions[index - 1] ?? 0
    const after = gradientPositions[index + 1] ?? 100

    if (index === 0) {
      return (after + position) / 2
    }

    if (index === gradientPositions.length - 1) {
      return 100 - (position + before) / 2
    }

    return (after + position) / 2 - (position + before) / 2
  })
}

const positionModes = Object.values(MemoryScenePositionMode)

/**
 * Dialog content for editing a memory scene state.
 *
 * Displays a fixture state input, and optionally a gradient editor.
 */
export function MemorySceneStateEditor({
  scene,
  state: initialState,
  onChange,
}: MemorySceneStateEditorProps) {
  const [localState, setLocalState] = useState(initialState)
  const [currentStop, setCurrentStop] = useState(0)
  const mapping = useCommonFixtureMapping(scene.members)

  useEffect(() => {
    if (Array.isArray(localState) && currentStop >= localState.length)
      setCurrentStop(localState.length - 1)
  }, [currentStop, localState])

  const isGradient = Array.isArray(localState)

  const gradientPositions = Array.isArray(localState)
    ? interpolateGradientPositions(localState.map(entry => entry.position))
    : []

  const stopWidths = computeStopWidths(gradientPositions)

  const setGradientEntry = (
    index: number,
    entry: Partial<FixtureStateGradient>
  ) => {
    if (!Array.isArray(localState)) return

    const newState = [...localState]
    newState[index] = {
      ...newState[index],
      ...entry,
      channels: {
        ...newState[index].channels,
        ...entry.channels,
      },
    }
    setLocalState(newState)
    onChange(newState)
  }

  const activeGradientStop =
    Array.isArray(localState) && localState[currentStop]

  const fixtureState = useDeepEqualMemo<FixtureState>({
    on: true,
    channels: activeGradientStop ? activeGradientStop.channels : {},
  })

  const changeGradientStop = useEvent((newState: Partial<FixtureState>) =>
    setGradientEntry(currentStop, { channels: newState.channels })
  )

  const changeFixtureState = useEvent((partialState: Partial<FixtureState>) => {
    if (Array.isArray(localState)) return
    const newState = mergeFixtureStates(localState, partialState)
    setLocalState(newState)
    onChange(newState)
  })

  const changePositionMode = useEvent((value: MemoryScenePositionMode): void =>
    setGradientEntry(currentStop, {
      position:
        value === MemoryScenePositionMode.Auto
          ? undefined
          : gradientPositions[currentStop],
    })
  )

  const changePosition = useEvent((value: number | undefined): void => {
    if (value === undefined) return
    const position = ensureBetween(value, 0, 100)
    setGradientEntry(currentStop, { position })
  })

  const removeCurrentStop = useEvent(() => {
    if (!Array.isArray(localState)) return
    const newState = localState.filter((_, i) => i !== currentStop)
    setLocalState(newState)
    onChange(newState)
  })

  const toggleMirrored = useEvent(() => {
    if (!Array.isArray(localState)) return
    const mirrored = localState.some(it => it.mirrored)
    const newState = localState.map(it => ({ ...it, mirrored: !mirrored }))
    setLocalState(newState)
    onChange(newState)
  })

  const content = Array.isArray(localState) ? (
    <>
      <div
        className={gradientPreview}
        style={{ background: getMemorySceneStatePreviewBackground(localState) }}
      />
      <div className={stopSelectionContainer}>
        {localState.map((stop, index) => {
          const stopColor =
            getFixtureStateColor({
              on: true,
              channels: stop.channels,
            }) ?? 'black'
          return (
            <div
              key={index}
              className={cx(
                stopSelectionEntry,
                index === currentStop && stopSelectionEntry_active
              )}
              style={{
                background: stopColor,
                flexBasis: `${stopWidths[index]}%`,
              }}
              onClick={() => setCurrentStop(index)}
            />
          )
        })}
      </div>
      {activeGradientStop && (
        <>
          <FixtureStateWidget
            fixtureState={fixtureState}
            mapping={mapping}
            onChange={changeGradientStop}
            disableOn
            className={widget}
          />
          <div className={optionsContainer}>
            <div className={positionContainer}>
              <Select
                entries={positionModes}
                value={
                  activeGradientStop.position !== undefined
                    ? MemoryScenePositionMode.Manual
                    : MemoryScenePositionMode.Auto
                }
                onChange={changePositionMode}
              />
              &nbsp; &nbsp;
              {activeGradientStop.position === undefined ? (
                formatNumber(gradientPositions[currentStop])
              ) : (
                <NumberInput
                  className={positionInput}
                  value={activeGradientStop.position}
                  onChange={changePosition}
                  min={0}
                  max={100}
                />
              )}{' '}
              %
            </div>
            {localState.length > 2 && (
              <Button onClick={removeCurrentStop} icon={iconDelete} transparent>
                Remove
              </Button>
            )}
          </div>
        </>
      )}
    </>
  ) : (
    <FixtureStateWidget
      fixtureState={localState}
      mapping={mapping}
      onChange={changeFixtureState}
      disableOn
      className={widget}
    />
  )

  const changeType = useEvent((toGradient: boolean): void => {
    let newState = localState
    if (toGradient && !Array.isArray(localState)) {
      newState = [
        { channels: localState.channels },
        { channels: localState.channels },
      ]
      setCurrentStop(1)
    } else if (!toGradient && Array.isArray(localState)) {
      newState = { on: true, channels: localState[0].channels }
    }

    setLocalState(newState)
    onChange(newState)
  })

  const toggleGradient = useEvent(() => changeType(!isGradient))

  return (
    <>
      <h2 className={editorTitle}>Edit Memory Scene State</h2>
      <div className={cx(flexContainer, linkContainer)}>
        <a onClick={toggleGradient}>
          <Checkbox value={isGradient} onChange={changeType} inline /> Gradient
        </a>
        {Array.isArray(localState) && (
          <>
            <a onClick={toggleMirrored}>
              <Checkbox
                value={localState.some(it => it.mirrored)}
                onChange={toggleMirrored}
                inline
              />{' '}
              Mirrored
            </a>
            <a
              onClick={() => {
                const newState = [
                  ...localState,
                  {
                    channels: {
                      m: 255,
                      r: 255,
                      g: 255,
                      b: 255,
                    },
                  },
                ]
                setLocalState(newState)
                onChange(newState)
                setCurrentStop(newState.length - 1)
              }}
            >
              <Icon icon={iconAdd} inline /> Add stop
            </a>
          </>
        )}
      </div>
      {content}
    </>
  )
}
