import React, { useEffect, useState } from 'react'
import { css } from 'linaria'
import {
  MemorySceneState,
  MemoryScene,
  FixtureStateGradient,
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
import { useClassName } from '../../../../hooks/ui'
import { getMemorySceneStatePreviewBackground } from '../../../../util/memories'
import { getFixtureStateColor } from '../../../../util/fixtures'
import { cx } from '../../../../util/styles'

const widget = css`
  border: none;
`

const select = css`
  width: 100%;
`

const gradientPreview = css`
  height: ${baseline(8)};
  margin: ${baseline(2)} 0;
  border: 1px solid ${iconShade(0)};
`

const gradientPreview_light = css`
  border: 1px solid ${iconShade(0, true)};
`

const stopSelectionContainer = css`
  display: flex;
  align-items: center;
  margin: ${baseline(4)} ${baseline(-0.5)};
`

const stopSelectionEntry = css`
  height: ${baseline(8)};
  flex: 1 1 0;
  margin: 0 ${baseline(0.5)};
  min-width: ${baseline(8)};
`

const stopSelectionEntry_active = css`
  height: ${baseline(12)};
  margin-top: 0;
  margin-bottom: 0;
`

const optionsContainer = css`
  display: flex;
`

const positionContainer = css`
  flex: 1 0 auto;
`

const positionInput = css`
  width: ${baseline(12)};
`

const addLink = css`
  display: block;
  margin-top: ${baseline(4)};
`

export interface MemorySceneStateEditorProps {
  scene: MemoryScene
  state: MemorySceneState
  onChange: (newValue: MemorySceneState) => void
}

enum MemorySceneStateType {
  COLOR = 'Single Color',
  GRADIENT = 'Gradient',
}

enum MemoryScenePositionMode {
  AUTO = 'Automatic',
  MANUAL = 'Manual',
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

export function MemorySceneStateEditor({
  scene,
  state,
  onChange,
}: MemorySceneStateEditorProps) {
  const [localState, setLocalState] = useState(state)
  const [currentStop, setCurrentStop] = useState(0)
  const mapping = useCommonFixtureMapping(scene.members)
  const gradientPreviewClass = useClassName(
    gradientPreview,
    gradientPreview_light
  )

  useEffect(() => {
    if (Array.isArray(localState) && currentStop >= localState.length)
      setCurrentStop(localState.length - 1)
  }, [currentStop, localState])

  const type = Array.isArray(localState)
    ? MemorySceneStateType.GRADIENT
    : MemorySceneStateType.COLOR

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

  const content = Array.isArray(localState) ? (
    <>
      <div
        className={gradientPreviewClass}
        style={{ background: getMemorySceneStatePreviewBackground(localState) }}
      />
      <div className={stopSelectionContainer}>
        {localState.map((stop, index) => {
          const stopColor = getFixtureStateColor({
            on: true,
            channels: stop.channels,
          })
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
            fixtureState={{ on: true, channels: activeGradientStop.channels }}
            mapping={mapping}
            onChange={newState =>
              setGradientEntry(currentStop, { channels: newState.channels })
            }
            disableOn
            className={widget}
          />
          <div className={optionsContainer}>
            <div className={positionContainer}>
              <Select
                entries={Object.values(MemoryScenePositionMode)}
                value={
                  activeGradientStop.position !== undefined
                    ? MemoryScenePositionMode.MANUAL
                    : MemoryScenePositionMode.AUTO
                }
                onChange={value =>
                  setGradientEntry(currentStop, {
                    position:
                      value === MemoryScenePositionMode.AUTO
                        ? undefined
                        : gradientPositions[currentStop],
                  })
                }
              />
              &nbsp; &nbsp;
              {activeGradientStop.position === undefined ? (
                formatNumber(gradientPositions[currentStop])
              ) : (
                <NumberInput
                  className={positionInput}
                  value={activeGradientStop.position}
                  onChange={value => {
                    if (value === undefined) return
                    const position = ensureBetween(value, 0, 100)
                    setGradientEntry(currentStop, { position })
                  }}
                  min={0}
                  max={100}
                />
              )}{' '}
              %
            </div>
            {localState.length > 2 && (
              <a
                onClick={() => {
                  const newState = localState.filter(
                    (_, i) => i !== currentStop
                  )
                  setLocalState(newState)
                  onChange(newState)
                }}
              >
                <Icon icon={iconDelete} inline /> Remove
              </a>
            )}
          </div>
        </>
      )}
      <a
        className={addLink}
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
  ) : (
    <FixtureStateWidget
      fixtureState={localState}
      mapping={mapping}
      onChange={partialState => {
        const newState = mergeFixtureStates(localState, partialState)
        setLocalState(newState)
        onChange(newState)
      }}
      disableOn
      className={widget}
    />
  )

  return (
    <>
      <h2>Edit Memory Scene State</h2>
      <Select
        className={select}
        entries={Object.values(MemorySceneStateType)}
        value={type}
        onChange={value => {
          let newState = localState
          if (
            value === MemorySceneStateType.GRADIENT &&
            !Array.isArray(localState)
          ) {
            newState = [
              { channels: localState.channels },
              { channels: localState.channels },
            ]
          } else if (
            value === MemorySceneStateType.COLOR &&
            Array.isArray(localState)
          ) {
            newState = { on: true, channels: localState[0].channels }
          }

          setLocalState(newState)
          onChange(newState)
        }}
      />
      {content}
    </>
  )
}
