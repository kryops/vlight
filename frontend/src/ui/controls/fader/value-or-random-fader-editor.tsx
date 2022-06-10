import { css } from '@linaria/core'
import { ValueOrRandom } from '@vlight/types'
import { highestRandomValue, isValueRange } from '@vlight/utils'
import { useState } from 'react'

import { centeredText } from '../../css/basic-styles'
import { editorTitle } from '../../css/editor-styles'
import { faderContainer } from '../../css/fader-container'
import { Select, SelectEntry } from '../../forms/select'
import { iconAdd, iconDelete } from '../../icons'
import { Icon } from '../../icons/icon'

import { Fader } from './fader'
import { RangeFader } from './range-fader'

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export enum ValueOrRandomType {
  Value,
  Values,
  Range,
}

function getValueOrRandomType(valueOrRandom: ValueOrRandom<any>) {
  if (isValueRange(valueOrRandom)) return ValueOrRandomType.Range
  if (Array.isArray(valueOrRandom)) return ValueOrRandomType.Values
  return ValueOrRandomType.Value
}

export function convertValueOrRandom(
  value: ValueOrRandom<number>,
  type: ValueOrRandomType,
  min?: number
): ValueOrRandom<number> {
  const valueType = getValueOrRandomType(value)
  if (type === valueType) return value

  switch (type) {
    case ValueOrRandomType.Value:
      return highestRandomValue(value) as number
    case ValueOrRandomType.Values:
      if (isValueRange(value)) return [value.from, value.to]
      return [min ?? (value as number), value as number]
    case ValueOrRandomType.Range:
      return {
        from: Array.isArray(value) ? value[0] : min ?? (value as number),
        to: Array.isArray(value) ? value[1] ?? value[0] : (value as number),
      }
  }
}

const selectEntries: SelectEntry<ValueOrRandomType>[] = [
  { value: ValueOrRandomType.Value, label: 'Single value' },
  { value: ValueOrRandomType.Values, label: 'Multiple values' },
  { value: ValueOrRandomType.Range, label: 'Value range' },
]

export interface ValueOrRandomFaderEditorProps {
  title?: string
  value?: ValueOrRandom<number>
  onChange: (value: ValueOrRandom<number>) => void
  min?: number
  max?: number
  step?: number
}

export function ValueOrRandomFaderEditor({
  value,
  onChange,
  title,
  ...faderProps
}: ValueOrRandomFaderEditorProps) {
  const [localState, setLocalState] = useState(value ?? faderProps.min ?? 0)
  const type = getValueOrRandomType(localState)

  const onChangeWrapper = (newValue: ValueOrRandom<number>) => {
    setLocalState(newValue)
    onChange(newValue)
  }

  let content: JSX.Element

  if (isValueRange(localState)) {
    content = (
      <RangeFader
        {...faderProps}
        value={localState}
        onChange={onChangeWrapper}
      />
    )
  } else if (Array.isArray(localState)) {
    content = (
      <>
        <div className={faderContainer}>
          {localState.map((val, index) => (
            <div className={centeredText} key={index}>
              <Fader
                value={val}
                onChange={newIndexValue => {
                  const newValue = [...localState]
                  newValue[index] = newIndexValue
                  onChangeWrapper(newValue)
                }}
                {...faderProps}
              />
              <Icon
                icon={iconDelete}
                shade={1}
                hoverable
                inline
                padding
                onClick={() => {
                  const newValue = [...localState]
                  newValue.splice(index, 1)
                  onChangeWrapper(newValue)
                }}
              />
            </div>
          ))}
        </div>
        <Icon
          icon={iconAdd}
          shade={1}
          hoverable
          size={8}
          onClick={() =>
            onChangeWrapper([
              ...localState,
              localState.length
                ? localState[localState.length - 1]
                : faderProps.min ?? 0,
            ])
          }
        />
      </>
    )
  } else {
    content = (
      <Fader {...faderProps} value={localState} onChange={onChangeWrapper} />
    )
  }

  return (
    <div className={container}>
      {title && <h3 className={editorTitle}>{title}</h3>}
      <Select
        entries={selectEntries}
        value={type}
        onChange={newType =>
          onChangeWrapper(
            convertValueOrRandom(localState, newType, faderProps.min)
          )
        }
      />
      {content}
    </div>
  )
}
