import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Map')
})

test('displays all fixtures', async ({ app }) => {
  for (const name of ['Dimmer', 'Par 1', 'Par 2', 'Moving Head']) {
    await expect(
      app.main.getByRole('button', { name, exact: true })
    ).toBeVisible()
  }
})

test('clicking a fixture opens its controls', async ({ app, universe }) => {
  await app.main.getByRole('button', { name: 'Dimmer', exact: true }).click()
  await expect(
    app.dialog.getByRole('region', { name: '1 Dimmer' })
  ).toBeVisible()
  await app.dialog
    .getByRole('button', { name: '1 Dimmer', exact: true })
    .click()
  await universe.expectChannels({ 1: 255 })
})

test('fixture test mode lights fixtures while pressed', async ({
  app,
  universe,
}) => {
  await app.button('Fixture Test Mode').click()
  const shape = app.main.getByRole('button', { name: 'Par 1', exact: true })
  await shape.hover()
  await app.page.mouse.down()
  await universe.expectChannel(2, value => value > 0)

  await app.page.mouse.up()
  await universe.expectChannels({ 2: 0 })
})

test('mini map can be toggled', async ({ app, page }) => {
  await app.navigate('Channels')
  await page.getByRole('button', { name: 'Toggle mini map' }).click()
  await expect(page.getByRole('img', { name: 'Par 1' })).toBeVisible()
  await page.getByRole('button', { name: 'Toggle mini map' }).click()
  await expect(page.getByRole('img', { name: 'Par 1' })).toBeHidden()
})
