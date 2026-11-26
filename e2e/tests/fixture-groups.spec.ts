import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Fixture Groups')
})

test('turning a group on controls all members', async ({ app, universe }) => {
  await app.toggleWidget('Pars')
  await universe.expectChannels({ 2: 255, 6: 255, 1: 0, 12: 0 })

  await app.fader('M', app.widget('Pars')).dragTo(0)
  await universe.expectChannels({ 2: 0, 6: 0 })

  await app.toggleWidget('Pars')
})

test('group colors apply to all members', async ({ app, universe }) => {
  const widget = app.widget('Pars')
  await app.toggleWidget('Pars')
  await app.button('Color picker', widget).click()
  await app.fader('R', widget).dragTo(0)

  await universe.expectChannels({ 3: 0, 7: 0, 4: 255, 8: 255 })
})

test('editing a group from its widget', async ({ app }) => {
  await app.button('Edit group', app.widget('Pars')).click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'All Pars')
  await editor.save()

  await expect(app.widget('All Pars')).toBeVisible()
})

test('adding a group from the page', async ({ app }) => {
  await app.button('Add fixture group').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Dimmers')
  await editor.selectMembers('Type', 'Dimmer [1]')
  await editor.save()

  await expect(app.widget('Dimmers')).toBeVisible()
})

test('search filters groups by name', async ({ app }) => {
  await app.search('pa')
  await expect(app.widget('Pars')).toBeVisible()

  await app.search('movers')
  await expect(app.widget('Pars')).toBeHidden()
  await expect(app.main).toContainText('No matches')

  await app.button('Clear search').click()
  await expect(app.searchInput).toBeHidden()
  await expect(app.widget('Pars')).toBeVisible()
})
