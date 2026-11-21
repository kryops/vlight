import {
  DynamicPage,
  FixtureAction,
  NamedAction,
  Fixture,
  FixtureGroup,
  FixtureType,
  Memory,
  ProgrammableButton,
  Sequence,
} from '@vlight/types'
import { ChannelType } from '@vlight/controls'

type WithoutId<T> = Omit<T, 'id'>

export function newFixtureTypeFactory(): WithoutId<FixtureType> {
  return {
    name: 'New Fixture Type',
    mapping: [ChannelType.Master],
  }
}

export function newFixtureFactory(): WithoutId<Fixture> {
  return {
    name: 'New Fixture',
    type: '',
    channel: 1,
  }
}

export function newFixtureGroupFactory(): WithoutId<FixtureGroup> {
  return {
    name: 'New Fixture Group',
    fixtures: [],
  }
}

export function newMemoryFactory(): WithoutId<Memory> {
  return {
    name: 'New Memory',
    display: 'both',
    scenes: [
      {
        members: [],
        states: [
          {
            on: true,
            channels: {
              m: 255,
              r: 255,
              g: 255,
              b: 255,
            },
          },
        ],
      },
    ],
  }
}

export function newDynamicPageFactory(): WithoutId<DynamicPage> {
  return {
    rows: [
      {
        widgets: [
          {
            type: 'map',
          },
        ],
      },
    ],
  }
}

export function newButtonFactory(): WithoutId<ProgrammableButton> {
  return {
    label: 'New Button',
    down: [],
    up: [],
  }
}

export function newSequenceFactory(): WithoutId<Sequence> {
  return {
    name: 'New Sequence',
    steps: [{ delay: 0, actions: [] }],
    endDelay: 0,
  }
}

export function newNamedActionFactory(): WithoutId<NamedAction> {
  const action: FixtureAction = {
    type: 'fixture',
    members: [],
    state: {},
    partial: true,
  }
  return { ...action, name: 'New Action' }
}
