import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { Fixture, FixtureChannels, FixtureType } from '@vlight/types'

import { broadcastUniverseChannelToApiClients } from '../../src/services/api'
import { universeSize } from '../../src/services/config'
import { broadcastUniverseChannelToDevices } from '../../src/devices'
import {
  addUniverse,
  createUniverse,
  getDmxUniverse,
  initUniverse,
  overwriteUniverse,
  removeUniverse,
  setUniverseChannel,
  setUniverseChannels,
  setUniverseOutput,
  setUniverseOverride,
  setUniverseState,
  Universe,
} from '../../src/services/universe'
import { masterData, masterDataMaps } from '../../src/services/masterdata'
import { universes } from '../../src/services/universe/state'
import { handleDmxMasterApiMessage } from '../../src/services/universe/computing'

vi.mock('../../src/devices')
vi.mock('../../src/services/api')
vi.mock('../../src/services/masterdata')

const fixtureTypeWithMaster: FixtureType = {
  id: '1',
  name: 'with master',
  mapping: ['m', 'r', 'g', 'b', 'x'],
}

const fixtureTypeWithoutMaster: FixtureType = {
  id: '2',
  name: 'without master',
  mapping: ['r', 'g', 'b', 'x'],
}

const fixtureTypeWithSegmentMasters: FixtureType = {
  id: '3',
  name: 'with a master per segment',
  mapping: ['m', 'r', 'm', 'r'],
}

const fixture1: Fixture = {
  id: '1',
  type: fixtureTypeWithMaster.id,
  channel: 1,
}

const fixture2: Fixture = {
  id: '2',
  type: fixtureTypeWithoutMaster.id,
  channel: 6,
}

const fixture3: Fixture = {
  id: '3',
  type: fixtureTypeWithSegmentMasters.id,
  channel: 20,
}

masterData.fixtureTypes = [
  fixtureTypeWithMaster,
  fixtureTypeWithoutMaster,
  fixtureTypeWithSegmentMasters,
]
masterData.fixtureTypes.forEach(fixtureType =>
  masterDataMaps.fixtureTypes.set(fixtureType.id, fixtureType)
)
masterData.fixtures = [fixture1, fixture2, fixture3]
masterData.fixtures.forEach(fixture =>
  masterDataMaps.fixtures.set(fixture.id, fixture)
)

function universeWithFixtures(
  channels1?: FixtureChannels | null,
  channels2?: FixtureChannels | null
) {
  return createUniverse({
    [fixture1.id]: channels1
      ? { on: true, channels: channels1 }
      : { on: false, channels: {} },
    [fixture2.id]: channels2
      ? { on: true, channels: channels2 }
      : { on: false, channels: {} },
  })
}

const fullChannels: FixtureChannels = {
  m: 255,
  r: 255,
  g: 255,
  b: 255,
  x: 255,
}

const fadedChannels: FixtureChannels = {
  ...fullChannels,
  m: 127,
}

const doubleFadedChannels: FixtureChannels = {
  ...fullChannels,
  m: 63,
}

const emptyUniverse = createUniverse()
const fullUniverse = universeWithFixtures(fullChannels, fullChannels)
// For the fixture without master, only the master-dependent (color) channels are faded,
// so `x` stays untouched
const fadedUniverse = universeWithFixtures(fadedChannels, fadedChannels)
const doubleFadedUniverse = universeWithFixtures(
  doubleFadedChannels,
  doubleFadedChannels
)

function mockDmxMaster(value: number) {
  handleDmxMasterApiMessage({ type: 'dmx-master', value })
}

