import { test, expect } from '../src/fixtures'

test('light mode can be toggled', async ({ app, page }) => {
  const isLight = () =>
    page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor.replace(/\s/g, '')
    )
  const before = await isLight()

  await page.getByRole('button', { name: 'Toggle light mode' }).click()
  await expect.poll(isLight).not.toBe(before)

  // persisted locally
  await page.reload()
  await expect.poll(isLight).not.toBe(before)

  await app.navigate('Config')
  await app.main.getByRole('link', { name: 'Settings', exact: true }).click()
  await app.main.getByRole('button', { name: /^Light Mode/ }).click()
  await expect.poll(isLight).toBe(before)
})

test('reset state turns everything off', async ({ api, app, universe }) => {
  await api.send({ type: 'fixture', id: 'dimmer', state: { on: true } })
  await api.send({ type: 'channels', channels: { 20: 100 } })
  await universe.expectChannels({ 1: 255, 20: 100 })

  await app.navigate('Config')
  await app.main.getByRole('link', { name: 'Settings', exact: true }).click()
  await app.button('Reset state').click()
  await app.confirm()
  await universe.expectChannels({ 1: 0, 20: 0 })
})
