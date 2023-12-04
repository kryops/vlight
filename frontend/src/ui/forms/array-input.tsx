import { useMemo } from 'react'
import { css } from '@linaria/core'
import { toArray } from '@vlight/utils'

import { iconDelete } from '../icons'
import { cx } from '../../util/styles'
import { baseline } from '../styles'
import { flexAuto } from '../css/flex'
import { Button } from '../buttons/button'
import { memoInProduction } from '../../util/development'
import { SortableList } from '../containers/sortable-list'

import { TypedInputProps } from './typed-input'

export interface ArrayInputProps<T> {
  value: T | undefined | Array<T | undefined>
  onChange: (value: Array<T>) => void

  /** Renders the input component for a single item. */
  renderInput: (
    props: TypedInputProps<T> & { excludeValues?: T[] }
  ) => JSX.Element

  /**
   * Controls whether to allow removing array entries.
   *
   * Defaults to `false`.
   */
  displayRemoveButtons?: boolean

  /**
   * Controls whether the items can be sorted via drag & drop.
   *
   * Defaults to `false`.
   */
  sortable?: boolean

  className?: string

  /** CSS class name to apply to the container for each entry. */
  entryClassName?: string
}

const entry = css`
  display: flex;
  padding: ${baseline(2)} 0;
  align-items: center;
`

function removeUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(it => it !== undefined) as T[]
}

/**
 * Input wrapper component to edit arrays.
 *
 * Always renders an empty/undefined input element at the end
 * to add new values to the array.
 */
export const ArrayInput = memoInProduction(
  <T extends any>({
    value,
    onChange,
    renderInput,
    displayRemoveButtons = false,
    sortable = false,
    className,
    entryClassName,
  }: ArrayInputProps<T>) => {
    const sanitizedValue = useMemo(
      () => (value === undefined ? [] : toArray(value)),
      [value]
    )

    function onChangeInternal(value: (T | undefined)[]) {
      const valueToSend = removeUndefined(value)
      onChange(valueToSend)
    }

    const addValueSelect = (
      <div className={cx(entry, entryClassName)}>
        {renderInput({
          value: undefined,
          onChange: value => {
            if (value !== undefined) {
              onChangeInternal([...sanitizedValue, value])
            }
          },
          excludeValues: sanitizedValue as T[],
        })}
      </div>
    )

    if (sortable) {
      return (
        <div className={cx(flexAuto, className)}>
          <SortableList<T | undefined>
            entries={sanitizedValue}
            getKey={it => {
              if (typeof it === 'string') return it
              if (typeof it === 'object' && it && 'id' in it)
                return String(it.id)
              return JSON.stringify(it)
            }}
            onChange={onChangeInternal}
            entryClassName={cx(entry, entryClassName)}
            renderEntryContent={singleValue => {
              const index = sanitizedValue.indexOf(singleValue)
              const changeSingleValue = (newSingleValue: T | undefined) => {
                const newValue = [...sanitizedValue]
                newValue[index] = newSingleValue
                onChangeInternal(newValue)
              }

              return (
                <>
                  {renderInput({
                    value: singleValue,
                    onChange: changeSingleValue,
                    excludeValues: sanitizedValue as T[],
                  })}
                  {displayRemoveButtons && singleValue !== undefined && (
                    <Button
                      icon={iconDelete}
                      onClick={() => changeSingleValue(undefined)}
                      transparent
                    />
                  )}
                </>
              )
            }}
          />
          {addValueSelect}
        </div>
      )
    }

    return (
      <div className={cx(flexAuto, className)}>
        {sanitizedValue.map((singleValue, index) => {
          const changeSingleValue = (newSingleValue: T | undefined) => {
            const newValue = [...sanitizedValue]
            newValue[index] = newSingleValue
            onChangeInternal(newValue)
          }

          return (
            <div key={index} className={cx(entry, entryClassName)}>
              {renderInput({
                value: singleValue,
                onChange: changeSingleValue,
                excludeValues: sanitizedValue as T[],
              })}
              {displayRemoveButtons && singleValue !== undefined && (
                <Button
                  icon={iconDelete}
                  onClick={() => changeSingleValue(undefined)}
                  transparent
                />
              )}
            </div>
          )
        })}
        {addValueSelect}
      </div>
    )
  }
)
