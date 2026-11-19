import { describe, expect, it } from 'vite-plus/test'

import {
  Fixture,
  FixtureType,
  LiveMovement,
  MasterData,
  MasterDataMaps,
} from '@vlight/types'
import { entityArrayToMap } from '@vlight/utils'

import {
  getLiveMovementFixturePositions,
  getLiveMovementMemberPhase,
  getLiveMovementMemberRotation,
  getLiveMovementPatternPoint,
  getLiveMovementPosition,
  isLiveMovementMemberInverted,
} from '../src'

const fixtureTypes: FixtureType[] = [
  { id: 'head', name: 'Head', mapping: ['m', 'pan', 'panf', 'tilt', 'tiltf'] },
  { id: 'par', name: 'Par', mapping: ['r', 'g', 'b'] },
]

const fixtures: Fixture[] = [
  { id: 'head1', name: 'Head 1', type: 'head', channel: 1, x: 50 },
  { id: 'head2', name: 'Head 2', type: 'head', channel: 6, x: 10 },
  { id: 'par1', name: 'Par 1', type: 'par', channel: 11 },
]

const masterData: MasterData = {
  fixtureTypes,
  fixtures,
  fixtureGroups: [],
  dynamicPages: [],
  memories: [],
  chaseColorPresets: [],
  memorySceneStatePresets: [],
}

const masterDataMaps: MasterDataMaps = {
  fixtureTypes: entityArrayToMap(fixtureTypes),
  fixtures: entityArrayToMap(fixtures),
  fixtureGroups: new Map(),
  dynamicPages: new Map(),
  memories: new Map(),
  chaseColorPresets: new Map(),
  memorySceneStatePresets: new Map(),
}

function getMovement(overrides: Partial<LiveMovement> = {}): LiveMovement {
  return {
    on: true,
    stopped: false,
    members: ['head1', 'head2', 'par1'],
    pattern: 'circle',
    center: { pan: 127, tilt: 127 },
    scaleX: 100,
    scaleY: 100,
    rotation: 0,
    offset: 0,
    speed: 1,
    ...overrides,
  }
}

describe('getLiveMovementPatternPoint', () => {
  it.each<[LiveMovement['pattern'], number, [number, number]]>([
    ['line', 0.25, [1, 0]],
    ['circle', 0, [1, 0]],
    ['circle', 0.25, [0, 1]],
    ['square', 0, [1, 1]],
    ['square', 0.375, [-1, 0]],
    ['eight', 0.5, [0, 0]],
    ['sine', 0, [-1, 0]],
  ])('%s at %f', (pattern, phase, [x, y]) => {
    const [actualX, actualY] = getLiveMovementPatternPoint(pattern, phase)
    expect(actualX).toBeCloseTo(x)
    expect(actualY).toBeCloseTo(y)
  })

  it('stays within -1 and 1', () => {
    const patterns: LiveMovement['pattern'][] = [
      'line',
      'sine',
      'circle',
      'square',
      'eight',
    ]
    for (const pattern of patterns) {
      for (let phase = 0; phase <= 1; phase += 0.01) {
        for (const value of getLiveMovementPatternPoint(pattern, phase)) {
          expect(Math.abs(value)).toBeLessThanOrEqual(1 + 1e-9)
        }
      }
    }
  })
})

describe('getLiveMovementPosition', () => {
  it('applies scale and center', () => {
    const position = getLiveMovementPosition(getMovement(), 0)
    expect(position.pan).toBeCloseTo(177)
    expect(position.tilt).toBeCloseTo(127)
  })

  it('applies rotation', () => {
    const position = getLiveMovementPosition(getMovement({ rotation: 90 }), 0)
    expect(position.pan).toBeCloseTo(127)
    expect(position.tilt).toBeCloseTo(177)
  })

  it('applies a rotation override', () => {
    const position = getLiveMovementPosition(
      getMovement({ rotation: 90 }),
      0,
      180
    )
    expect(position.pan).toBeCloseTo(77)
    expect(position.tilt).toBeCloseTo(127)
  })

  it('limits to the DMX range', () => {
    const position = getLiveMovementPosition(
      getMovement({ center: { pan: 250, tilt: 0 }, scaleX: 255 }),
      0
    )
    expect(position.pan).toBe(255)
    expect(position.tilt).toBe(0)
  })
})

describe('isLiveMovementMemberInverted', () => {
  it.each<[LiveMovement['invert'], boolean[]]>([
    [undefined, [false, false, false, false]],
    ['none', [false, false, false, false]],
    ['all', [true, true, true, true]],
    ['half', [false, false, true, true]],
    ['alternate', [false, true, false, true]],
  ])('%s', (invert, expected) => {
    expect(
      expected.map((_, index) => isLiveMovementMemberInverted(invert, index, 4))
    ).toEqual(expected)
  })
})

describe('getLiveMovementMemberPhase', () => {
  it('applies the offset', () => {
    expect(getLiveMovementMemberPhase({ offset: 0.25 }, 0.1, 2, 4)).toBeCloseTo(
      0.6
    )
  })

  it('wraps around', () => {
    expect(getLiveMovementMemberPhase({ offset: 0.5 }, 0.75, 1, 4)).toBeCloseTo(
      0.25
    )
  })

  it('inverts the direction', () => {
    expect(
      getLiveMovementMemberPhase({ offset: 0, invert: 'all' }, 0.25, 0, 4)
    ).toBeCloseTo(0.75)
  })
})

describe('getLiveMovementMemberRotation', () => {
  it('applies the rotation offset', () => {
    expect(
      getLiveMovementMemberRotation({ rotation: 10, rotationOffset: 30 }, 2)
    ).toBe(70)
  })

  it('defaults to no rotation offset', () => {
    expect(getLiveMovementMemberRotation({ rotation: 10 }, 2)).toBe(10)
  })
})

describe('getLiveMovementFixturePositions', () => {
  it('ignores fixtures without pan/tilt', () => {
    expect(
      Object.keys(
        getLiveMovementFixturePositions(getMovement(), 0, {
          masterData,
          masterDataMaps,
        })
      )
    ).toEqual(['head1', 'head2'])
  })

  it('positions all members at the center without a phase', () => {
    expect(
      getLiveMovementFixturePositions(
        getMovement({ center: { pan: 10, tilt: 20 } }),
        null,
        { masterData, masterDataMaps }
      )
    ).toEqual({
      head1: { pan: 10, tilt: 20 },
      head2: { pan: 10, tilt: 20 },
    })
  })

  it('applies the rotation offset in order', () => {
    expect(
      getLiveMovementFixturePositions(
        getMovement({ rotationOffset: 90, order: 'xcoord' }),
        0,
        { masterData, masterDataMaps }
      )
    ).toEqual({
      head2: { pan: 177, tilt: 127 },
      head1: { pan: 127, tilt: 177 },
    })
  })

  it('applies the order for the offset', () => {
    expect(
      getLiveMovementFixturePositions(
        getMovement({ offset: 0.5, order: 'xcoord' }),
        0,
        { masterData, masterDataMaps }
      )
    ).toEqual({
      head2: { pan: 177, tilt: 127 },
      head1: { pan: 77, tilt: 127 },
    })
  })
})
