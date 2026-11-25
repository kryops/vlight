import { FixtureType, Memory } from '@vlight/types'

import { test, VLightApi } from '../src/fixtures'

/**
 * Which channels of fixtures without a master channel depend on the (virtual) master.
 *
 * Uses the master-less `mover` fixture (channels 30-32: pan, r, g).
 */

/** Overrides the master-less `mover` fixture type (channels 30-32: pan, r, g). */
async function updateMoverType(
  api: VLightApi,
  override: Partial<FixtureType>
): Promise<void> {
  const fixtureType: FixtureType = {
    id: 'mover',
    name: 'Mover (no master)',
    mapping: ['pan', 'r', 'g'],
    ...override,
  }
  await api.send({
    type: 'update-entity',
    entity: 'fixtureTypes',
    entry: fixtureType,
  })
}

async function addMemory(
  api: VLightApi,
  channels: Record<string, number>
): Promise<void> {
  const memory: Memory = {
    id: 'mover',
    name: 'Mover Memory',
    scenes: [{ members: ['mover'], states: [{ on: true, channels }] }],
  }
  await api.send({ type: 'add-entity', entity: 'memories', entry: memory })
}

test('virtual master and DMX master only dim master-dependent channels', async ({
  api,
  universe,
}) => {
  await api.send({
    type: 'fixture',
    id: 'mover',
    state: { on: true, channels: { m: 0, pan: 100, r: 255 } },
  })
  await universe.expectChannels({ 30: 100, 31: 0 })

  await api.send({
    type: 'fixture',
    id: 'mover',
    state: { on: true, channels: { m: 255, pan: 100, r: 255 } },
  })
  await universe.expectChannels({ 30: 100, 31: 255 })

  await api.send({ type: 'dmx-master', value: 0 })
  await universe.expectChannels({ 30: 100, 31: 0 })
})

test('memory value only dims master-dependent channels', async ({
  api,
  universe,
}) => {
  await addMemory(api, { m: 255, pan: 100, r: 255 })

  await api.send({ type: 'memory', id: 'mover', state: { on: true } })
  await universe.expectChannels({ 30: 100, 31: 255 })

  await api.send({ type: 'memory', id: 'mover', state: { on: true, value: 0 } })
  await universe.expectChannels({ 30: 100, 31: 0 })
})

test('memory value with forceMaster dims all channels', async ({
  api,
  universe,
}) => {
  // no master channel in the memory -> forceMaster
  await addMemory(api, { pan: 100, r: 255 })

  await api.send({ type: 'memory', id: 'mover', state: { on: true } })
  await universe.expectChannels({ 30: 100, 31: 255 })

  await api.send({ type: 'memory', id: 'mover', state: { on: true, value: 0 } })
  await universe.expectChannels({ 30: 0, 31: 0 })
})

test('configured master-dependent channels', async ({ api, universe }) => {
  await updateMoverType(api, { masterDependentChannels: ['pan', 'r'] })

  await api.send({
    type: 'fixture',
    id: 'mover',
    state: { on: true, channels: { m: 255, pan: 100, r: 255, g: 255 } },
  })
  await universe.expectChannels({ 30: 100, 31: 255, 32: 255 })

  await api.send({ type: 'dmx-master', value: 0 })
  await universe.expectChannels({ 30: 0, 31: 0, 32: 255 })
})

test('no master-dependent channels', async ({ api, universe }) => {
  await updateMoverType(api, { masterDependentChannels: [] })

  await api.send({
    type: 'fixture',
    id: 'mover',
    state: { on: true, channels: { m: 0, pan: 100, r: 255 } },
  })
  await universe.expectChannels({ 30: 100, 31: 255 })

  await api.send({ type: 'dmx-master', value: 0 })
  await universe.expectChannels({ 30: 100, 31: 255 })
})

test('all channels depend on the master without color channels', async ({
  api,
  universe,
}) => {
  await updateMoverType(api, { mapping: ['int', 'x'] })

  await api.send({
    type: 'fixture',
    id: 'mover',
    state: { on: true, channels: { m: 255, int: 255, x: 100 } },
  })
  await universe.expectChannels({ 30: 255, 31: 100 })

  await api.send({ type: 'dmx-master', value: 0 })
  await universe.expectChannels({ 30: 0, 31: 0 })
})
