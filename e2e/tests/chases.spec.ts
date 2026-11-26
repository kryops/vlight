import { test, expect } from '../src/fixtures'
import { App } from '../src/helpers/app'

const chase = 'Red/Blue Chase'

test.beforeEach(async ({ app }) => {
  await app.navigate('Chases')
})

async function addChase(app: App, name: string) {
  await app.button('Add live chase').click()
  const editor = app.entityEditor()
  await editor.fill('Name', name)
  await editor.selectMembers('Group', /^Pars/)
  await editor.save()
  await expect(app.widget(name)).toBeVisible()
}

/** The color list entries are drag handles that contain the remove button. */
async function removeFirstColor(app: App) {
  await app.dialog
    .getByRole('button', { name: 'Remove Color' })
    .getByRole('button', { name: 'Remove Color' })
    .first()
    .click()
}

test('creating, renaming and deleting a live chase', async ({ app }) => {
  await addChase(app, 'Chase')

  const widget = app.widget('Chase')
  await app.button('Rename', widget).click()
  await app.dialog.getByRole('textbox').fill('Renamed')
  await app.button('Ok', app.dialog).click()
  await expect(app.widget('Renamed')).toBeVisible()

  await app.button('Delete', app.widget('Renamed')).click()
  await app.confirm()
  await expect(app.widget('Renamed')).toBeHidden()
})

test('starting, stopping and turning off a live chase', async ({
  app,
  universe,
}) => {
  const widget = app.widget(chase)
  await app.button('Start', widget).click()
  await universe.expectChannels({ 2: 255, 6: 255 })

  // STOP only stops the chase from running, the lights stay on
  await app.button('STOP').click()
  await expect(app.button('STOP')).toHaveAttribute('aria-disabled', 'true')
  await universe.expectChannels({ 2: 255, 6: 255 })

  await app.button('OFF').click()
  await universe.expectChannels({ 2: 0, 6: 0 })

  // the title toggles the chase on and off
  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 255 })
  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 0 })
})

test('stepping manually', async ({ app, universe }) => {
  const widget = app.widget(chase)
  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 255, 6: 255 })

  // the pars switch between red and blue
  const colors = new Set<string>()
  for (let i = 0; i < 20 && colors.size < 2; i++) {
    await app.button('Step', widget).click()
    await universe.page.waitForTimeout(100)
    colors.add(`${await universe.value(3)}/${await universe.value(5)}`)
  }
  expect(colors).toEqual(new Set(['255/0', '0/255']))

  // still stopped
  await expect(app.button('Start', widget)).toBeVisible()
})

test('value fader dims the chase', async ({ app, universe }) => {
  const widget = app.widget(chase)
  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 255 })

  await app.fader('Value', widget).dragTo(0)
  await universe.expectChannels({ 2: 0, 6: 0 })
})

test('light fader controls the share of active members', async ({
  app,
  universe,
}) => {
  const widget = app.widget(chase)
  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 255, 6: 255 })

  await app.fader('Light', widget).dragTo(0)
  await app.button('Step', widget).click()
  await universe.expectChannels({ 2: 0, 6: 0 })

  // multiple discrete values, then a value range instead of a single value
  await app.button('Single value', widget).click()
  await expect(
    widget.getByRole('button', { name: 'Light', exact: true })
  ).toBeVisible()
  await app.button(/^Multiple discrete values/, widget).click()
  await expect(app.button('Value range', widget)).toBeVisible()
  await expect(widget.getByRole('group', { name: 'Light' })).toBeVisible()
})

test('speed controls', async ({ app }) => {
  const widget = app.widget(chase)
  const speed = app.fader('Speed', widget)
  await expect(speed.locator).toHaveAttribute('aria-valuetext', '1.00s')

  await app.button('Double speed', widget).click()
  await expect(speed.locator).toHaveAttribute('aria-valuetext', '0.50s')

  await app.button('Half speed', widget).click()
  await app.button('Half speed', widget).click()
  await expect(speed.locator).toHaveAttribute('aria-valuetext', '2.00s')

  await speed.dragTo(1)
  await expect(speed.locator).not.toHaveAttribute('aria-valuetext', '2.00s')
})

test('fade time can be relative to the speed', async ({ app }) => {
  const widget = app.widget(chase)
  await app
    .button('Absolute fade time (click for relative to speed)', widget)
    .click()
  await expect(
    app.button('Fade relative to speed (click for absolute)', widget)
  ).toBeVisible()

  // 50% of the speed
  const fade = app.fader('Fade', widget)
  await fade.dragTo(0.5)
  await expect(fade.locator).toHaveAttribute('aria-valuetext', '0.50s')

  // ...which changes with the speed
  await app.button('Double speed', widget).click()
  await expect(fade.locator).toHaveAttribute('aria-valuetext', '0.25s')
})

test('speed burst runs the chase while pressed', async ({ app, universe }) => {
  const widget = app.widget(chase)
  await app.button('Speed burst', widget).hover()
  await app.page.mouse.down()
  await universe.expectChannels({ 2: 255, 6: 255 })

  await app.page.mouse.up()
  await universe.expectChannels({ 2: 0, 6: 0 })
})

