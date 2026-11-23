import { ProgrammableButton } from '@vlight/types'

import { test, expect, VLightApi } from '../src/fixtures'
import { App } from '../src/helpers/app'

async function addButton(
  api: VLightApi,
  button: Partial<ProgrammableButton> & Pick<ProgrammableButton, 'id'>
) {
  await api.send({
    type: 'add-entity',
    entity: 'buttons',
    entry: { down: [], up: [], ...button },
  })
}

async function press(app: App, label: string) {
  await app.button(label).hover()
  await app.page.mouse.down()
}

async function release(app: App) {
  await app.page.mouse.up()
}

test.beforeEach(async ({ app }) => {
  await app.navigate('Global Controls')
})

test('toggle buttons stay active until pressed again', async ({
  api,
  app,
  universe,
}) => {
  await addButton(api, {
    id: 'toggle',
    label: 'Toggle',
    mode: 'toggle',
    down: [{ type: 'channels', channels: { 20: 100 }, revert: true }],
    up: [{ type: 'channels', channels: { 21: 50 } }],
  })
  const button = app.button('Toggle')

  await button.click()
  await universe.expectChannels({ 20: 100, 21: 0 })
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await button.click()
  await universe.expectChannels({ 20: 0, 21: 50 })
  await expect(button).not.toHaveAttribute('aria-pressed', 'true')
})

test('changes are only reverted if not changed in the meantime', async ({
  api,
  app,
  universe,
}) => {
  await addButton(api, {
    id: 'flash',
    label: 'Flash',
    down: [
      { type: 'channels', channels: { 20: 100 }, revert: true },
      { type: 'channels', channels: { 21: 100 }, revert: true },
      { type: 'channels', channels: { 22: 100 } },
    ],
  })

  await press(app, 'Flash')
  await universe.expectChannels({ 20: 100, 21: 100, 22: 100 })
  await api.send({ type: 'channels', channels: { 21: 150 } })
  await universe.expectChannels({ 21: 150 })

  await release(app)
  await universe.expectChannels({ 20: 0, 21: 150, 22: 100 })
})

test('buttons can press and release other buttons', async ({
  api,
  app,
  universe,
}) => {
  await addButton(api, {
    id: 'toggle',
    label: 'Toggle',
    mode: 'toggle',
    down: [{ type: 'channels', channels: { 20: 100 }, revert: true }],
  })
  await addButton(api, {
    id: 'on',
    label: 'Press Toggle',
    down: [{ type: 'button', ids: ['toggle'], down: true }],
  })
  await addButton(api, {
    id: 'off',
    label: 'Release Toggle',
    down: [{ type: 'button', ids: ['toggle'], down: false }],
  })

  await app.button('Press Toggle').click()
  await universe.expectChannels({ 20: 100 })
  await expect(app.button('Toggle')).toHaveAttribute('aria-pressed', 'true')

  // releasing deactivates toggle buttons
  await app.button('Release Toggle').click()
  await universe.expectChannels({ 20: 0 })
  await expect(app.button('Toggle')).not.toHaveAttribute('aria-pressed', 'true')
})

test('"Revert all" toggles reverting for all actions', async ({
  app,
  universe,
}) => {
  // the seeded "Red Pars" button is the only one
  await app.button('Edit button').click()
  const editor = app.entityEditor()
  const revertAll = app.dialog.getByRole('checkbox', {
    name: 'Revert all on release',
  })
  await expect(revertAll).toHaveAttribute('aria-checked', 'true')
  await revertAll.click()
  await expect(revertAll).toHaveAttribute('aria-checked', 'false')

  await editor.select('Mode', 'Toggle: Press again to deactivate')
  await expect(
    app.dialog.getByRole('checkbox', { name: 'Revert all on second press' })
  ).toBeVisible()
  await editor.select('Mode', 'Flash: Active while pressed')
  await editor.save()

  await press(app, 'Red Pars')
  await universe.expectChannels({ 2: 255 })
  await release(app)
  await universe.page.waitForTimeout(300)
  await universe.expectChannels({ 2: 255 })
})

test('recording an active toggle button records releasing it', async ({
  api,
  app,
  page,
  universe,
}) => {
  await addButton(api, {
    id: 'toggle',
    label: 'Toggle',
    mode: 'toggle',
    down: [{ type: 'channels', channels: { 20: 100 }, revert: true }],
  })
  await api.send({ type: 'button', id: 'toggle', down: true })
  const button = app.button('Toggle')
  await expect(button).toHaveAttribute('aria-pressed', 'true')

  await page
    .getByRole('button', { name: 'Toggle action recording bar' })
    .click()
  await page.getByRole('button', { name: 'Record', exact: true }).click()
  await button.click()
  await expect(page.getByText('Recording (1 action)')).toBeVisible()
  // the recorded state is displayed, but not applied yet
  await expect(button).not.toHaveAttribute('aria-pressed', 'true')
  await universe.expectChannels({ 20: 100 })

  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await universe.expectChannels({ 20: 0 })
  await expect(button).not.toHaveAttribute('aria-pressed', 'true')
})