describe('services/universe', () => {
  beforeEach(() => {
    universes.forEach(removeUniverse)
    void initUniverse()
    vi.resetAllMocks()
  })

  describe('addUniverse', () => {
    it('applies the universe to DMX', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      addUniverse(universe)
      expect(getDmxUniverse()).toEqual(universe)
    })

    it('merges multiple universes', () => {
      addUniverse(universeWithFixtures(fullChannels))
      addUniverse(universeWithFixtures(null, fullChannels))
      expect(getDmxUniverse()).toEqual(fullUniverse)
    })

    it('applies the given master value and the DMX master', () => {
      mockDmxMaster(127)
      const universe = universeWithFixtures(fullChannels, fullChannels)
      addUniverse(universe, { masterValue: 127 })
      expect(getDmxUniverse()).toEqual(doubleFadedUniverse)
    })

    it('handles different fixture master values', () => {
      addUniverse(universeWithFixtures({ m: 127, r: 255 }, { m: 127, r: 255 }))
      addUniverse(universeWithFixtures({ m: 255, g: 255 }, { m: 255, g: 255 }))
      expect(getDmxUniverse()).toEqual(
        universeWithFixtures(
          { m: 255, r: 127, g: 255 },
          { m: 255, r: 127, g: 255 }
        )
      )
    })

    it('handles a separate master channel per segment', () => {
      addUniverse(
        createUniverse({ '3@1': { on: true, channels: { m: 127, r: 255 } } })
      )
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 255, r: 255 } } })
      )
      expect(getDmxUniverse().slice(19, 23)).toEqual(
        Buffer.from([127, 255, 255, 255])
      )
    })

    it('handles different master values of the same segment', () => {
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 127, r: 255 } } })
      )
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 255, r: 100 } } })
      )
      expect(getDmxUniverse().slice(19, 23)).toEqual(
        Buffer.from([0, 0, 255, 127])
      )
    })

    it('broadcasts changes', () => {
      const universe = universeWithFixtures({ m: 127 })
      addUniverse(universe)
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 127)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures()
      addUniverse(universe)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })

    it('ignores universes already active', () => {
      const universe = universeWithFixtures(
        { m: 127, r: 255 },
        { m: 127, r: 255 }
      )
      addUniverse(universe)
      addUniverse(universe)
      expect(getDmxUniverse()).toEqual(universe)
    })
  })

  describe('removeUniverse', () => {
    it('empties the DMX universe if it is the last one', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      addUniverse(universe)
      removeUniverse(universe)
      expect(getDmxUniverse()).toEqual(emptyUniverse)
    })

    it('leaves other universes active', () => {
      const universe1 = universeWithFixtures(fullChannels)
      const universe2 = universeWithFixtures(null, fullChannels)
      addUniverse(universe1)
      addUniverse(universe2)
      removeUniverse(universe2)
      expect(getDmxUniverse()).toEqual(universe1)
    })

    it('ignores universes that are not active', () => {
      const universe1 = universeWithFixtures(fullChannels)
      const universe2 = universeWithFixtures(null, fullChannels)
      addUniverse(universe1)
      addUniverse(universe2)
      removeUniverse(universe2)
      removeUniverse(universe2)
      expect(getDmxUniverse()).toEqual(universe1)
    })

    it('handles different fixture master values', () => {
      const universe1 = universeWithFixtures(
        { m: 127, r: 255 },
        { m: 127, r: 255 }
      )
      const universe2 = universeWithFixtures(
        { m: 255, g: 255 },
        { m: 255, g: 255 }
      )
      addUniverse(universe1)
      addUniverse(universe2)
      removeUniverse(universe2)
      expect(getDmxUniverse()).toEqual(universe1)
    })

    it('handles a separate master channel per segment', () => {
      addUniverse(
        createUniverse({ '3@1': { on: true, channels: { m: 127, r: 255 } } })
      )
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 255, r: 255 } } })
      )
      expect(getDmxUniverse().slice(19, 23)).toEqual(
        Buffer.from([127, 255, 255, 255])
      )
    })

    it('handles different master values of the same segment', () => {
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 127, r: 255 } } })
      )
      addUniverse(
        createUniverse({ '3@2': { on: true, channels: { m: 255, r: 100 } } })
      )
      expect(getDmxUniverse().slice(19, 23)).toEqual(
        Buffer.from([0, 0, 255, 127])
      )
    })

    it('broadcasts changes', () => {
      const universe = universeWithFixtures({ m: 127 })
      addUniverse(universe)
      vi.resetAllMocks()
      removeUniverse(universe)
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 0)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures()
      addUniverse(universe)
      vi.resetAllMocks()
      removeUniverse(universe)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })
  })

  describe('setUniverseChannel', () => {
    let universe: Universe

    beforeEach(() => {
      universe = createUniverse()
      addUniverse(universe)
    })

    it('throws on invalid channels', () => {
      expect(() => setUniverseChannel(universe, -1, 0)).toThrow(
        /invalid channel/
      )
      expect(() => setUniverseChannel(universe, 0, 0)).toThrow(
        /invalid channel/
      )
      expect(() => setUniverseChannel(universe, universeSize + 1, 0)).toThrow(
        /invalid channel/
      )
    })

    it('changes values', () => {
      expect(getDmxUniverse()).toEqual(universeWithFixtures())

      // higher value
      setUniverseChannel(universe, 1, 255)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 255 }))

      // lower value
      setUniverseChannel(universe, 1, 200)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 200 }))

      // same value
      setUniverseChannel(universe, 1, 200)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 200 }))
    })

    it('applies the universe master', () => {
      setUniverseState(universe, { masterValue: 127 })
      setUniverseChannel(universe, 1, 255)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 127 }))

      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 127)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('applies the DMX master', () => {
      mockDmxMaster(127)
      setUniverseChannel(universe, 1, 255)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 127 }))
    })

    it('applies both universe and the DMX master', () => {
      setUniverseState(universe, { masterValue: 127 })
      mockDmxMaster(127)
      setUniverseChannel(universe, 1, 255)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 63 }))
    })

    it('recomputes affected channels when chaning the master channel', () => {
      const universe2 = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe2)
      setUniverseChannel(universe, 1, 255)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 255, r: 127 }))

      setUniverseChannel(universe2, 2, 127)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 255, r: 63 }))

      setUniverseChannel(universe, 1, 0)
      expect(getDmxUniverse()).toEqual(universeWithFixtures({ m: 127, r: 127 }))
    })

    it('broadcasts changes', () => {
      setUniverseChannel(universe, 1, 255)
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 255)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      setUniverseChannel(universe, 1, 0)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })
  })

  describe('setUniverseState', () => {
    it('changes the existing values', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      addUniverse(universe)
      setUniverseState(universe, { masterValue: 127 })
      expect(getDmxUniverse()).toEqual(fadedUniverse)
    })

    it('respects the DMX master', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      mockDmxMaster(127)
      addUniverse(universe)
      setUniverseState(universe, { masterValue: 127 })
      expect(getDmxUniverse()).toEqual(doubleFadedUniverse)
    })

    it('recomputes affected channels', () => {
      const universe1 = universeWithFixtures({ m: 127, r: 255 })
      const universe2 = universeWithFixtures({ m: 255, g: 255 })
      addUniverse(universe1)
      addUniverse(universe2)
      setUniverseState(universe1, { masterValue: 127 })
      expect(getDmxUniverse()).toEqual(
        universeWithFixtures({ m: 255, r: 63, g: 255 })
      )

      setUniverseState(universe2, { masterValue: 63 })
      expect(getDmxUniverse()).toEqual(
        universeWithFixtures({ m: 63, r: 255, g: 255 })
      )
    })

    it('broadcasts changes', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      vi.resetAllMocks()
      setUniverseState(universe, { masterValue: 127 })
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 63)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      vi.resetAllMocks()
      setUniverseState(universe, { masterValue: 255 })
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })

    it('does nothing if the universe is not active', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      setUniverseState(universe, { masterValue: 127 })
      expect(getDmxUniverse()).toEqual(emptyUniverse)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })
  })

  describe('overwriteUniverse', () => {
    it('overwrites the given universe', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      const universe2 = universeWithFixtures({ m: 63, r: 255 })
      overwriteUniverse(universe, universe2)
      expect(universe).toEqual(universe2)
    })

    it('broadcasts changes', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      vi.resetAllMocks()
      overwriteUniverse(universe, universeWithFixtures({ m: 63, r: 255 }))
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 63)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      vi.resetAllMocks()
      overwriteUniverse(universe, universe)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })
  })

  describe('setUniverseOutput', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      // finish all fades so the fade interval is not kept across tests
      vi.advanceTimersByTime(5000)
      vi.useRealTimers()
    })

    const masterChannelValue = () => getDmxUniverse()[0]

    it('adds and removes the universe immediately without fade', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      expect(setUniverseOutput(universe, { on: true, masterValue: 127 })).toBe(
        false
      )
      expect(getDmxUniverse()).toEqual(fadedUniverse)

      expect(setUniverseOutput(universe, { on: false })).toBe(false)
      expect(universes.has(universe)).toBe(false)
      expect(getDmxUniverse()).toEqual(emptyUniverse)
    })

    it('fades the universe in', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      expect(setUniverseOutput(universe, { on: true, fade: 1 })).toBe(true)
      expect(universes.has(universe)).toBe(true)
      expect(masterChannelValue()).toBe(0)

      vi.advanceTimersByTime(500)
      expect(masterChannelValue()).toBeGreaterThan(110)
      expect(masterChannelValue()).toBeLessThan(145)

      vi.advanceTimersByTime(600)
      expect(getDmxUniverse()).toEqual(fullUniverse)
    })

    it('fades the universe out and removes it afterwards', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      const onFadedOut = vi.fn<() => void>()
      setUniverseOutput(universe, { on: true })
      setUniverseOutput(universe, { on: false, fade: 1, onFadedOut })

      vi.advanceTimersByTime(500)
      expect(universes.has(universe)).toBe(true)
      expect(onFadedOut).not.toHaveBeenCalled()

      vi.advanceTimersByTime(600)
      expect(universes.has(universe)).toBe(false)
      expect(getDmxUniverse()).toEqual(emptyUniverse)
      expect(onFadedOut).toHaveBeenCalledTimes(1)
    })

    it('fades the master value', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      setUniverseOutput(universe, { on: true })
      setUniverseOutput(universe, { on: true, masterValue: 127, fade: 1 })

      vi.advanceTimersByTime(500)
      expect(masterChannelValue()).toBeGreaterThan(127)
      expect(masterChannelValue()).toBeLessThan(255)

      vi.advanceTimersByTime(600)
      expect(getDmxUniverse()).toEqual(fadedUniverse)
    })

    it('reverses a running fade from its current value', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      setUniverseOutput(universe, { on: true, fade: 1 })
      vi.advanceTimersByTime(300)

      setUniverseOutput(universe, { on: false, fade: 1 })
      expect(masterChannelValue()).toBeGreaterThan(50)

      // only takes as long as the distance faded so far
      vi.advanceTimersByTime(400)
      expect(universes.has(universe)).toBe(false)
    })

    it('does not interrupt a running fade if the target does not change', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      setUniverseOutput(universe, { on: false })
      setUniverseOutput(universe, { on: true, fade: 1 })
      vi.advanceTimersByTime(500)

      expect(setUniverseOutput(universe, { on: true })).toBe(true)
      expect(masterChannelValue()).toBeLessThan(255)

      vi.advanceTimersByTime(600)
      expect(getDmxUniverse()).toEqual(fullUniverse)
    })

    it('stops the fade if the universe is removed elsewhere', () => {
      const universe = universeWithFixtures(fullChannels, fullChannels)
      const onFadedOut = vi.fn<() => void>()
      setUniverseOutput(universe, { on: true })
      setUniverseOutput(universe, { on: false, fade: 1, onFadedOut })
      removeUniverse(universe)

      vi.advanceTimersByTime(1100)
      expect(universes.has(universe)).toBe(false)
      expect(onFadedOut).not.toHaveBeenCalled()
    })
  })

  describe('setUniverseChannels', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      // finish all fades so the fade interval is not kept across tests
      vi.advanceTimersByTime(5000)
      vi.useRealTimers()
    })

    const channel = 20
    const dmxValue = () => getDmxUniverse()[channel - 1]

    function activeUniverse() {
      const universe = createUniverse()
      addUniverse(universe)
      return universe
    }

    it('sets the values immediately without fade', () => {
      const universe = activeUniverse()
      expect(setUniverseChannels(universe, [[channel, 200]])).toBe(true)
      expect(dmxValue()).toBe(200)
      expect(setUniverseChannels(universe, [[channel, 200]])).toBe(false)
    })

    it('does not fade inactive universes', () => {
      const universe = createUniverse()
      setUniverseChannels(universe, [[channel, 200]], { fade: 1 })
      expect(universe[channel - 1]).toBe(200)
    })

    it('fades the values', () => {
      const universe = activeUniverse()
      const onFinished = vi.fn<() => void>()
      setUniverseChannels(universe, [[channel, 200]], { fade: 1, onFinished })
      expect(dmxValue()).toBe(0)

      vi.advanceTimersByTime(500)
      expect(dmxValue()).toBeGreaterThan(80)
      expect(dmxValue()).toBeLessThan(120)
      expect(onFinished).not.toHaveBeenCalled()

      vi.advanceTimersByTime(600)
      expect(dmxValue()).toBe(200)
      expect(onFinished).toHaveBeenCalledTimes(1)
    })

    it('reverses a running fade from its current value', () => {
      const universe = activeUniverse()
      setUniverseChannels(universe, [[channel, 200]], { fade: 1 })
      vi.advanceTimersByTime(300)

      setUniverseChannels(universe, [[channel, 0]], { fade: 1 })
      vi.advanceTimersByTime(400)
      expect(dmxValue()).toBe(0)
    })

    it('does not interrupt a running fade if the target does not change', () => {
      const universe = activeUniverse()
      setUniverseChannels(universe, [[channel, 200]], { fade: 1 })
      vi.advanceTimersByTime(500)

      expect(setUniverseChannels(universe, [[channel, 200]])).toBe(false)
      expect(dmxValue()).toBeLessThan(200)
    })

    it('interrupts a running fade when setting a new value without fade', () => {
      const universe = activeUniverse()
      setUniverseChannels(universe, [[channel, 200]], { fade: 1 })
      vi.advanceTimersByTime(500)

      setUniverseChannels(universe, [[channel, 50]])
      expect(dmxValue()).toBe(50)
      vi.advanceTimersByTime(600)
      expect(dmxValue()).toBe(50)
    })
  })

  describe('overrides', () => {
    /** Creates a weights universe that fully overrides the given channels. */
    function weightsFor(...channels: number[]) {
      const weights = createUniverse()
      channels.forEach(channel => (weights[channel - 1] = 255))
      return weights
    }

    const fixture1Channels = [1, 2, 3, 4, 5]
    const fixture2Channels = [6, 7, 8, 9]
    const dmx = (from: number, to: number) =>
      Array.from(getDmxUniverse().subarray(from - 1, to))

    function overridingUniverse(
      channels1: FixtureChannels | null,
      channels2: FixtureChannels | null,
      weightedChannels: number[]
    ) {
      const universe = universeWithFixtures(channels1, channels2)
      setUniverseOverride(universe, weightsFor(...weightedChannels))
      return universe
    }

    it('replaces the values of the weighted channels', () => {
      addUniverse(universeWithFixtures({ m: 255, b: 255 }, { b: 255 }))
      addUniverse(overridingUniverse(null, { r: 255 }, fixture2Channels))
      // fixture 1 is merged as usual
      expect(dmx(1, 4)).toEqual([255, 0, 0, 255])
      expect(dmx(6, 8)).toEqual([255, 0, 0])
    })

    it('restores the merged values when removed', () => {
      addUniverse(universeWithFixtures(null, { b: 255 }))
      const universe = overridingUniverse(null, { r: 255 }, fixture2Channels)
      addUniverse(universe)
      removeUniverse(universe)
      expect(dmx(6, 8)).toEqual([0, 0, 255])
    })

    it('crossfades by the master value', () => {
      addUniverse(universeWithFixtures(null, { b: 255 }))
      addUniverse(overridingUniverse(null, { r: 255 }, fixture2Channels), {
        masterValue: 51,
      })
      expect(dmx(6, 8)).toEqual([51, 0, 204])
    })

    it('blends the effective brightness of fixtures with a master channel', () => {
      const base = universeWithFixtures({ m: 255, b: 255 })
      addUniverse(base)
      const universe = overridingUniverse({ m: 255, r: 255 }, null, [
        ...fixture1Channels,
      ])
      addUniverse(universe, { masterValue: 51 })
      expect(dmx(1, 4)).toEqual([255, 51, 0, 204])

      // fading in over a dark fixture only fades the master channel
      removeUniverse(base)
      expect(dmx(1, 4)).toEqual([51, 255, 0, 0])
    })

    it('keeps the effective brightness when only overriding the master channel', () => {
      addUniverse(universeWithFixtures({ m: 51, b: 255 }))
      addUniverse(overridingUniverse({ m: 255 }, null, [1]))
      expect(dmx(1, 4)).toEqual([255, 0, 0, 51])
    })

    it('applies the overriding universe activated last on top', () => {
      const red = overridingUniverse(null, { r: 255 }, fixture2Channels)
      const green = overridingUniverse(null, { g: 255 }, fixture2Channels)
      addUniverse(red)
      addUniverse(green)
      expect(dmx(6, 8)).toEqual([0, 255, 0])

      removeUniverse(green)
      expect(dmx(6, 8)).toEqual([255, 0, 0])
    })

    it('moves a universe on top when turned on while fading out', () => {
      vi.useFakeTimers()
      const red = overridingUniverse(null, { r: 255 }, fixture2Channels)
      const green = overridingUniverse(null, { g: 255 }, fixture2Channels)
      setUniverseOutput(red, { on: true })
      setUniverseOutput(green, { on: true })
      setUniverseOutput(red, { on: false, fade: 1 })
      setUniverseOutput(red, { on: true, fade: 1 })
      vi.advanceTimersByTime(1100)
      expect(dmx(6, 8)).toEqual([255, 0, 0])
      vi.useRealTimers()
    })

    it('fades the weights', () => {
      vi.useFakeTimers()
      addUniverse(universeWithFixtures(null, { b: 255 }))
      const universe = universeWithFixtures(null, { r: 255 })
      const weights = createUniverse()
      setUniverseOverride(universe, weights)
      addUniverse(universe)
      // without weights, the universe is not visible at all
      expect(dmx(6, 8)).toEqual([0, 0, 255])

      setUniverseChannels(
        weights,
        fixture2Channels.map(channel => [channel, 255]),
        { fade: 1 }
      )
      vi.advanceTimersByTime(500)
      expect(getDmxUniverse()[7]).toBeGreaterThan(80)
      expect(getDmxUniverse()[7]).toBeLessThan(180)

      vi.advanceTimersByTime(600)
      expect(dmx(6, 8)).toEqual([255, 0, 0])
      vi.useRealTimers()
    })

    it('dims its own values by the master value if configured', () => {
      addUniverse(universeWithFixtures({ m: 255, b: 255 }, { b: 255 }))
      const universe = universeWithFixtures({ m: 255, r: 255 }, { r: 255 })
      setUniverseOverride(
        universe,
        weightsFor(...fixture1Channels, ...fixture2Channels),
        true
      )
      addUniverse(universe, { masterValue: 51 })
      expect(dmx(1, 4)).toEqual([51, 255, 0, 0])
      expect(dmx(6, 8)).toEqual([51, 0, 0])

      setUniverseState(universe, { masterValue: 0 })
      // the fixture with master is dark through its master channel
      expect(dmx(1, 1)).toEqual([0])
      expect(dmx(6, 8)).toEqual([0, 0, 0])
    })

    it('merges again after removing the override', () => {
      addUniverse(universeWithFixtures(null, { b: 255 }))
      const universe = overridingUniverse(null, { r: 255 }, fixture2Channels)
      addUniverse(universe)
      setUniverseOverride(universe, null)
      expect(dmx(6, 8)).toEqual([255, 0, 255])
    })
  })
})
