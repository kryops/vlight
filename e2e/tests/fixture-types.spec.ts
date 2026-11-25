import { FixtureType, Memory } from '@vlight/types'

import { test, expect, VLightApi } from '../src/fixtures'
import { App } from '../src/helpers/app'

/**
 * Fixture type features.
 *
 * Mostly uses the master-less `mover` fixture (channels 30-32: pan, r, g).
 */

async function updateFixtureType(
  api: VLightApi,
  fixtureType: FixtureType
): Promise<void> {
  await api.send({
    type: 'update-entity',
    entity: 'fixtureTypes',
    entry: fixtureType,
  })
}

/** Overrides the master-less `mover` fixture type (channels 30-32: pan, r, g). */
async function updateMoverType(
  api: VLightApi,
  override: Partial<FixtureType>
): Promise<void> {
  await updateFixtureType(api, {
    id: 'mover',
    name: 'Mover (no master)',
    mapping: ['pan', 'r', 'g'],
    ...override,
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

test.describe('master-dependent channels', () => {
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

    await api.send({
      type: 'memory',
      id: 'mover',
      state: { on: true, value: 0 },
    })
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

    await api.send({
      type: 'memory',
      id: 'mover',
      state: { on: true, value: 0 },
    })
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
})

/**
 * Gives the `mover` and `movinghead` fixture types a `gobo` channel
 * with different state tables.
 */
async function setUpGoboFixtures(api: VLightApi): Promise<void> {
  await updateMoverType(api, {
    mapping: ['pan', 'gobo', 'g'],
    channelStates: {
      gobo: [
        { value: 0, name: 'Open' },
        { value: 10, name: 'Star' },
        { value: 20, name: 'Dots' },
      ],
    },
  })
  await updateFixtureType(api, {
    id: 'movinghead',
    name: 'Moving Head',
    mapping: ['pan', 'tilt', 'm', 'gobo', 'g', 'b'],
    channelStates: {
      gobo: [
        { value: 0, name: 'Open' },
        { value: 10, name: 'Ring' },
      ],
    },
  })
}

/** Expects the displayed state name of a widget's GOBO fader. */
async function expectGoboState(
  app: App,
  widgetTitle: string,
  state: string
): Promise<void> {
  await expect(
    app.fader('GOBO', app.widget(widgetTitle)).locator
  ).toHaveAttribute('aria-valuetext', state)
}

test.describe('channel states', () => {
  test('fixture fader displays the current state', async ({ api, app }) => {
    await setUpGoboFixtures(api)
    await app.navigate('Fixtures')
    await expectGoboState(app, '30 Mover', 'Open')

    await api.send({
      type: 'fixture',
      id: 'mover',
      state: { on: true, channels: { gobo: 15 } },
    })
    await expectGoboState(app, '30 Mover', 'Star')

    await api.send({
      type: 'fixture',
      id: 'mover',
      state: { on: true, channels: { gobo: 255 } },
    })
    await expectGoboState(app, '30 Mover', 'Dots')
  })

  test('group fader displays common or mixed states', async ({ api, app }) => {
    await setUpGoboFixtures(api)
    await api.send({
      type: 'add-entity',
      entity: 'fixtureGroups',
      entry: { id: 'movers', name: 'Movers', fixtures: ['mover', 'mh'] },
    })
    await app.navigate('Fixture Groups')
    await expectGoboState(app, 'Movers', 'Open')

    await api.send({
      type: 'fixture-group',
      id: 'movers',
      state: { on: true, channels: { gobo: 15 } },
    })
    await expectGoboState(app, 'Movers', '(mixed)')
    await expect(
      app.widget('Movers').getByTitle('Star / Ring', { exact: true })
    ).toBeVisible()
  })

  test('editing the states of a fixture type', async ({ app }) => {
    await app.openEntityConfig('Fixture Types')
    await app.entityEntry('Mover (no master)').click()
    let editor = app.entityEditor()
    await editor.fill('Mapping', 'pan, gobo, g')
    await editor.select('Add channel states', 'gobo')
    await editor.fill('States for channel gobo', '20 Dots\n0 Open\n10-19 Star')
    await editor.save()

    await app.entityEntry('Mover (no master)').click()
    editor = app.entityEditor()
    await expect(app.dialog.getByLabel('States for channel gobo')).toHaveValue(
      '0 Open\n10 Star\n20 Dots'
    )
    await editor.cancel()

    await app.navigate('Fixtures')
    await expectGoboState(app, '30 Mover', 'Open')
  })
})
