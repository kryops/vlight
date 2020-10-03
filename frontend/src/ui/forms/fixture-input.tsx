import React, { useState, useEffect } from 'react'
import { EntityName } from '@vlight/types'
import { css } from 'linaria'
import { FixtureMappingPrefix } from '@vlight/controls'

import { cx } from '../../util/styles'

import { Select, SelectEntry } from './select'
import { EntityReferenceSelect } from './entity-reference-select'

export interface FixtureInputProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  className?: string
  hideGroupMode?: boolean
}

const fixtureInput = css`
  display: flex;
  flex: 1 1 auto;
`

const prefixSelect = css`
  flex: 0 0 auto;
`

const valueSelect = css`
  flex: 1 1 auto;
  max-width: 50vw;
`

const allPrefixes = Object.values(FixtureMappingPrefix)

const entityByPrefix: { [key: string]: EntityName } = {
  [FixtureMappingPrefix.type]: 'fixtureTypes',
  [FixtureMappingPrefix.all]: 'fixtures',
  [FixtureMappingPrefix.group]: 'fixtureGroups',
  '': 'fixtures',
}

function prefixFromValue(value: string | undefined) {
  if (!value) return ''
  return allPrefixes.find(prefix => value.startsWith(prefix)) ?? ''
}

export function FixtureInput({
  value,
  onChange,
  className,
  hideGroupMode,
}: FixtureInputProps) {
  const [prefixToUse, setPrefixToUse] = useState(prefixFromValue(value))

  useEffect(() => {
    if (value !== undefined) setPrefixToUse(prefixFromValue(value))
  }, [value])

  const valueWithoutPrefix = value?.slice(prefixToUse.length)

  const prefixEntries: SelectEntry<string>[] = [
    { value: '', label: 'Fixture' },
    { value: FixtureMappingPrefix.all, label: 'All Fixtures' },
    { value: FixtureMappingPrefix.type, label: 'All of Type' },
  ]

  if (!hideGroupMode) {
    prefixEntries.push({
      value: FixtureMappingPrefix.group,
      label: 'Group',
    })
  }

  return (
    <div className={cx(fixtureInput, className)}>
      <Select
        entries={prefixEntries}
        value={prefixToUse}
        onChange={newPrefix => {
          setPrefixToUse(newPrefix)
          onChange(undefined)
        }}
        className={prefixSelect}
      />
      <EntityReferenceSelect
        entity={entityByPrefix[prefixToUse]!}
        value={valueWithoutPrefix}
        onChange={newValue => {
          if (newValue === undefined) onChange(undefined)
          else onChange(`${prefixToUse}${newValue}`)
        }}
        useOriginalId={prefixToUse === FixtureMappingPrefix.all}
        addUndefinedOption
        className={valueSelect}
      />
    </div>
  )
}

export function FixtureInputWithoutGroups(
  props: Omit<FixtureInputProps, 'hideGroupMode'>
) {
  return <FixtureInput {...props} hideGroupMode />
}
