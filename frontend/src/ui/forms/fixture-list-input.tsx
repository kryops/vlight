import { FixtureMappingPrefix } from '@vlight/controls'
import { EntityName, Fixture, FixtureGroup, FixtureType } from '@vlight/types'
import { sortByKey } from '@vlight/utils'
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

type ListEntityType = Fixture | FixtureType | FixtureGroup

const fixtureCategory: FixtureListCategory = {
  label: 'Fixture',
  entity: 'fixtures',
  prefix: '',
}

const allFixturesCategory: FixtureListCategory = {
  label: 'By Definition',
  entity: 'fixtures',
  prefix: FixtureMappingPrefix.all,
  useRawMasterData: true,
}

const fixtureTypeCategory: FixtureListCategory = {
  label: 'Type',
  entity: 'fixtureTypes',
  prefix: FixtureMappingPrefix.type,
}

const groupCategory: FixtureListCategory = {
  label: 'Group',
  entity: 'fixtureGroups',
  prefix: FixtureMappingPrefix.group,
}

const categories: FixtureListCategory[] = [
  fixtureCategory,
  allFixturesCategory,
  fixtureTypeCategory,
  groupCategory,
]

function getCountByCategory(value: string[]): Map<FixtureListCategory, number> {
  return new Map([
    ...categories
      .map(category => {
        if (category.prefix === '') {
          return value.filter(entry =>
            Object.values(FixtureMappingPrefix).every(
              prefix => !entry.startsWith(prefix)
            )
          ).length
        }
        return value.filter(entry => entry.startsWith(category.prefix)).length
      })
      .map<[FixtureListCategory, number]>((count, index) => [
        categories[index],
        count,
      ]),
  ])
}

export interface FixtureListInputProps {
  value: string[] | undefined
  onChange: (value: string[]) => void
  hideGroupMode?: boolean
}

// TODO change order
export function FixtureListInput({
  value,
  onChange,
  hideGroupMode,
}: FixtureListInputProps) {
  const rawMasterData = useRawMasterData()
  const masterData = useMasterData()
  const [activeCategory, setActiveCategory] = useState(categories[0])

  const base = activeCategory.useRawMasterData ? rawMasterData : masterData

  const allEntities = base[activeCategory.entity] as Array<
    FixtureType | Fixture | FixtureGroup
  >

  const fixtureCountByEntity = new Map<ListEntityType, number>([
    ...allEntities
      .map<number>(entity => {
        if (activeCategory === allFixturesCategory)
          return (entity as Fixture).count ?? 1
        if (activeCategory === fixtureTypeCategory)
          return masterData.fixtures.filter(it => it.type === entity.id).length
        if (activeCategory === groupCategory)
          return (entity as FixtureGroup).fixtures.length

        return 1
      })
      .map<[ListEntityType, number]>((count, index) => [
        allEntities[index],
        count,
      ]),
  ])

  const countByCategory = getCountByCategory(value ?? [])

  const entities = sortByKey(
    allEntities.filter(entity => {
      const fixtureCount = fixtureCountByEntity.get(entity) ?? 0
      return fixtureCount >= 1
    }),
    'name'
  )

  const availableCategories = hideGroupMode
    ? categories.filter(it => it !== groupCategory)
    : categories

  return (
    <div className={container}>
      <div className={categoryContainer}>
        {availableCategories.map((category, index) => {
          const count = countByCategory.get(category) ?? 0

          return (
            <Button
              key={index}
              className={categoryEntry}
              active={category === activeCategory}
              onDown={() => setActiveCategory(category)}
            >
              {category.label}
              {count > 0 && ` [${count}]`}
            </Button>
          )
        })}
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
              {activeCategory !== fixtureCategory &&
                ` [${fixtureCountByEntity.get(entity)}]`}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
