import { test, expect } from '../src/fixtures'

test.beforeEach(async ({ app }) => {
  await app.navigate('Sequences')
})

test('starting and stopping a sequence', async ({ app, universe }) => {
  const widget = app.widget('Memory Sequence')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 2: 255, 3: 255 })

  await app.button('STOP').click()
  await universe.expectChannels({ 2: 0, 3: 0 })
})

test('sequences can be controlled via the API', async ({ api, universe }) => {
  await api.send({ type: 'sequence', id: '1', control: 'start' })
  await universe.expectChannels({ 2: 255 })
  await api.send({ type: 'sequence', id: '1', control: 'stop' })
  await universe.expectChannels({ 2: 0 })
})

test('creating a sequence with a named action', async ({ app, universe }) => {
  await app.button('Add sequence').click()
  const editor = app.entityEditor()
  await app.dialog
    .getByRole('textbox', { name: 'Name', exact: true })
    .first()
    .fill('Red Sequence')
  await app.button('Add action', app.dialog).click()
  await app.dialog
    .getByRole('combobox', { name: 'Named action' })
    .first()
    .selectOption('Red Pars On')
  await editor.save()

  const widget = app.widget('Red Sequence')
  await expect(widget).toContainText('1 Steps')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 2: 255, 3: 255 })
})
