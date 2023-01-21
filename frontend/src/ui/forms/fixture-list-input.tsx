import { FixtureMappingPrefix, mapFixtureList } from '@vlight/controls'
import { EntityName, Fixture, FixtureGroup, FixtureType } from '@vlight/types'
import { css } from '@linaria/core'
import { useState } from 'react'

import { useMasterDataAndMaps, useRawMasterData } from '../../hooks/api'
import { cx } from '../../util/styles'
import { Button } from '../buttons/button'
import { flexAuto, verticalFlexContainer, flexContainer } from '../css/flex'
import {
  iconList,
  iconFixtureType,
  iconGroup,
  iconLight,
  iconLights,
} from '../icons'
import { baseline, iconShade } from '../styles'
import { useDelayedState } from '../../hooks/delayed-state'
import { memoInProduction } from '../../util/development'
import { useEvent } from '../../hooks/performance'

import { SortableFixtureMapping } from './sortable-fixture-mapping'

const container = verticalFlexContainer

const categoryContainer = flexContainer

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
  flex-grow: 1;
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

  /**
   * Controls whether to hide fixture groups from the selection.
   *
   * Defaults to `false`.
   */
  hideGroupMode?: boolean

  /**
   * Controls whether to allow re-ordering the seleced entries.
   *
   * Defaults to `false`.
   */
  ordering?: boolean

  /**
   * Reduces the height if set.
   *
   * Defaults to `false`.
   */
  compact?: boolean
}

/**
 * Input component to select a fixture string list.
 */
export const FixtureListInput = memoInProduction(
  ({
    value,
    onChange,
    hideGroupMode = false,
    ordering = false,
    compact = false,
  }: FixtureListInputProps) => {
    // We apply the changed value immediately, as otherwise the list might flicker
    const [localValue, setLocalValue] = useDelayedState<string[] | null>(null)

    const valueToDisplay = localValue ?? value ?? []
    const onChangeWrapper = useEvent((newValue: string[]) => {
      onChange(newValue)
      setLocalValue(newValue)
      setLocalValue(null, true)
    })

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
            return masterData.fixtures.filter(it => it.type === entity.id)
              .length
          if (activeCategory === groupCategory)
            return (entity as FixtureGroup).fixtures.length

          return 1
        })
        .map<[ListEntityType, number]>((count, index) => [
          allEntities[index],
          count,
        ]),
    ])

    const countByCategory = getCountByCategory(valueToDisplay)

    const entities = allEntities.filter(entity => {
      const fixtureCount = fixtureCountByEntity.get(entity) ?? 0
      return fixtureCount >= 1
    })

    const allMappedFixtures = new Set(
      mapFixtureList(valueToDisplay, {
        masterData,
        masterDataMaps,
      })
    )

    const availableCategories = hideGroupMode
      ? categories.filter(it => it !== groupCategory)
      : categories

    const onCategoryClick = useEvent(
      (_event: any, category: FixtureListCategory | null) =>
        setActiveCategory(category)
    )

    const onEntryClick = useEvent((_event: any, entry: string) =>
      onChangeWrapper(
        valueToDisplay.includes(entry)
          ? valueToDisplay.filter(it => it !== entry)
          : [...valueToDisplay, entry]
      )
    )

    return (
      <div className={cx(flexAuto, container)}>
        <div className={categoryContainer}>
          {ordering && (
            <Button<null>
              className={categoryEntry}
              active={activeCategory === null}
              icon={iconList}
              iconColor={iconShade(0)}
              onClick={onCategoryClick}
              onClickArg={null}
            />
          )}
          {availableCategories.map((category, index) => {
            const count = countByCategory.get(category) ?? 0

            return (
              <Button<FixtureListCategory>
                key={index}
                className={categoryEntry}
                active={category === activeCategory}
                onClick={onCategoryClick}
                onClickArg={category}
                title={category.label}
                icon={category.icon}
                iconColor={iconShade(0)}
              >
                {count > 0 && ` ${count}`}
              </Button>
            )
          })}
        </div>
        {activeCategory === null && (
          <SortableFixtureMapping
            value={valueToDisplay}
            onChange={onChangeWrapper}
            compact={compact}
          />
        )}
        {activeCategory && (
          <div
            className={cx(scrollContainer, compact && scrollContainer_compact)}
          >
            {entities.map(entity => {
              const entry = activeCategory?.prefix + entity.id
              const active = valueToDisplay.includes(entry)
              const text =
                entity.name +
                (activeCategory !== fixtureCategory
                  ? ` [${fixtureCountByEntity.get(entity)}]`
                  : '')

              return (
                <Button<string>
                  key={entity.id}
                  className={listEntry}
                  active={active}
                  block
                  onClick={onEntryClick}
                  onClickArg={entry}
                  disabled={
                    activeCategory === fixtureCategory &&
                    !active &&
                    allMappedFixtures.has(entity.id)
                  }
                >
                  {text}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
