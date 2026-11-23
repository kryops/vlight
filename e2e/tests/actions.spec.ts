import { ProgrammableButtonDownAction } from '@vlight/types'

import { test, expect, VLightApi } from '../src/fixtures'
import { App } from '../src/helpers/app'

/**
 * Applies each action type through a flash button, as this is how actions
 * are usually executed. Revertable actions are reverted on release.
 *
 * Editing actions is covered by the config, sequence and recording tests.
 */

async function addButton(api: VLightApi, action: ProgrammableButtonDownAction) {
  await api.send({
    type: 'add-entity',
    entity: 'buttons',
    entry: { id: 'test', label: 'Test Action', down: [action], up: [] },
  })
}

async function press(app: App) {
  await app.navigate('Global Controls')
  await app.button('Test Action').hover()
  await app.page.mouse.down()
}

async function release(app: App) {
  await app.page.mouse.up()
}

test('channels', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'channels',
    channels: { 20: 200 },
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 20: 200 })
  await release(app)
  await universe.expectChannels({ 20: 0 })
})

test('DMX master', async ({ api, app, universe }) => {
  await api.send({ type: 'fixture', id: 'dimmer', state: { on: true } })
  await addButton(api, { type: 'dmx-master', value: 0, revert: true })
  await press(app)
  await universe.expectChannels({ 1: 0 })
  await release(app)
  await universe.expectChannels({ 1: 255 })
})

test('global control: all off', async ({ api, app, universe }) => {
  await api.send({ type: 'fixture', id: 'dimmer', state: { on: true } })
  await api.send({ type: 'memory', id: '1', state: { on: true } })
  await addButton(api, { type: 'global', control: 'all-off' })
  await press(app)
  await universe.expectChannels({ 1: 0, 2: 0 })
  await release(app)
})

test('global control: pause', async ({ api, app }) => {
  await addButton(api, { type: 'global', control: 'toggle-pause' })
  await press(app)
  await expect(app.button('PAUSE', app.widget('Controls'))).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await release(app)
})

test('fixture', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'fixture',
    members: ['dimmer'],
    state: { on: true },
    partial: true,
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 1: 255 })
  await release(app)
  await universe.expectChannels({ 1: 0 })
})

test('fixture with fade', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'fixture',
    members: ['dimmer'],
    state: { on: true },
    partial: true,
    fade: 2,
  })
  await press(app)
  await universe.expectChannel(1, value => value > 0 && value < 255, 'fading')
  await universe.expectChannel(1, value => value === 255, 'faded in')
  await release(app)
})

test('fixture group', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'fixture-group',
    ids: ['1'],
    state: { on: true, channels: { m: 255, r: 0, g: 0, b: 255 } },
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255, 5: 255, 3: 0, 6: 255, 9: 255 })
  await release(app)
  await universe.expectChannels({ 2: 0, 6: 0 })
})

test('memory', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'memory',
    ids: ['1'],
    state: { on: true },
    partial: true,
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255, 3: 255 })
  await release(app)
  await universe.expectChannels({ 2: 0, 3: 0 })
})

test('live memory', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-memory',
    ids: ['1'],
    state: { on: true },
    partial: true,
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255, 3: 0, 4: 255 })
  await release(app)
  await universe.expectChannels({ 2: 0, 4: 0 })
})

test('live chase', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-chase',
    ids: ['1'],
    state: { on: true, stopped: false },
    partial: true,
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255, 6: 255 })
  await release(app)
  await universe.expectChannels({ 2: 0, 6: 0 })
})

test('live chase step', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-chase',
    ids: ['1'],
    state: { on: true },
    partial: true,
    step: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255, 6: 255 })
  await release(app)
})

test('live movement', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-movement',
    ids: ['1'],
    state: { on: true, stopped: false },
    partial: true,
    revert: true,
  })
  await press(app)
  const first = await universe.value(10)
  await universe.expectChannel(10, value => value !== first, 'pan moves')
  await release(app)
})

test('sequence', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'sequence',
    ids: ['1'],
    control: 'start',
    revert: true,
  })
  await press(app)
  await universe.expectChannels({ 2: 255 })
  // restores the previous (stopped) status
  await release(app)
  await universe.expectChannels({ 2: 0 })
})

test('button', async ({ api, app, universe }) => {
  // presses the seeded "Red Pars" flash button
  await addButton(api, { type: 'button', ids: ['1'], down: true })
  await press(app)
  await universe.expectChannels({ 2: 255 })
  await release(app)
})

test('named action', async ({ api, app, universe }) => {
  await addButton(api, { type: 'action', ids: ['1'] })
  await press(app)
  await universe.expectChannels({ 2: 255 })
  await release(app)
})

test('multiple actions are applied together', async ({
  api,
  app,
  universe,
}) => {
  await api.send({
    type: 'add-entity',
    entity: 'buttons',
    entry: {
      id: 'test',
      label: 'Test Action',
      down: [
        { type: 'channels', channels: { 20: 100 }, revert: true },
        {
          type: 'memory',
          ids: ['1'],
          state: { on: true },
          partial: true,
          revert: true,
        },
      ],
      up: [{ type: 'channels', channels: { 21: 50 } }],
    },
  })
  await press(app)
  await universe.expectChannels({ 20: 100, 2: 255, 21: 0 })
  await release(app)
  await universe.expectChannels({ 20: 0, 2: 0, 21: 50 })
})
