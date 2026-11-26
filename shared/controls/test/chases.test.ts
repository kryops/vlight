import { describe, expect, it } from 'vite-plus/test'

import {
  ChaseColor,
  Fixture,
  FixtureType,
  LiveChase,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { entityArrayToMap } from '@vlight/utils'

import {
  getLiveChaseActiveCount,
  getLiveChaseFixtureStates,
  LiveChaseProgress,
} from '../src'

const fixtureTypes: FixtureType[] = [
  { id: 'par', name: 'Par', mapping: ['m', 'r', 'g', 'b'] },
]

// member order is reversed compared to the X coordinates
const fixtures: Fixture[] = [1, 2, 3, 4].map(index => ({
  id: `par${index}`,
  name: `Par ${index}`,
  type: 'par',
  channel: index * 4,
  x: 50 - index * 10,
}))

const masterData: MasterData = {
  fixtureTypes,
  fixtures,
  fixtureGroups: [],
  dynamicPages: [],
  memories: [],
  chaseColorPresets: [],
  memorySceneStatePresets: [],
  buttons: [],
  sequences: [],
  actions: [],
}

const masterDataMaps: MasterDataMaps = {
  fixtureTypes: entityArrayToMap(fixtureTypes),
  fixtures: entityArrayToMap(fixtures),
  fixtureGroups: new Map(),
  dynamicPages: new Map(),
  memories: new Map(),
  chaseColorPresets: new Map(),
  memorySceneStatePresets: new Map(),
  buttons: new Map(),
  sequences: new Map(),
  actions: new Map(),
}

const red: ChaseColor = { channels: { m: 255, r: 255 } }
const green: ChaseColor = { channels: { m: 255, g: 255 } }
const blue: ChaseColor = { channels: { m: 255, b: 255 } }

function getChase(overrides: Partial<LiveChase> = {}): LiveChase {
  return {
    on: true,
    stopped: false,
    members: ['par1', 'par2', 'par3', 'par4'],
    value: 255,
    speed: 1,
    light: 1,
    colors: [red],
    ...overrides,
  }
}

/** Runs the given number of steps, returning the active members for each. */
function runSteps(liveChase: LiveChase, steps: number) {
  let progress: LiveChaseProgress | undefined
  return Array.from({ length: steps }, () => {
    const result = getLiveChaseFixtureStates(
      liveChase,
      { masterData, masterDataMaps },
      progress
    )
    progress = result.progress
    return result.fixtureStates
  })
}

function activeMembers(liveChase: LiveChase, steps: number) {
  return runSteps(liveChase, steps).map(states => Object.keys(states).join(','))
}

/** Returns the color (r/g/b) of each member for each step. */
function memberColors(liveChase: LiveChase, steps: number) {
  return runSteps(liveChase, steps).map(states =>
    liveChase.members
      .map(member => {
        const channels = states[member]?.channels
        if (!channels) return '-'
        return channels.r ? 'r' : channels.g ? 'g' : 'b'
      })
      .join('')
  )
}

describe('getLiveChaseActiveCount', () => {
  it.each([
    [4, 0, 0],
    [4, 0.25, 1],
    [4, 0.6, 2],
    [4, 1, 4],
    [3, 0.5, 2],
  ])('%i members, light %d => %i', (members, light, expected) => {
    expect(getLiveChaseActiveCount(members, light)).toBe(expected)
  })
})

describe('getLiveChaseFixtureStates', () => {
  describe('ordered selection', () => {
    it('moves forward by one member, wrapping around', () => {
      expect(
        activeMembers(getChase({ order: 'members', light: 0.5 }), 5)
      ).toEqual([
        'par1,par2',
        'par2,par3',
        'par3,par4',
        'par4,par1',
        'par1,par2',
      ])
    })

    it('moves backward', () => {
      expect(
        activeMembers(
          getChase({
            order: 'members',
            orderDirection: 'backward',
            light: 0.25,
          }),
          5
        )
      ).toEqual(['par4', 'par3', 'par2', 'par1', 'par4'])
    })

    it('moves by the whole selection', () => {
      expect(
        activeMembers(
          getChase({
            order: 'members',
            orderAdvance: 'selection',
            light: 0.5,
          }),
          3
        )
      ).toEqual(['par1,par2', 'par3,par4', 'par1,par2'])
    })

    it('moves back and forth in ping-pong mode', () => {
      expect(
        activeMembers(
          getChase({
            order: 'members',
            orderDirection: 'ping-pong',
            light: 0.5,
          }),
          6
        )
      ).toEqual([
        'par1,par2',
        'par2,par3',
        'par3,par4',
        'par2,par3',
        'par1,par2',
        'par2,par3',
      ])
    })

    it('moves back and forth by the whole selection in ping-pong mode', () => {
      expect(
        activeMembers(
          getChase({
            members: ['par1', 'par2', 'par3'],
            order: 'members',
            orderDirection: 'ping-pong',
            orderAdvance: 'selection',
            light: 0.4,
          }),
          5
        )
      ).toEqual(['par1', 'par2', 'par3', 'par2', 'par1'])
    })

    it('orders by coordinates', () => {
      expect(
        activeMembers(getChase({ order: 'xcoord', light: 0.25 }), 4)
      ).toEqual(['par4', 'par3', 'par2', 'par1'])
    })

    it('does not advance when recomputing the current step', () => {
      const liveChase = getChase({ order: 'members', light: 0.25 })
      const first = getLiveChaseFixtureStates(liveChase, {
        masterData,
        masterDataMaps,
      })
      const second = getLiveChaseFixtureStates(
        { ...liveChase, light: 0.5 },
        { masterData, masterDataMaps },
        first.progress,
        false
      )
      expect(Object.keys(second.fixtureStates)).toEqual(['par1', 'par2'])
      expect(second.progress.step).toBe(0)
    })
  })

  describe('color selection', () => {
    it('applies colors sequentially in same-color mode', () => {
      expect(
        memberColors(
          getChase({
            colors: [red, green, blue],
            colorMode: 'same-color',
            colorSelection: 'sequential',
          }),
          4
        )
      ).toEqual(['rrrr', 'gggg', 'bbbb', 'rrrr'])
    })

    it('moves the colors along the members in random mode', () => {
      expect(
        memberColors(
          getChase({
            colors: [red, green, blue],
            colorSelection: 'sequential',
          }),
          3
        )
      ).toEqual(['rgbr', 'brgb', 'gbrg'])
    })

    it('moves the colors in the configured order', () => {
      expect(
        memberColors(
          getChase({
            colors: [red, green],
            colorSelection: 'sequential',
            order: 'members',
            orderDirection: 'backward',
          }),
          2
        )
      ).toEqual(['grgr', 'rgrg'])
    })

    it('distributes the colors equally', () => {
      const liveChase = getChase({
        members: ['par1', 'par2', 'par3', 'par4'],
        colors: [red, green, blue],
        colorSelection: 'equal',
      })
      for (const colors of memberColors(liveChase, 20)) {
        const counts = ['r', 'g', 'b'].map(
          color => colors.split('').filter(it => it === color).length
        )
        expect([...counts].sort((a, b) => a - b)).toEqual([1, 1, 2])
      }
    })
  })
})
