import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Global Controls')
})

test('DMX master scales the output', async ({ api, app, universe }) => {
  await api.send({ type: 'fixture', id: 'dimmer', state: { on: true } })
  await universe.expectChannels({ 1: 255 })

  const widget = app.widget('DMX Master')
  await app.button('OFF', widget).click()
  await universe.expectChannels({ 1: 0 })
  await app.fader('DMX Master', widget).expectValue(0)

  await app.fader('DMX Master', widget).dragTo(0.5)
  await universe.expectChannel(1, value => value > 50 && value < 200)

  await app.button('ON', widget).click()
  await universe.expectChannels({ 1: 255 })
})

test('DMX master fade time', async ({ app }) => {
  const fade = app.fader('Fade', app.widget('DMX Master'))
  await expect(fade.locator).toHaveAttribute('aria-valuetext', 'Instant')
  await fade.dragTo(0.5)
  await expect(fade.locator).toHaveAttribute('aria-valuetext', /s$/)
})

test('ALL OFF turns off all controls', async ({ api, app, universe }) => {
  const controls = app.widget('Controls')
  await expect(app.button('ALL OFF', controls)).toHaveAttribute(
    'aria-disabled',
    'true'
  )

  await api.send({ type: 'fixture', id: 'dimmer', state: { on: true } })
  await api.send({ type: 'memory', id: '1', state: { on: true } })
  await universe.expectChannels({ 1: 255, 2: 255 })

  await app.button('ALL OFF', controls).click()
  await universe.expectChannels({ 1: 0, 2: 0 })
})

test('PAUSE freezes running movements', async ({ app, universe }) => {
  await app.navigate('Chases')
  await app.button('Add movement').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Circle')
  await editor.selectMembers('Fixture', 'Moving Head')
  await editor.save()
  await app.fader('Speed', app.widget('Circle')).dragTo(1)
  await app.button('Start', app.widget('Circle')).click()
  const initial = await universe.value(10)
  await universe.expectChannel(10, value => value !== initial)

  await app.navigate('Global Controls')
  const controls = app.widget('Controls')
  await app.button('PAUSE', controls).click()
  await expect(app.button('PAUSE', controls)).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  // wait for the last update to arrive
  await universe.page.waitForTimeout(300)
  const paused = await universe.value(10)
  await universe.page.waitForTimeout(500)
  expect(await universe.value(10)).toBe(paused)

  await app.button('PAUSE', controls).click()
  await universe.expectChannel(10, value => value !== paused)
})

test('flash buttons are active while pressed', async ({ app, universe }) => {
  const button = app.button('Red Pars')
  await button.hover()
  await app.page.mouse.down()
  await universe.expectChannels({ 2: 255 })

  await app.page.mouse.up()
  await universe.expectChannels({ 2: 0 })
})

test('adding a button from the page', async ({ app, universe }) => {
  await app.button('Add button').click()
  const editor = app.entityEditor()
  await editor.fill('Label', 'Dimmer Toggle')
  await editor.select('Mode', 'Toggle: Press again to deactivate')
  await app.button('Add action', app.dialog).first().click()
  await app.dialog
    .getByRole('combobox', { name: 'Named action' })
    .first()
    .selectOption('Red Pars On')
  await editor.save()

  await app.button('Dimmer Toggle').click()
  await universe.expectChannels({ 2: 255 })
  await expect(app.button('Dimmer Toggle')).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})
