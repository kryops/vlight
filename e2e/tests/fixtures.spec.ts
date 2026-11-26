import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Fixtures')
})

test('turning a fixture on and off via its title', async ({
  app,
  universe,
}) => {
  await app.toggleWidget('1 Dimmer')
  await universe.expectChannels({ 1: 255 })

  await app.toggleWidget('1 Dimmer')
  await universe.expectChannels({ 1: 0 })
})

test('master fader dims a turned on fixture', async ({ app, universe }) => {
  await app.toggleWidget('1 Dimmer')
  await app.fader('M', app.widget('1 Dimmer')).dragTo(0)
  await universe.expectChannels({ 1: 0 })

  await app.fader('M', app.widget('1 Dimmer')).dragTo(0.5)
  await universe.expectChannel(1, value => value > 50 && value < 200)
})

test('color faders control the color channels', async ({ app, universe }) => {
  const widget = app.widget('2 Par 1')
  await app.toggleWidget('2 Par 1')
  await app.button('Color picker', widget).click()

  await app.fader('G', widget).dragTo(0)
  await app.fader('B', widget).dragTo(0)
  await universe.expectChannels({ 2: 255, 3: 255, 4: 0, 5: 0 })
  // the other par is untouched
  await universe.expectChannels({ 6: 0, 7: 0 })
})

test('all on / all off', async ({ app, universe }) => {
  await app.button('ON').click()
  await universe.expectChannels({ 1: 255, 2: 255, 6: 255, 12: 255 })

  await app.button('OFF').click()
  await universe.expectChannels({ 1: 0, 2: 0, 6: 0, 12: 0 })
})

test('multi control changes several fixtures at once', async ({
  app,
  universe,
}) => {
  await app.button('Multi Control').click()
  await app.button('Par 1').click()
  await app.button('Par 2').click()

  await expect(app.widget('2 Fixtures')).toBeVisible()
  await app.toggleWidget('2 Fixtures')
  await universe.expectChannels({ 2: 255, 6: 255, 1: 0 })
})

test('position picker controls pan and tilt of the moving head', async ({
  app,
  universe,
}) => {
  const widget = app.widget('10 Moving Head')
  await app.toggleWidget('10 Moving Head')
  await app.button('Position picker', widget).click()

  await app.fader('PAN', widget).dragTo(1)
  await app.fader('TILT', widget).dragTo(0)
  await universe.expectChannels({ 10: 255, 11: 0 })
})

test('search filters fixtures by name', async ({ app }) => {
  await app.search('par')
  await expect(app.widget('2 Par 1')).toBeVisible()
  await expect(app.widget('6 Par 2')).toBeVisible()
  await expect(app.widget('1 Dimmer')).toBeHidden()

  // all terms must match, case-insensitive
  await app.search('PAR 1')
  await expect(app.widget('2 Par 1')).toBeVisible()
  await expect(app.widget('6 Par 2')).toBeHidden()

  await app.search('nothing')
  await expect(app.main).toContainText('No matches')

  // Escape clears and closes the search
  await app.searchInput.press('Escape')
  await expect(app.searchInput).toBeHidden()
  await expect(app.widget('1 Dimmer')).toBeVisible()
  await expect(app.widget('2 Par 1')).toBeVisible()
})

test('search can be opened with Ctrl+F and does not trigger hotkeys', async ({
  app,
  page,
  universe,
}) => {
  await page.keyboard.press('ControlOrMeta+f')
  await expect(app.searchInput).toBeFocused()

  // "o" would turn all fixtures on, "1" would select a widget
  await page.keyboard.type('mo1')
  await expect(app.searchInput).toHaveValue('mo1')
  await universe.expectChannels({ 1: 0, 2: 0 })
  await expect(app.main).toContainText('No matches')
})

test('number hotkeys address the filtered fixtures', async ({
  app,
  page,
  universe,
}) => {
  await app.search('par')
  // blurring keeps the search open as long as it has a query
  await app.heading.click()
  await expect(app.searchInput).toHaveValue('par')

  await page.keyboard.press('2')
  await page.keyboard.press('Space')
  await universe.expectChannels({ 6: 255, 2: 0, 1: 0 })
})
