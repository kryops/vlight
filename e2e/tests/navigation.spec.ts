import { test, expect } from '../src/fixtures'

const pages = [
  ['Map', 'Map'],
  ['Universe', 'Universe'],
  ['Global Controls', 'Global Controls'],
  ['Channels', 'Channels'],
  ['Fixtures', 'Fixtures'],
  ['Fixture Groups', 'Groups'],
  ['Memories', 'Memories'],
  ['Chases', 'Chases'],
  ['Sequences', 'Sequences'],
  ['Config', 'Config'],
  ['Show', 'Show'],
] as const

test('all pages are reachable via the navigation', async ({ app }) => {
  for (const [label, heading] of pages) {
    await app.navigate(label)
    await expect(app.heading, label).toHaveText(heading)
    await expect(
      app.navigation.getByRole('link', { name: label, exact: true })
    ).toHaveAttribute('aria-current', 'page')
  }
})

test('pages can be opened via hotkeys', async ({ app, page }) => {
  await page.keyboard.press('Shift+4')
  await expect(app.heading).toHaveText('Channels')
  await page.keyboard.press('Shift+2')
  await expect(app.heading).toHaveText('Universe')
})

test('deep links work after reload', async ({ app, page }) => {
  await app.open('/fixture-groups')
  await expect(app.heading).toHaveText('Groups')
  await page.reload()
  await expect(app.heading).toHaveText('Groups')
})

test('back arrow navigates back', async ({ app }) => {
  await app.navigate('Config')
  await app.main.getByRole('link', { name: 'Fixtures', exact: true }).click()
  await app.main.getByRole('link', { name: 'Back' }).click()
  await expect(app.heading).toHaveText('Config')
})

test('mobile layout shows the navigation on demand', async ({ app, page }) => {
  await page.setViewportSize({ width: 400, height: 800 })
  await page.reload()
  await expect(app.navigation).toBeHidden()

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await app.navigation
    .getByRole('link', { name: 'Memories', exact: true })
    .click()
  await expect(app.heading).toHaveText('Memories')
  await expect(app.navigation).toBeHidden()
})

test('state is synchronized between clients and survives reloads', async ({
  api,
  app,
  page,
  universe,
}) => {
  await app.navigate('Fixtures')
  await app.toggleWidget('1 Dimmer')
  await universe.expectChannels({ 1: 255 })

  await page.reload()
  await universe.page.reload()
  await universe.expectChannels({ 1: 255 })

  // changes from other clients are pushed
  await api.send({ type: 'fixture', id: 'dimmer', state: { on: false } })
  await universe.expectChannels({ 1: 0 })
})
