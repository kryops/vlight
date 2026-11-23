import { test, expect } from '../src/fixtures'

test('dragging a channel fader changes the DMX universe', async ({ app }) => {
  await app.navigate('Channels')
  const fader = app.fader('Channel 1')
  await fader.expectValue(0)

  await fader.dragTo(1)
  await fader.expectValue(255)

  await app.navigate('Universe')
  await expect(app.channelMeter(1)).toHaveAttribute('aria-valuenow', '255')
  await expect(app.channelMeter(2)).toHaveAttribute('aria-valuenow', '0')
})

test('channel values set via the API are displayed', async ({ api, app }) => {
  await api.send({ type: 'channels', channels: { 3: 128 } })

  await app.navigate('Universe')
  await expect(app.channelMeter(3)).toHaveAttribute('aria-valuenow', '128')
})
