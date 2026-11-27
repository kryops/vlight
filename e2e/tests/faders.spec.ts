import { Page } from '@playwright/test'

import { test, expect } from '../src/fixtures'
import { App } from '../src/helpers/app'

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

/**
 * Keyboard input moves the faders of the selected widget at a constant speed
 * (full range in 3s, 4x faster with Shift).
 */
test.describe('keyboard input', () => {
  test.beforeEach(async ({ app }) => {
    await app.navigate('Global Controls')
  })

  /**
   * Selects the DMX master widget, then freezes the clock so that the movement
   * only depends on `page.clock.runFor()`, not on the timing of the test machine.
   */
  async function selectDmxMaster(app: App, page: Page) {
    const fader = app.fader('DMX Master', app.widget('DMX Master'))
    await fader.expectValue(255)
    await page.keyboard.press('1')
    await expect(fader.locator).toHaveAttribute('aria-keyshortcuts', 'Q A')
    await page.clock.install()
    await page.clock.pauseAt(Date.now() + 1000)
    return fader
  }

  test('moves the fader while the key is held', async ({ app, page }) => {
    const fader = await selectDmxMaster(app, page)

    // 1.5s = half the range
    await page.keyboard.down('a')
    await page.clock.runFor(1500)
    await page.keyboard.up('a')
    await expect.poll(() => fader.value()).toBeLessThan(135)
    await expect.poll(() => fader.value()).toBeGreaterThan(120)

    // stops when the key is released
    const value = await fader.value()
    await page.clock.runFor(1000)
    await fader.expectValue(value)

    // Shift: 4x faster (0.5s for the remaining half), also does not navigate (Shift+Q)
    await page.keyboard.down('Shift')
    await page.keyboard.down('q')
    await page.clock.runFor(500)
    await page.keyboard.up('q')
    await page.keyboard.up('Shift')
    await fader.expectValue(255)
    await expect(app.heading).toHaveText('Global Controls')
  })

  test('is only active while the widget is selected', async ({ app, page }) => {
    const fader = app.fader('DMX Master', app.widget('DMX Master'))
    await fader.expectValue(255)
    await expect(fader.locator).not.toHaveAttribute('aria-keyshortcuts')
    await page.clock.install()
    await page.clock.pauseAt(Date.now() + 1000)

    await page.keyboard.down('a')
    await page.clock.runFor(1000)
    await page.keyboard.up('a')
    await page.clock.runFor(500)
    await fader.expectValue(255)
  })

  test('stops when the window loses focus', async ({ app, page }) => {
    const fader = await selectDmxMaster(app, page)

    await page.keyboard.down('a')
    await page.clock.runFor(500)
    await page.evaluate(() => window.dispatchEvent(new Event('blur')))
    await expect.poll(() => fader.value()).toBeLessThan(255)
    const value = await fader.value()

    await page.clock.runFor(1500)
    await page.keyboard.up('a')
    await fader.expectValue(value)
  })

  test('live chase light fader only in single value mode', async ({
    app,
    page,
  }) => {
    await app.navigate('Chases')
    const widget = app.widget('Red/Blue Chase')
    const light = widget.locator('[aria-keyshortcuts="R F"]')
    await expect(app.fader('Value', widget).locator).toBeVisible()
    await page.keyboard.press('1')
    await expect(light).toHaveCount(1)

    // multiple values
    await app.button('Single value', widget).click()
    await expect(light).toHaveCount(0)
  })
})
