import { test, expect } from '../src/fixtures'

/**
 * Faders switch to a local value while being used, which is dropped with a
 * delay after releasing them so the value from the server is displayed again.
 */

test.beforeEach(async ({ app }) => {
  await app.navigate('Channels')
})

test('displays changes from the server after being dragged', async ({
  api,
  app,
}) => {
  const fader = app.fader('Channel 1')
  await fader.dragTo(1)
  await fader.expectValue(255)

  // would be masked if the local value was not dropped
  await api.send({ type: 'channels', channels: { 1: 100 } })
  await fader.expectValue(100)
})

test('does not jump while being dragged', async ({ api, app, page }) => {
  const fader = app.fader('Channel 1')
  const box = (await fader.locator.boundingBox())!
  const x = box.x + box.width / 2

  await page.mouse.move(x, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(x, box.y - 10, { steps: 5 })
  await fader.expectValue(255)

  // a change from another client arrives while the fader is held
  await api.send({ type: 'channels', channels: { 1: 50 } })
  await page.waitForTimeout(200)
  await fader.expectValue(255)

  // after releasing, the server value is displayed
  await page.mouse.up()
  await fader.expectValue(50)
})

test('displays changes from the server after mouse wheel input', async ({
  api,
  app,
}) => {
  const fader = app.fader('Channel 1')
  await fader.wheel(1, 2)
  await expect.poll(() => fader.value()).toBeGreaterThan(0)

  await api.send({ type: 'channels', channels: { 1: 200 } })
  await fader.expectValue(200)
})

test('fixture faders display changes from the server after being dragged', async ({
  api,
  app,
}) => {
  await app.navigate('Fixtures')
  const fader = app.fader('M', app.widget('1 Dimmer'))
  await fader.dragTo(0)
  await fader.expectValue(0)

  await api.send({
    type: 'fixture',
    id: 'dimmer',
    state: { channels: { m: 180 } },
    merge: true,
  })
  await fader.expectValue(180)
})
