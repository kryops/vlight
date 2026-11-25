import { ProgrammableButtonDownAction } from '@vlight/types'

import { test, VLightApi } from '../src/fixtures'
import { App } from '../src/helpers/app'
import { Universe } from '../src/helpers/universe'

/**
 * Fading of actions. The fade times are long enough to reliably observe
 * intermediate values.
 */

const fade = 2

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

/** Waits until the channel fades from 0 to the target value. */
async function expectFadeIn(universe: Universe, channel: number, to = 255) {
  await universe.expectChannel(channel, v => v > 0 && v < to, 'fading in')
  await universe.expectChannel(channel, v => v === to, 'faded in')
}

/** Waits until the channel fades from its current value to 0. */
async function expectFadeOut(universe: Universe, channel: number, from = 255) {
  await universe.expectChannel(channel, v => v > 0 && v < from, 'fading out')
  await universe.expectChannel(channel, v => v === 0, 'faded out')
}

test('channels', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'channels',
    channels: { 20: 200 },
    revert: true,
    fade,
  })
  await press(app)
  await expectFadeIn(universe, 20, 200)
  await release(app)
  // the revert fade defaults to the fade time
  await expectFadeOut(universe, 20, 200)
})

test('separate revert fade time', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'channels',
    channels: { 20: 200 },
    revert: true,
    revertFade: fade,
  })
  await press(app)
  await universe.expectChannels({ 20: 200 })
  await release(app)
  await expectFadeOut(universe, 20, 200)
})

test('fixture group', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'fixture-group',
    ids: ['1'],
    state: { on: true, channels: { m: 255, r: 0, g: 0, b: 255 } },
    revert: true,
    fade,
  })
  await press(app)
  // when turning on, only the master is faded
  await expectFadeIn(universe, 2)
  await release(app)
  await expectFadeOut(universe, 2)
})

test('fixture group color change', async ({ api, app, universe }) => {
  await api.send({
    type: 'fixture-group',
    id: '1',
    state: { on: true, channels: { m: 255, r: 255, g: 0, b: 0 } },
  })
  await universe.expectChannels({ 2: 255, 3: 255, 5: 0 })
  await addButton(api, {
    type: 'fixture-group',
    ids: ['1'],
    state: { channels: { r: 0, b: 255 } },
    partial: true,
    revert: true,
    fade,
  })
  await press(app)
  await expectFadeIn(universe, 5)
  await universe.expectChannels({ 2: 255, 3: 0 })
  await release(app)
  await expectFadeOut(universe, 5)
  await universe.expectChannels({ 3: 255 })
})

test('memory', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'memory',
    ids: ['1'],
    state: { on: true },
    partial: true,
    revert: true,
    fade,
  })
  await press(app)
  await expectFadeIn(universe, 2)
  await release(app)
  await expectFadeOut(universe, 2)
})

async function setMemoryFadeTime(app: App, name: string) {
  await app.navigate('Memories')
  await app.button('Edit memory', app.widget(name)).click()
  const editor = app.entityEditor()
  await editor.fill('Fade time (s)', String(fade))
  await editor.save()
}

test('memory fade button', async ({ app, universe }) => {
  await setMemoryFadeTime(app, 'Red Pars')
  const widget = app.widget('Red Pars')

  await app.button('Fade in', widget).click()
  await expectFadeIn(universe, 2)

  await app.button('Fade out', widget).click()
  await expectFadeOut(universe, 2)
})

test('memory fade button with the master at 0', async ({
  api,
  app,
  universe,
}) => {
  await api.send({ type: 'memory', id: '1', state: { on: true, value: 0 } })
  await setMemoryFadeTime(app, 'Red Pars')
  await universe.expectChannels({ 2: 0 })

  // fades in the master to full
  await app.button('Fade in', app.widget('Red Pars')).click()
  await expectFadeIn(universe, 2)
})

test('live memory', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-memory',
    ids: ['1'],
    state: { on: true },
    partial: true,
    revert: true,
    fade,
  })
  await press(app)
  await expectFadeIn(universe, 2)
  await release(app)
  await expectFadeOut(universe, 2)
})

test('live chase', async ({ api, app, universe }) => {
  await addButton(api, {
    type: 'live-chase',
    ids: ['1'],
    state: { on: true, stopped: false },
    partial: true,
    revert: true,
    fade,
  })
  await press(app)
  // the master channel stays at 255 for all chase colors
  await expectFadeIn(universe, 2)
  await release(app)
  await expectFadeOut(universe, 2)
})

test('sequence steps', async ({ api, universe }) => {
  await api.send({
    type: 'add-entity',
    entity: 'sequences',
    entry: {
      id: 'test',
      steps: [
        {
          delay: 0,
          actions: [{ type: 'channels', channels: { 20: 200 }, fade }],
        },
      ],
    },
  })
  await api.send({ type: 'sequence', id: 'test', control: 'start' })
  await expectFadeIn(universe, 20, 200)
})

test('fade time in the action editor', async ({ api, app, universe }) => {
  await app.openEntityConfig('Actions')
  await app.entityEntry('Red Pars On').click()
  const editor = app.entityEditor()
  await app.dialog.getByRole('spinbutton', { name: /^Fade/ }).fill(String(fade))
  await editor.save()

  await api.send({ type: 'actions', actions: [{ type: 'action', ids: ['1'] }] })
  await expectFadeIn(universe, 2)
})

test('recording fade time', async ({ app, page, universe }) => {
  await app.navigate('Fixtures')
  await page
    .getByRole('button', { name: 'Toggle action recording bar' })
    .click()
  await page.getByRole('button', { name: 'Record', exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Fade' }).fill(String(fade))
  await app.toggleWidget('1 Dimmer')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expectFadeIn(universe, 1)
})
