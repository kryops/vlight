import { test, expect } from '../src/fixtures'
import { App } from '../src/helpers/app'

/** The dialog that was opened last. */
const topDialog = (app: App) => app.page.getByRole('dialog').last()

async function savePreset(app: App, name: string) {
  await app.button('Save current state as preset', app.dialog.first()).click()
  const prompt = topDialog(app)
  await expect(
    prompt.getByRole('heading', { name: 'Save as Preset' })
  ).toBeVisible()
  await prompt.getByLabel('Name').fill(name)
  await app.button('Ok', prompt).click()
  await expect(app.button(name, app.dialog.first())).toBeVisible()
}

async function renamePreset(app: App, name: string, newName: string) {
  const editor = app.dialog.first()
  await app.button('Rename or delete presets', editor).click()
  await app.button(name, editor).click()
  const prompt = topDialog(app)
  await expect(
    prompt.getByRole('heading', { name: 'Rename Preset' })
  ).toBeVisible()
  await prompt.getByLabel('Name').fill(newName)
  await app.button('Ok', prompt).click()
  await expect(app.button(newName, editor)).toBeVisible()
  await expect(app.button(name, editor)).toBeHidden()
}

async function deletePreset(app: App, name: string) {
  const editor = app.dialog.first()
  await app
    .button(name, editor)
    .getByRole('button', { name: 'Delete preset', exact: true })
    .click()
  const confirm = topDialog(app)
  await expect(confirm).toContainText(`Really delete preset "${name}"?`)
  await app.button('Yes', confirm).click()
  await expect(app.button(name, editor)).toBeHidden()
}

test.describe('live chase color presets', () => {
  const chase = 'Red/Blue Chase'

  test.beforeEach(async ({ app }) => {
    await app.navigate('Chases')
  })

  test('applying a preset', async ({ app, universe }) => {
    const widget = app.widget(chase)
    // reduce to a single color first
    await app.button('Color 1', widget).click()
    await app.dialog
      .getByRole('button', { name: 'Remove Color' })
      .getByRole('button', { name: 'Remove Color' })
      .first()
      .click()
    await app.button('Ok', app.dialog).click()
    await expect(app.button('Color 2', widget)).toBeHidden()

    await app.button('Color 1', widget).click()
    await app.button('Red/Blue', app.dialog).click()
    await app.button('Ok', app.dialog).click()
    await expect(app.button('Color 2', widget)).toBeVisible()

    await app.toggleWidget(chase)
    await universe.expectChannels({ 2: 255 })
  })

  test('adding, renaming and deleting presets', async ({ app, secondApp }) => {
    const widget = app.widget(chase)
    await app.button('Color 1', widget).click()

    await savePreset(app, 'My Colors')
    await renamePreset(app, 'My Colors', 'Favorite Colors')

    // presets are global and available everywhere
    await secondApp.navigate('Chases')
    await secondApp.button('Color 1', secondApp.widget(chase)).click()
    await expect(
      secondApp.button('Favorite Colors', secondApp.dialog)
    ).toBeVisible()

    await deletePreset(app, 'Favorite Colors')
    await expect(
      secondApp.button('Favorite Colors', secondApp.dialog)
    ).toBeHidden()
    await expect(app.button('Red/Blue', app.dialog)).toBeVisible()
  })
})

test.describe('memory scene state presets', () => {
  test.beforeEach(async ({ app }) => {
    await app.navigate('Memories')
  })

  test('applying a preset', async ({ app, universe }) => {
    await app.button('State 1', app.widget('Green Pars')).click()
    await app.button('Red', app.dialog).click()
    await app.button('Ok', app.dialog).click()
    await expect(app.dialog).toBeHidden()

    await app.toggleWidget('Green Pars')
    await universe.expectChannels({ 3: 255, 4: 0 })
  })

  test('adding, renaming and deleting presets', async ({ app, universe }) => {
    const widget = app.widget('Green Pars')
    await app.button('State 1', widget).click()

    // saves the current (green) state
    await savePreset(app, 'Green')
    await renamePreset(app, 'Green', 'Lime')
    // leave the editing mode to apply presets again
    await app.button('Rename or delete presets', app.dialog).click()

    await app.button('Red', app.dialog).click()
    await app.button('Lime', app.dialog).click()
    await app.button('Ok', app.dialog).click()
    await app.toggleWidget('Green Pars')
    await universe.expectChannels({ 3: 0, 4: 255 })

    // presets are shared with the memory editor
    await app.button('Edit memory', app.widget('Red Pars')).click()
    await app.button('State 1', app.dialog).click()
    await expect(app.button('Lime', topDialog(app))).toBeVisible()
    await app.button('Cancel', topDialog(app)).click()
    await app.button('Cancel', app.dialog).click()

    await app.button('State 1', widget).click()
    await app.button('Rename or delete presets', app.dialog).click()
    await deletePreset(app, 'Lime')
  })
})
