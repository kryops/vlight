import { test, expect } from '../src/fixtures'

test('live memory with fixture segments', async ({ app, universe }) => {
  await app.navigate('Memories')
  await app.button('Add live memory').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Split')
  await editor.selectMembers('Fixture', 'Bar')
  await editor.toggle('Selection')
  await editor.toggle('Split into segments')
  await expect(app.button('Merge segments', app.dialog)).toBeVisible()
  await editor.save()

  const widget = app.widget('Split')
  await app.toggleWidget('Split')
  await universe.expectChannels({ 40: 255, 42: 255, 45: 255, 48: 255 })

  // the second state only applies to the last segment
  await app.button('Add state', widget).click()
  await app.button('State 2', widget).click()
  await app.button('Color picker', app.dialog).click()
  await app.fader('G', app.dialog).dragTo(0)
  await app.fader('B', app.dialog).dragTo(0)
  await app.button('Ok', app.dialog).click()
  await universe.expectChannels({ 42: 255, 45: 255, 47: 255, 48: 0, 49: 0 })

  // merging the segments applies the first state to the whole fixture
  await app.button('Edit', widget).click()
  await app.button('Merge segments', app.dialog).click()
  await app.button('Ok', app.dialog).click()
  await universe.expectChannels({ 42: 255, 45: 255, 48: 255 })
})

test('channel faders display the segment', async ({ app }) => {
  await app.navigate('Channels')
  await expect(
    app.page.getByRole('slider', { name: 'Channel 47', exact: true })
  ).toBeVisible()
  await expect(app.main.getByText('R3', { exact: true })).toBeVisible()
})