test('same-color mode applies the same color to all members', async ({
  app,
  universe,
}) => {
  const widget = app.widget(chase)
  await app.button('Colors are applied randomly', widget).click()
  const sameColor = app.button(
    'The same color (but not state) is applied to all active members',
    widget
  )
  await expect(sameColor).toBeVisible()

  await app.toggleWidget(chase)
  for (let i = 0; i < 5; i++) {
    await app.button('Step', widget).click()
    await expect
      .poll(async () => {
        const [r1, b1, r2, b2] = await Promise.all(
          [3, 5, 7, 9].map(channel => universe.value(channel))
        )
        return r1 === r2 && b1 === b2 && r1 + b1 === 255
      })
      .toBe(true)
  }

  await sameColor.click()
  await expect(
    app.button('The same state is applied to all active members', widget)
  ).toBeVisible()
})

test('single mode turns off other single-mode chases', async ({ app }) => {
  // new chases default to single mode, the seeded one does not
  await addChase(app, 'Other')
  await app
    .button(
      'Multiple Mode: Will run in addition to other chases',
      app.widget(chase)
    )
    .click()

  await app.button('Start', app.widget(chase)).click()
  await expect(app.button('Start', app.widget(chase))).toBeHidden()
  await app.button('Start', app.widget('Other')).click()

  await expect(app.button('Start', app.widget(chase))).toBeVisible()
  await expect(app.button('Start', app.widget('Other'))).toBeHidden()
})

test('editing the members', async ({ app, universe }) => {
  const widget = app.widget(chase)
  await app.button('Toggle fixture list', widget).click()
  await expect(app.dialog).toContainText(`Members for chase ${chase}`)
  // replace the group with a single fixture
  await app.button('Remove', app.dialog).click()
  await app.button('Fixture', app.dialog).click()
  await app.button('Par 1', app.dialog).click()
  await app.button('Ok', app.dialog).click()
  await expect(app.dialog).toBeHidden()

  // the members are applied with the next step
  await app.toggleWidget(chase)
  await app.button('Step', widget).click()
  await universe.expectChannels({ 2: 255, 6: 0 })
})

test('editing the colors', async ({ app, universe }) => {
  const widget = app.widget(chase)

  // add a color
  await app.button('Add color', widget).click()
  await app.button('Ok', app.dialog).click()
  await expect(app.button('Color 3', widget)).toBeVisible()

  // remove all but one color, then make it green
  await app.button('Color 1', widget).click()
  await removeFirstColor(app)
  await removeFirstColor(app)
  await app.fader('R', app.dialog).dragTo(0)
  await app.fader('G', app.dialog).dragTo(1)
  await app.fader('B', app.dialog).dragTo(0)
  await app.button('Ok', app.dialog).click()
  await expect(app.button('Color 2', widget)).toBeHidden()

  await app.toggleWidget(chase)
  await universe.expectChannels({ 2: 255, 3: 0, 4: 255, 5: 0 })
})

test('color drafts are applied later', async ({ app, universe }) => {
  const widget = app.widget(chase)
  await app.button('Start', widget).click()

  await app.button('Color 1', widget).click()
  await removeFirstColor(app)
  await app.button('Set as Draft', app.dialog).click()
  await expect(app.button('Draft color 1', widget)).toBeVisible()
  // the original colors are still active
  await expect(app.button('Color 2', widget)).toBeVisible()

  await app.button('Apply draft', widget).click()
  await expect(app.button('Draft color 1', widget)).toBeHidden()
  await expect(app.button('Color 2', widget)).toBeHidden()

  // only blue is left
  await universe.expectChannels({ 3: 0, 5: 255, 7: 0, 9: 255 })
})

test('compact view', async ({ app }) => {
  const widget = app.widget(chase)
  await app.button('Compact view: Speed burst button only', widget).click()
  await expect(app.fader('Speed', widget).locator).toBeHidden()
  await expect(app.button('Speed burst', widget)).toBeVisible()

  await app.button('Full view', widget).click()
  await expect(app.fader('Speed', widget).locator).toBeVisible()
})

test('movements move the moving head', async ({ app, universe }) => {
  const widget = app.widget('Head Circle')
  await app.button('Start', widget).click()

  const first = await universe.value(10)
  await universe.expectChannel(10, value => value !== first, 'pan changes')
  await universe.expectChannel(11, value => value > 0, 'tilt is set')
})

test('creating and deleting a movement', async ({ app }) => {
  await app.button('Add movement').click()
  const editor = app.entityEditor()
  await editor.fill('Name', 'Circle')
  await editor.selectMembers('Fixture', 'Moving Head')
  await editor.save()

  const widget = app.widget('Circle')
  await expect(widget).toBeVisible()
  await app.button('Delete', widget).click()
  await app.confirm()
  await expect(widget).toBeHidden()
})

test('search filters live chases and movements by name', async ({ app }) => {
  const noMatches = app.main.getByText('No matches')

  // each section displays its own hint
  await app.search('circle')
  await expect(app.widget('Head Circle')).toBeVisible()
  await expect(app.widget(chase)).toBeHidden()
  await expect(noMatches).toHaveCount(1)

  await app.search('red blue')
  await expect(app.widget(chase)).toBeVisible()
  await expect(app.widget('Head Circle')).toBeHidden()

  await app.search('nothing')
  await expect(noMatches).toHaveCount(2)
})
