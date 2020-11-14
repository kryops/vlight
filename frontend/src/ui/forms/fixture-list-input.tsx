import { FixtureMappingPrefix, mapFixtureList } from '@vlight/controls'
import { EntityName, Fixture, FixtureGroup, FixtureType } from '@vlight/types'
import { css } from 'linaria'
import { useState } from 'react'

import { useMasterDataAndMaps, useRawMasterData } from '../../hooks/api'
import { cx } from '../../util/styles'
import { Button } from '../buttons/button'
import { flexAuto } from '../css/flex'
import {
  iconList,
  iconFixtureType,
  iconGroup,
  iconLight,
  iconLights,
} from '../icons'
import { Icon } from '../icons/icon'
import { baseline } from '../styles'

import { SortableFixtureMapping } from './sortable-fixture-mapping'

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
  margin-top: ${baseline()};
  height: ${baseline(84)};
  max-height: 80vh;
  overflow-y: auto;
`

const scrollContainer_compact = css`
  height: ${baseline(64)};
`

const listEntry = css`
  margin-top: 0;
  margin-bottom: ${baseline()};
  text-align: left;
  width: auto;
`

interface FixtureListCategory {
  icon: string
  label: string
  entity: EntityName
  useRawMasterData?: boolean
  prefix: FixtureMappingPrefix | ''
}

type ListEntityType = Fixture | FixtureType | FixtureGroup

const fixtureCategory: FixtureListCategory = {
  icon: iconLight,
  label: 'Fixture',
  entity: 'fixtures',
  prefix: '',
}

const allFixturesCategory: FixtureListCategory = {
  icon: iconLights,
  label: 'All by definition',
  entity: 'fixtures',
  prefix: FixtureMappingPrefix.All,
  useRawMasterData: true,
}

const fixtureTypeCategory: FixtureListCategory = {
  icon: iconFixtureType,
  label: 'Type',
  entity: 'fixtureTypes',
  prefix: FixtureMappingPrefix.Type,
}

const groupCategory: FixtureListCategory = {
  icon: iconGroup,
  label: 'Group',
  entity: 'fixtureGroups',
  prefix: FixtureMappingPrefix.Group,
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
  ordering?: boolean
  compact?: boolean
}

export function FixtureListInput({
  value,
  onChange,
  hideGroupMode,
  ordering,
  compact,
}: FixtureListInputProps) {
  const rawMasterData = useRawMasterData()
  const { masterData, masterDataMaps } = useMasterDataAndMaps()
  const [activeCategory, setActiveCategory] = useState(
    ordering ? null : categories[0]
  )

  const base = activeCategory?.useRawMasterData ? rawMasterData : masterData

  const allEntities = activeCategory
    ? (base[activeCategory.entity] as Array<
        FixtureType | Fixture | FixtureGroup
      >)
    : []

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

  const entities = allEntities.filter(entity => {
    const fixtureCount = fixtureCountByEntity.get(entity) ?? 0
    return fixtureCount >= 1
  })

  const allMappedFixtures = new Set(
    mapFixtureList(value ?? [], {
      masterData,
      masterDataMaps,
    })
  )

  const availableCategories = hideGroupMode
    ? categories.filter(it => it !== groupCategory)
    : categories

  return (
    <div className={flexAuto}>
      <div className={categoryContainer}>
        {ordering && (
          <Button
            className={categoryEntry}
            active={activeCategory === null}
            onDown={() => setActiveCategory(null)}
          >
            <Icon icon={iconList} />
          </Button>
        )}
        {availableCategories.map((category, index) => {
          const count = countByCategory.get(category) ?? 0

          return (
            <Button
              key={index}
              className={categoryEntry}
              active={category === activeCategory}
              onDown={() => setActiveCategory(category)}
              title={category.label}
            >
              <Icon icon={category.icon} />
              {count > 0 && ` ${count}`}
            </Button>
          )
        })}
      </div>
      {activeCategory === null && (
        <SortableFixtureMapping
          value={value ?? []}
          onChange={onChange}
          compact={compact}
        />
      )}
      {activeCategory && (
        <div
          className={cx(scrollContainer, compact && scrollContainer_compact)}
        >
          {entities.map(entity => {
            const entry = activeCategory?.prefix + entity.id
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
                disabled={
                  activeCategory === fixtureCategory &&
                  !active &&
                  allMappedFixtures.has(entity.id)
                }
              >
                {entity.name}
                {activeCategory !== fixtureCategory &&
                  ` [${fixtureCountByEntity.get(entity)}]`}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
