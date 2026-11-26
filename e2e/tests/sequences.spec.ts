import { Sequence } from '@vlight/types'

import { test, expect, VLightApi } from '../src/fixtures'

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

async function addSequence(api: VLightApi, sequence: Omit<Sequence, 'id'>) {
  await api.send({
    type: 'add-entity',
    entity: 'sequences',
    entry: { id: 'test', ...sequence },
  })
}

test('manual steps wait until triggered', async ({ api, app, universe }) => {
  await addSequence(api, {
    name: 'Manual',
    steps: [
      { delay: 0, actions: [{ type: 'channels', channels: { 20: 100 } }] },
      { actions: [{ type: 'channels', channels: { 21: 100 } }] },
    ],
  })
  const widget = app.widget('Manual')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 20: 100 })
  await expect(widget).toContainText('Step 1/2')

  await universe.page.waitForTimeout(500)
  await universe.expectChannels({ 21: 0 })

  await app.button('Next step', widget).click()
  await universe.expectChannels({ 21: 100 })
  await expect(widget).toContainText('Step 2/2')

  // without end delay, the end of the run is triggered manually as well
  await app.button('End run', widget).click()
  await expect(widget).toContainText('2 Steps')
  await expect(app.button('Start', widget)).toBeVisible()
})

test('pausing and resuming', async ({ api, app, universe }) => {
  await addSequence(api, {
    name: 'Timed',
    steps: [
      { delay: 0, actions: [{ type: 'channels', channels: { 20: 100 } }] },
      { delay: 2, actions: [{ type: 'channels', channels: { 21: 100 } }] },
      { delay: 2, actions: [{ type: 'channels', channels: { 22: 100 } }] },
    ],
    endDelay: 10,
  })
  const widget = app.widget('Timed')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 20: 100 })
  await app.button('Pause', widget).click()
  await expect(app.button('Resume', widget)).toBeVisible()

  await universe.page.waitForTimeout(2500)
  await universe.expectChannels({ 21: 0 })

  // stepping while paused stays paused
  await app.button('Next step (stays paused)', widget).click()
  await universe.expectChannels({ 21: 100 })
  await expect(widget).toContainText('Step 2/3')
  await expect(app.button('Resume', widget)).toBeVisible()

  await app.button('Resume', widget).click()
  await universe.expectChannels({ 22: 100 })
  await expect(widget).toContainText('Step 3/3')
})

test('global pause pauses running sequences', async ({
  api,
  app,
  universe,
}) => {
  await addSequence(api, {
    name: 'Timed',
    steps: [
      { delay: 0, actions: [{ type: 'channels', channels: { 20: 100 } }] },
      { delay: 1, actions: [{ type: 'channels', channels: { 21: 100 } }] },
    ],
    endDelay: 10,
  })
  const widget = app.widget('Timed')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 20: 100 })
  await api.send({ type: 'pause', paused: true })

  const resume = app.button('Paused globally - resume', widget)
  await expect(resume).toBeVisible()
  await universe.page.waitForTimeout(1500)
  await universe.expectChannels({ 21: 0 })

  await resume.click()
  await universe.expectChannels({ 21: 100 })
  await expect(app.button('Pause', widget)).toBeVisible()
})

test('reverting changes at the end of a step', async ({
  api,
  app,
  universe,
}) => {
  await addSequence(api, {
    name: 'Revert',
    steps: [
      {
        delay: 0,
        actions: [
          { type: 'channels', channels: { 20: 100 }, revert: true },
          { type: 'channels', channels: { 21: 100 } },
        ],
      },
      {
        actions: [{ type: 'channels', channels: { 22: 100 }, revert: true }],
      },
    ],
  })
  const widget = app.widget('Revert')
  await app.button('Start', widget).click()
  await universe.expectChannels({ 20: 100, 21: 100 })

  await app.button('Next step', widget).click()
  await universe.expectChannels({ 20: 0, 21: 100, 22: 100 })

  // stopping reverts the current step
  await app.button('Stop (reset to start)', widget).click()
  await universe.expectChannels({ 20: 0, 21: 100, 22: 0 })
})

test('repetitions', async ({ api, app, universe }) => {
  await addSequence(api, {
    name: 'Repeated',
    steps: [
      {
        delay: 0,
        actions: [{ type: 'channels', channels: { 20: 100 }, revert: true }],
      },
    ],
    repeat: 1,
    endDelay: 1.5,
  })
  const widget = app.widget('Repeated')
  await app.button('Start', widget).click()
  await expect(widget).toContainText('Run 1/2')
  await universe.expectChannels({ 20: 100 })
  await expect(widget).toContainText('Run 2/2')
  await universe.expectChannels({ 20: 100 })

  // stops after the second run, reverting the last step
  await expect(app.button('Start', widget)).toBeVisible({ timeout: 5000 })
  await universe.expectChannels({ 20: 0 })
})

test('editing the steps of a sequence', async ({ app }) => {
  await app.button('Edit sequence', app.widget('Memory Sequence')).click()
  const editor = app.entityEditor()
  const names = app.dialog.getByRole('textbox', { name: 'Name', exact: true })
  const stepNames = () =>
    names.evaluateAll(inputs =>
      inputs.slice(1).map(input => (input as HTMLInputElement).value)
    )

  await names.nth(1).fill('First')
  await app.button('Clone step', app.dialog).click()
  await expect.poll(stepNames).toEqual(['First', 'First (copy)'])

  await app.button('Add step', app.dialog).click()
  await names.nth(3).fill('Last')
  await expect.poll(stepNames).toEqual(['First', 'First (copy)', 'Last'])

  await app.button('Move step up', app.dialog).nth(2).click()
  await expect.poll(stepNames).toEqual(['First', 'Last', 'First (copy)'])

  await app.button('Remove step', app.dialog).nth(2).click()
  await expect.poll(stepNames).toEqual(['First', 'Last'])

  await editor.select('At the end', 'Repeat n times')
  await editor.fill('Repetitions', '2')
  await expect(app.dialog).toContainText('Played 3 times overall')
  await editor.save()

  const widget = app.widget('Memory Sequence')
  await expect(widget).toContainText('2 Steps')
  await app.button('Start', widget).click()
  await expect(widget).toContainText('Run 1/3')
})

test('search filters sequences by name', async ({ app }) => {
  await app.search('memory')
  await expect(app.widget('Memory Sequence')).toBeVisible()

  await app.search('nothing')
  await expect(app.widget('Memory Sequence')).toBeHidden()
  await expect(app.main).toContainText('No matches')
  await expect(app.main).not.toContainText('No sequences configured yet')
})
