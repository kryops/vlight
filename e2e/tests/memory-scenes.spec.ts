import { MemoryScene } from '@vlight/types'

import { test, VLightApi } from '../src/fixtures'

/**
 * How memory scene states are distributed to the members.
 *
 * Seeded fixtures (`m` is the master channel):
 * - `dimmer`: channel 1 (m), x = 10
 * - `par_1`: channels 2-5 (m, r, g, b), x = 30
 * - `par_2`: channels 6-9 (m, r, g, b), x = 50
 */

const red = { on: true, channels: { m: 255, r: 255, g: 0, b: 0 } }
const blue = { on: true, channels: { m: 255, r: 0, g: 0, b: 255 } }

async function turnOnMemory(api: VLightApi, ...scenes: MemoryScene[]) {
  await api.send({
    type: 'add-entity',
    entity: 'memories',
    entry: { id: 'test', name: 'Test', scenes },
  })
  await api.send({ type: 'memory', id: 'test', state: { on: true } })
}

test('states are distributed in a row', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_1', 'par_2', 'dimmer'],
    states: [
      { on: true, channels: { m: 255, r: 255 } },
      { on: true, channels: { m: 100 } },
    ],
  })
  await universe.expectChannels({ 2: 255, 3: 255, 6: 255, 7: 255, 1: 100 })
})

test('alternate pattern', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_1', 'par_2', 'dimmer'],
    pattern: 'alternate',
    states: [
      { on: true, channels: { m: 255, r: 255 } },
      { on: true, channels: { m: 100, b: 255 } },
    ],
  })
  await universe.expectChannels({ 2: 255, 3: 255, 6: 100, 9: 255, 1: 255 })
})

test('member order', async ({ api, universe }) => {
  await turnOnMemory(api, { members: ['par_2', 'par_1'], states: [red, blue] })
  await universe.expectChannels({ 7: 255, 9: 0, 3: 0, 5: 255 })
})

test('ordering by x coordinate', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_2', 'par_1'],
    order: 'xcoord',
    states: [red, blue],
  })
  await universe.expectChannels({ 3: 255, 5: 0, 7: 0, 9: 255 })
})

test('gradients', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_1', 'dimmer', 'par_2'],
    states: [[{ channels: { m: 0 } }, { channels: { m: 200 } }]],
  })
  await universe.expectChannels({ 2: 0, 1: 100, 6: 200 })
})

test('gradients with color channels', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_1', 'par_2'],
    states: [[{ channels: red.channels }, { channels: blue.channels }]],
  })
  await universe.expectChannels({ 3: 255, 5: 0, 7: 0, 9: 255 })
})

test('mirrored gradients', async ({ api, universe }) => {
  await turnOnMemory(api, {
    members: ['par_1', 'dimmer', 'par_2'],
    states: [
      [{ channels: { m: 0 } }, { channels: { m: 200 }, mirrored: true }],
    ],
  })
  await universe.expectChannels({ 2: 0, 1: 200, 6: 0 })
})

test('multiple scenes', async ({ api, universe }) => {
  await turnOnMemory(
    api,
    { members: ['par_1'], states: [red] },
    { members: ['par_2'], states: [blue] }
  )
  await universe.expectChannels({ 2: 255, 3: 255, 5: 0, 6: 255, 7: 0, 9: 255 })
})
