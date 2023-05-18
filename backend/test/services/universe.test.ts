/**
 * @jest-environment node
 */

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
  setUniverseState,
  Universe,
} from '../../src/services/universe'
import { masterData, masterDataMaps } from '../../src/services/masterdata'
import { universes } from '../../src/services/universe/state'
import { handleDmxMasterApiMessage } from '../../src/services/universe/computing'

jest.mock('../../src/devices')
jest.mock('../../src/services/api')
jest.mock('../../src/services/masterdata')

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

masterData.fixtureTypes = [fixtureTypeWithMaster, fixtureTypeWithoutMaster]
masterData.fixtureTypes.forEach(fixtureType =>
  masterDataMaps.fixtureTypes.set(fixtureType.id, fixtureType)
)
masterData.fixtures = [fixture1, fixture2]
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
const fadedUniverse = universeWithFixtures(fadedChannels, {
  ...fadedChannels,
  x: 127,
})
const doubleFadedUniverse = universeWithFixtures(doubleFadedChannels, {
  ...doubleFadedChannels,
  x: 63,
})

function mockDmxMaster(value: number) {
  handleDmxMasterApiMessage({ type: 'dmx-master', value })
}

describe('services/universe', () => {
  beforeEach(() => {
    universes.forEach(removeUniverse)
    initUniverse()
    jest.resetAllMocks()
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

    it('broadcasts changes', () => {
      const universe = universeWithFixtures({ m: 127 })
      addUniverse(universe)
      jest.resetAllMocks()
      removeUniverse(universe)
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 0)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures()
      addUniverse(universe)
      jest.resetAllMocks()
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
      expect(() => setUniverseChannel(universe, -1, 0)).toThrow()
      expect(() => setUniverseChannel(universe, 0, 0)).toThrow()
      expect(() => setUniverseChannel(universe, universeSize + 1, 0)).toThrow()
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
      jest.resetAllMocks()
      setUniverseState(universe, { masterValue: 127 })
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 63)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      jest.resetAllMocks()
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
      jest.resetAllMocks()
      overwriteUniverse(universe, universeWithFixtures({ m: 63, r: 255 }))
      expect(broadcastUniverseChannelToDevices).toHaveBeenCalledWith(1, 63)
      expect(broadcastUniverseChannelToApiClients).toHaveBeenCalledWith(1)
    })

    it('does not broadcast if nothing changed', () => {
      const universe = universeWithFixtures({ m: 127, r: 255 })
      addUniverse(universe)
      jest.resetAllMocks()
      overwriteUniverse(universe, universe)
      expect(broadcastUniverseChannelToDevices).not.toHaveBeenCalled()
      expect(broadcastUniverseChannelToApiClients).not.toHaveBeenCalled()
    })
  })
})
