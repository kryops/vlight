import React, { useState } from 'react'
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

const widget = css`
  border: none;
`

const select = css`
  width: 100%;
`

const gradientPreview = css`
  height: ${baseline(8)};
  margin-top: ${baseline(2)};
  border: 1px solid ${iconShade(0)};
`

const gradientPreview_light = css`
  border: 1px solid ${iconShade(0, true)};
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

export function MemorySceneStateEditor({
  scene,
  state,
  onChange,
}: MemorySceneStateEditorProps) {
  const [localState, setLocalState] = useState(state)
  const mapping = useCommonFixtureMapping(scene.members)
  const gradientPreviewClass = useClassName(
    gradientPreview,
    gradientPreview_light
  )

  const type = Array.isArray(localState)
    ? MemorySceneStateType.GRADIENT
    : MemorySceneStateType.COLOR

  const gradientPositions = Array.isArray(localState)
    ? interpolateGradientPositions(localState.map(entry => entry.position))
    : []

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

  const content = Array.isArray(localState) ? (
    <>
      <div
        className={gradientPreviewClass}
        style={{ background: getMemorySceneStatePreviewBackground(localState) }}
      />
      {localState.map((entry, index) => (
        <>
          <FixtureStateWidget
            key={index}
            fixtureState={{ on: true, channels: entry.channels }}
            mapping={mapping}
            onChange={newState =>
              setGradientEntry(index, { channels: newState.channels })
            }
            disableOn
            className={widget}
          />
          <div className={optionsContainer}>
            <div className={positionContainer}>
              <Select
                entries={Object.values(MemoryScenePositionMode)}
                value={
                  entry.position !== undefined
                    ? MemoryScenePositionMode.MANUAL
                    : MemoryScenePositionMode.AUTO
                }
                onChange={value =>
                  setGradientEntry(index, {
                    position:
                      value === MemoryScenePositionMode.AUTO
                        ? undefined
                        : gradientPositions[index],
                  })
                }
              />
              &nbsp; &nbsp;
              {entry.position === undefined ? (
                formatNumber(gradientPositions[index])
              ) : (
                <NumberInput
                  className={positionInput}
                  value={entry.position}
                  onChange={value => {
                    if (value === undefined) return
                    const position = ensureBetween(value, 0, 100)
                    setGradientEntry(index, { position })
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
                  const newState = localState.filter((_, i) => i !== index)
                  setLocalState(newState)
                  onChange(newState)
                }}
              >
                <Icon icon={iconDelete} inline /> Remove
              </a>
            )}
          </div>
        </>
      ))}
      <a
        className={addLink}
        onClick={() => {
          const newState = [
            ...localState,
            {
              channels: {
                m: 255,
                r: 255,
              },
            },
          ]
          setLocalState(newState)
          onChange(newState)
        }}
      >
        <Icon icon={iconAdd} inline /> Add entry
      </a>
      <div
        className={gradientPreviewClass}
        style={{ background: getMemorySceneStatePreviewBackground(localState) }}
      />
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
