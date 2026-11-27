import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Memories')
})

test('turning a memory on and off', async ({ app, universe }) => {
  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 2: 255, 3: 255, 4: 0, 6: 255, 7: 255 })

  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 2: 0, 3: 0, 6: 0 })
})

test('memory fader controls the intensity', async ({ app, universe }) => {
  const widget = app.widget('Red Pars')
  await app.toggleWidget('Red Pars')
  await app.fader('Value', widget).dragTo(0)
  await universe.expectChannels({ 2: 0, 6: 0 })

  await app.fader('Value', widget).dragTo(1)
  await universe.expectChannels({ 2: 255, 6: 255 })
})

test('all on / all off', async ({ app, universe }) => {
  await app.button('ON').click()
  await universe.expectChannels({ 2: 255 })

  await app.button('OFF').click()
  await universe.expectChannels({ 2: 0 })
})

test('instant on/off button', async ({ app, universe }) => {
  const button = app.button('Instant on/off', app.widget('Red Pars'))
  await button.hover()
  await app.page.mouse.down()
  await universe.expectChannels({ 2: 255 })
  await app.page.mouse.up()
  await universe.expectChannels({ 2: 0 })
})

test('editing a memory from its widget', async ({ app, universe }) => {
  await app.button('Edit memory', app.widget('Red Pars')).click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Pars')
  await editor.save()

  await expect(app.widget('Pars')).toBeVisible()
  await app.toggleWidget('Pars')
  await universe.expectChannels({ 2: 255, 3: 255 })
})

test('creating a memory from a fixture state', async ({ app, universe }) => {
  await app.navigate('Fixtures')
  const widget = app.widget('1 Dimmer')
  await app.toggleWidget('1 Dimmer')
  await app.button('Save into Memory', widget).click()
  await app.dialog.getByLabel('Name').fill('Dimmer Memory')
  await app.button('Ok', app.dialog).click()
  await expect(app.dialog).toBeHidden()
  await app.toggleWidget('1 Dimmer')
  await universe.expectChannels({ 1: 0 })

  await app.navigate('Memories')
  await app.toggleWidget('Dimmer Memory')
  await universe.expectChannels({ 1: 255 })
})

test('live memories', async ({ app, universe }) => {
  await app.button('Add live memory').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Live')
  await editor.selectMembers('Group', /^Pars/)
  await editor.save()

  const widget = app.widget('Live')
  await expect(widget).toBeVisible()
  await app.toggleWidget('Live')
  await universe.expectChannel(2, value => value > 0)

  await app.fader('Value', widget).dragTo(0)
  await universe.expectChannels({ 2: 0, 6: 0 })

  await app.button('Delete', widget).click()
  await app.confirm()
  await expect(widget).toBeHidden()
})

test('live memories can override other controls', async ({ app, universe }) => {
  // red memory and green live memory on the same pars
  await app.toggleWidget('Red Pars')
  await app.toggleWidget('Green Pars')
  await universe.expectChannels({ 3: 255, 4: 255, 7: 255, 8: 255 })

  const widget = app.widget('Green Pars')
  await widget.getByRole('checkbox', { name: 'Override' }).click()
  await universe.expectChannels({ 2: 255, 3: 0, 4: 255, 7: 0, 8: 255 })

  // the overriding live memory's value crossfades to the other controls
  await app.fader('Value', widget).dragTo(0)
  await universe.expectChannels({ 2: 255, 3: 255, 4: 0, 7: 255, 8: 0 })
  await app.fader('Value', widget).dragTo(1)
  await universe.expectChannels({ 3: 0, 4: 255 })

  await widget.getByRole('checkbox', { name: 'Override' }).click()
  await universe.expectChannels({ 3: 255, 4: 255, 7: 255, 8: 255 })
})

test('editing the scene states of a memory', async ({ app, universe }) => {
  await app.button('Edit memory', app.widget('Red Pars')).click()
  const dialog = app.dialog

  // make the first state green
  await app.button('State 1', dialog).click()
  const stateEditor = app.page.getByRole('dialog').last()
  await expect(
    stateEditor.getByRole('heading', { name: 'Edit Memory Scene State' })
  ).toBeVisible()
  await app.button('Color picker', stateEditor).click()
  await app.fader('R', stateEditor).dragTo(0)
  await app.fader('G', stateEditor).dragTo(1)
  await app.button('Ok', stateEditor).click()

  // add a second state and make it blue
  await app.button('Add state', dialog).click()
  await app.button('State 2', dialog).click()
  await app.button('Color picker', stateEditor).click()
  await app.fader('R', stateEditor).dragTo(0)
  await app.fader('G', stateEditor).dragTo(0)
  await app.fader('B', stateEditor).dragTo(1)
  await app.button('Ok', stateEditor).click()
  await expect(
    stateEditor.getByRole('heading', { name: 'Edit Memory Scene State' })
  ).toBeHidden()

  await app.entityEditor().save()

  // Par 1 gets the first state, Par 2 the second one
  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 3: 0, 4: 255, 5: 0, 7: 0, 8: 0, 9: 255 })
})

test('editing a live memory', async ({ app, universe }) => {
  const widget = app.widget('Green Pars')
  await app.toggleWidget('Green Pars')
  await universe.expectChannels({ 2: 255, 4: 255, 6: 255 })

  // changes are applied right away
  await app.button('State 1', widget).click()
  await app.button('Color picker', app.dialog).click()
  await app.fader('B', app.dialog).dragTo(1)
  await app.button('Ok', app.dialog).click()
  await universe.expectChannels({ 4: 255, 5: 255 })

  await app.button('Add state', widget).click()
  await app.button('State 2', widget).click()
  await app.button('Color picker', app.dialog).click()
  await app.fader('G', app.dialog).dragTo(0)
  await app.fader('B', app.dialog).dragTo(0)
  await app.button('Ok', app.dialog).click()
  await universe.expectChannels({ 4: 255, 8: 0 })

  await widget
    .getByRole('combobox', { name: 'Pattern' })
    .selectOption('Alternating')

  await app.button('Remove state', widget).last().click()
  await universe.expectChannels({ 4: 255, 8: 255 })

  // members
  await app.button('Edit', widget).click()
  await app.button('Remove', app.dialog).click()
  await app.button('Fixture', app.dialog).click()
  await app.button('Par 2', app.dialog).click()
  await app.button('Ok', app.dialog).click()
  await universe.expectChannels({ 2: 0, 6: 255 })
})

test('search filters memories and live memories by name', async ({ app }) => {
  await app.search('pars')
  await expect(app.widget('Red Pars')).toBeVisible()
  await expect(app.widget('Green Pars')).toBeVisible()

  const noMatches = app.main.getByText('No matches')
  await expect(noMatches).toHaveCount(0)

  // each section displays its own hint
  await app.search('green')
  await expect(app.widget('Red Pars')).toBeHidden()
  await expect(app.widget('Green Pars')).toBeVisible()
  await expect(noMatches).toHaveCount(1)

  await app.search('blue')
  await expect(app.widget('Green Pars')).toBeHidden()
  await expect(noMatches).toHaveCount(2)
})
