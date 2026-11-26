import { test, expect } from '../src/fixtures'

test('config page links to all entity types', async ({ app }) => {
  await app.navigate('Config')
  for (const name of [
    'Settings',
    'Fixture Types',
    'Fixtures',
    'Fixture Groups',
    'Memories',
    'Sequences',
    'Actions',
    'Buttons',
    'Dynamic Pages',
  ]) {
    await expect(
      app.main.getByRole('link', { name, exact: true })
    ).toBeVisible()
  }
})

test('creating a fixture type and a fixture using it', async ({
  app,
  universe,
}) => {
  await app.openEntityConfig('Fixture Types')
  await app.button('Add').click()
  let editor = app.entityEditor()
  await editor.fill('Name', 'Strobe')
  await editor.fill('Mapping', 'm, str')
  await editor.select('Shape', 'Square')
  await editor.save()
  await expect(app.main.getByText('Strobe')).toBeVisible()

  await app.openEntityConfig('Fixtures')
  await app.button('Add').click()
  editor = app.entityEditor()
  await editor.fill('Name', 'Strobe')
  await editor.select('Type', 'Strobe')
  await editor.toggle('Auto-Select')
  await expect(app.dialog.getByLabel('Channel')).toHaveValue('16')
  await editor.save()

  await app.navigate('Fixtures')
  await app.toggleWidget('16 Strobe')
  await universe.expectChannels({ 16: 255, 17: 0 })

  await app.navigate('Channels')
  await expect(app.fader('Channel 17').locator).toContainText('STR')
})

test('creating multiple fixtures with a group', async ({ app }) => {
  await app.openEntityConfig('Fixtures')
  await app.button('Add').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Spot #')
  await editor.select('Type', 'Dimmer')
  await editor.fill('Channel', '20')
  await editor.fill('Count', '3')
  await editor.check('Create group containing the fixture')
  await editor.save()

  await app.navigate('Fixtures')
  for (const [channel, name] of [
    [20, 'Spot 1'],
    [21, 'Spot 2'],
    [22, 'Spot 3'],
  ]) {
    await expect(app.widget(`${channel} ${name}`)).toBeVisible()
  }

  await app.navigate('Fixture Groups')
  await expect(app.widget('Spot #')).toBeVisible()
})

test('warns about overlapping channels', async ({ app }) => {
  await app.openEntityConfig('Fixtures')
  await app.button('Add').click()
  await app.entityEditor().fill('Channel', '3')
  await expect(app.dialog).toContainText(
    'Channels overlapping with other fixtures'
  )
  await app.entityEditor().cancel()
})

test('editing, copying and deleting entries', async ({ app }) => {
  await app.openEntityConfig('Fixture Groups')
  const editor = app.entityEditor()

  // edit
  await app.entityEntry('Pars').click()
  await expect(
    app.dialog.getByRole('heading', { name: 'Edit Fixture Group' })
  ).toBeVisible()
  await editor.fill('Name', 'Front Pars')
  await editor.save()
  await expect(app.entityEntry('Front Pars')).toBeVisible()

  // copy
  await app.entityEntryAction('Front Pars', 'Copy').click()
  await expect(
    app.dialog.getByRole('heading', { name: 'Add Fixture Group' })
  ).toBeVisible()
  await editor.fill('Name', 'Back Pars')
  await editor.save()
  await expect(app.entityEntry('Back Pars')).toBeVisible()

  // cancel discards changes
  await app.entityEntry('Back Pars').click()
  await editor.fill('Name', 'Discarded')
  await editor.cancel()
  await expect(app.entityEntry('Discarded')).toBeHidden()

  // delete
  await app.entityEntryAction('Back Pars', 'Delete').click()
  await expect(app.dialog).toContainText('Really delete "Back Pars"?')
  await app.confirm()
  await expect(app.entityEntry('Back Pars')).toBeHidden()
  await expect(app.entityEntry('Front Pars')).toBeVisible()
})

test('filtering entity lists', async ({ app }) => {
  await app.openEntityConfig('Fixtures')
  await app.search('par')
  await expect(app.entityEntry('Par #')).toBeVisible()
  await expect(app.entityEntry('Dimmer')).toBeHidden()

  // entries can still be edited while filtered
  await app.entityEntry('Par #').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Front Par #')
  await editor.save()
  await expect(app.entityEntry('Front Par #')).toBeVisible()
  await expect(app.searchInput).toHaveValue('par')

  await app.search('nothing')
  await expect(app.main).toContainText('No matches')

  // the search is reset when leaving the page
  await app.openEntityConfig('Fixture Groups')
  await expect(app.searchInput).toBeHidden()
  await expect(app.entityEntry('Pars')).toBeVisible()
})

test('creating a memory', async ({ app, universe }) => {
  await app.openEntityConfig('Memories')
  await app.button('Add').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'All Pars')
  await editor.selectMembers('Group', /^Pars/)
  await editor.save()

  await app.navigate('Memories')
  await app.toggleWidget('All Pars')
  await universe.expectChannel(2, value => value > 0)
  await universe.expectChannel(6, value => value > 0)
})

test('memory display modes', async ({ app }) => {
  await app.openEntityConfig('Memories')
  await app.entityEntry('Red Pars').click()
  await app.entityEditor().select('Display as', 'Toggle button')
  await app.entityEditor().save()

  await app.navigate('Memories')
  await expect(app.widget('Red Pars').getByRole('slider')).toBeHidden()
})

test('creating a named action', async ({ api, app, universe }) => {
  await app.openEntityConfig('Actions')
  await app.button('Add').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Dimmer On')
  await editor.toggle('Dimmer')
  await app.dialog
    .getByRole('button', { name: '1 Fixtures', exact: true })
    .click()
  await expect(app.dialog).not.toContainText('No changes yet')
  await editor.save()
  await expect(app.entityEntry('Dimmer On')).toBeVisible()

  await api.send({ type: 'actions', actions: [{ type: 'action', ids: ['2'] }] })
  await universe.expectChannels({ 1: 255 })
})

test('creating a button with a hotkey', async ({ app, page, universe }) => {
  await app.openEntityConfig('Buttons')
  await app.button('Add').click()
  const editor = app.entityEditor()
  await editor.fill('Label', 'Hotkey Button')
  await editor.fill('Hotkey', 'q')
  await app.button('Add action', app.dialog).first().click()
  await app.dialog
    .getByRole('combobox', { name: 'Named action' })
    .first()
    .selectOption('Red Pars On')
  await editor.save()

  await app.navigate('Global Controls')
  await expect(app.button('Hotkey Button')).toHaveAttribute('title', /\(Q\)/)
  await page.keyboard.down('q')
  await universe.expectChannels({ 2: 255 })
  await page.keyboard.up('q')
})

test('changes are not written to disk in read-only mode', async ({
  app,
  page,
}) => {
  await app.openEntityConfig('Fixture Groups')
  await app.entityEntryAction('Pars', 'Delete').click()
  await app.confirm()
  await expect(app.entityEntry('Pars')).toBeHidden()

  // the change is kept in memory
  await page.reload()
  await expect(app.button('Add')).toBeVisible()
  await expect(app.entityEntry('Pars')).toBeHidden()
})
