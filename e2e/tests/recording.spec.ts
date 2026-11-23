import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app, page }) => {
  await app.navigate('Fixtures')
  await page
    .getByRole('button', { name: 'Toggle action recording bar' })
    .click()
  await page.getByRole('button', { name: 'Record', exact: true }).click()
})

test('recorded changes are only applied when applying', async ({
  app,
  page,
  universe,
}) => {
  await app.toggleWidget('1 Dimmer')
  await expect(page.getByText('Recording (1 action)')).toBeVisible()
  await universe.page.waitForTimeout(300)
  await universe.expectChannels({ 1: 0 })

  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await universe.expectChannels({ 1: 255 })
})

test('cancelling discards the recorded changes', async ({
  app,
  page,
  universe,
}) => {
  await app.toggleWidget('1 Dimmer')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Record', exact: true })
  ).toBeVisible()

  await universe.page.waitForTimeout(300)
  await universe.expectChannels({ 1: 0 })
})

test('pausing the recording makes real changes', async ({
  app,
  page,
  universe,
}) => {
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await app.toggleWidget('1 Dimmer')
  await universe.expectChannels({ 1: 255 })
})

test('saving the recorded changes to a new button', async ({
  app,
  page,
  universe,
}) => {
  await app.toggleWidget('1 Dimmer')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await app.dialog.getByLabel('Save to').selectOption('(New Button)')
  await app.button('Ok', app.dialog).click()
  // the button editor opens with the recorded actions
  const editor = app.entityEditor()
  await editor.fill('Label', 'Recorded')
  await editor.save()

  await app.navigate('Global Controls')
  await app.button('Recorded').hover()
  await page.mouse.down()
  await universe.expectChannels({ 1: 255 })
  await page.mouse.up()
})
