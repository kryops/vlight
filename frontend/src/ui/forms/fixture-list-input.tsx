import { FixtureMappingPrefix } from '@vlight/controls'
import { EntityName, Fixture, FixtureGroup, FixtureType } from '@vlight/types'
import { css } from 'linaria'
import React, { useState } from 'react'

import { useMasterData, useRawMasterData } from '../../hooks/api'
import { Button } from '../buttons/button'
import { baseline } from '../styles'

const container = css`
  flex: 1 1 auto;
`

const categoryContainer = css`
  display: flex;
`

const categoryEntry = css`
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-child {
    margin-left: 0;
  }
`

const scrollContainer = css`
  height: ${baseline(84)};
  max-height: 80vh;
  overflow-y: auto;
`

const listEntry = css`
  margin-bottom: ${baseline()};
  text-align: left;
  width: auto;
`

interface FixtureListCategory {
  label: string
  entity: EntityName
  useRawMasterData?: boolean
  prefix: FixtureMappingPrefix | ''
}

const categories: FixtureListCategory[] = [
  { label: 'Fixture', entity: 'fixtures', prefix: '' },
  {
    label: 'By Definition',
    entity: 'fixtures',
    prefix: FixtureMappingPrefix.all,
    useRawMasterData: true,
  },
  { label: 'Type', entity: 'fixtureTypes', prefix: FixtureMappingPrefix.type },
  {
    label: 'Group',
    entity: 'fixtureGroups',
    prefix: FixtureMappingPrefix.group,
  },
]

export interface FixtureListInputProps {
  value: string[] | undefined
  onChange: (value: string[]) => void
  hideGroupMode: boolean
}

export function FixtureListInput({
  value,
  onChange,
  hideGroupMode,
}: FixtureListInputProps) {
  const rawMasterData = useRawMasterData()
  const masterData = useMasterData()
  const [activeCategory, setActiveCategory] = useState(categories[0])

  const base = activeCategory.useRawMasterData ? rawMasterData : masterData
  const entities = base[activeCategory.entity] as Array<
    FixtureType | Fixture | FixtureGroup
  >

  const availableCategories = hideGroupMode
    ? categories.filter(it => it.prefix !== FixtureMappingPrefix.group)
    : categories

  return (
    <div className={container}>
      <div className={categoryContainer}>
        {availableCategories.map((category, index) => (
          <Button
            key={index}
            className={categoryEntry}
            active={category === activeCategory}
            onDown={() => setActiveCategory(category)}
          >
            {category.label}
          </Button>
        ))}
      </div>
      <div className={scrollContainer}>
        {entities.map(entity => {
          const entry = activeCategory.prefix + entity.id
          const active = value?.includes(entry)
          return (
            <Button
              key={entity.id}
              className={listEntry}
              active={active}
              block
              onDown={() =>
                onChange(
                  active
                    ? (value ?? []).filter(it => it !== entry)
                    : [...(value ?? []), entry]
                )
              }
            >
              {entity.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
