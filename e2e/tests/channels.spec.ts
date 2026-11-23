import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Channels')
})

test('dragging a channel fader changes the DMX universe', async ({
  app,
  universe,
}) => {
  const fader = app.fader('Channel 1')
  await fader.expectValue(0)

  await fader.dragTo(1)
  await fader.expectValue(255)
  await universe.expectChannels({ 1: 255, 2: 0 })

  await fader.dragTo(0)
  await fader.expectValue(0)
  await universe.expectChannels({ 1: 0 })
})

test('faders display the channel mapping and fixture names', async ({
  app,
}) => {
  await expect(app.fader('Channel 1').locator).toContainText('Dimmer')
  await expect(app.fader('Channel 3').locator).toContainText('R')
  await expect(app.fader('Channel 10').locator).toContainText('Moving Head')
  await expect(app.fader('Channel 10').locator).toContainText('PAN')
})

test('mouse wheel with modifier key changes the value', async ({
  app,
  universe,
}) => {
  const fader = app.fader('Channel 2')
  await fader.wheel(1, 3)
  await expect.poll(() => fader.value()).toBeGreaterThan(0)
  const value = await fader.value()
  await universe.expectChannels({ 2: value })

  await fader.wheel(-1, 1)
  await expect.poll(() => fader.value()).toBeLessThan(value)
})

test('all on / all off', async ({ app, universe }) => {
  await app.button('ON').click()
  await universe.expectChannels({ 1: 255, 9: 255, 512: 255 })

  await app.button('OFF').click()
  await universe.expectChannels({ 1: 0, 9: 0, 512: 0 })
  await expect(app.button('OFF')).toHaveAttribute('aria-disabled', 'true')
})

test('channel values set via the API are displayed', async ({ api, app }) => {
  await api.send({ type: 'channels', channels: { 3: 128 } })

  await expect(app.fader('Channel 3').locator).toHaveAttribute(
    'aria-valuenow',
    '128'
  )
  await app.navigate('Universe')
  await expect(app.channelMeter(3)).toHaveAttribute('aria-valuenow', '128')
})
