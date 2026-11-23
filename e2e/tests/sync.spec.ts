import { test, expect } from '../src/fixtures'
import { App } from '../src/helpers/app'

/**
 * Changes are reflected in the same control on another page,
 * and in other browsers.
 */

test('channel faders in another browser', async ({ app, secondApp }) => {
  await app.navigate('Channels')
  await secondApp.navigate('Channels')

  await app.fader('Channel 5').dragTo(1)
  await secondApp.fader('Channel 5').expectValue(255)

  await secondApp.fader('Channel 5').dragTo(0)
  await app.fader('Channel 5').expectValue(0)
})

test('fixture controls in another browser', async ({ app, secondApp }) => {
  await app.navigate('Fixtures')
  await secondApp.navigate('Fixtures')
  const title = '2 Par 1'

  await app.toggleWidget(title)
  await expect(
    secondApp.widget(title).getByRole('button', { name: title, exact: true })
  ).toHaveAttribute('aria-pressed', 'true')

  await app.button('Color picker', app.widget(title)).click()
  await app.fader('G', app.widget(title)).dragTo(0)
  await secondApp.button('Color picker', secondApp.widget(title)).click()
  await secondApp.fader('G', secondApp.widget(title)).expectValue(0)
})

test('memory on a dynamic page and on the memories page', async ({
  app,
  secondApp,
}) => {
  await app.navigate('Show')
  await secondApp.navigate('Memories')
  const memoryTitle = (target: App) =>
    target
      .widget('Red Pars')
      .getByRole('button', { name: 'Red Pars', exact: true })

  await app.toggleWidget('Red Pars')
  await expect(memoryTitle(secondApp)).toHaveAttribute('aria-pressed', 'true')

  await secondApp.fader('Value', secondApp.widget('Red Pars')).dragTo(0)
  await app.fader('Value', app.widget('Red Pars')).expectValue(0)

  await secondApp.toggleWidget('Red Pars')
  await expect(memoryTitle(app)).toHaveAttribute('aria-pressed', 'false')
})

test('DMX master on a dynamic page and on the global page', async ({
  app,
  secondApp,
}) => {
  await app.navigate('Show')
  await secondApp.navigate('Global Controls')

  await app.button('OFF', app.widget('DMX Master')).click()
  await secondApp
    .fader('DMX Master', secondApp.widget('DMX Master'))
    .expectValue(0)
})

test('live chase controls in another browser', async ({ app, secondApp }) => {
  await app.navigate('Chases')
  await secondApp.navigate('Chases')
  const chase = 'Red/Blue Chase'

  await app.button('Double speed', app.widget(chase)).click()
  await expect(
    secondApp.fader('Speed', secondApp.widget(chase)).locator
  ).toHaveAttribute('aria-valuetext', '0.50s')

  await app.button('Start', app.widget(chase)).click()
  await expect(secondApp.button('Start', secondApp.widget(chase))).toBeHidden()
})

test('the same page in the same browser', async ({ app, context }) => {
  const otherTab = new App(await context.newPage())
  await otherTab.open('/fixture-groups')
  await app.navigate('Fixture Groups')

  await app.fader('M', app.widget('Pars')).dragTo(0)
  await otherTab.fader('M', otherTab.widget('Pars')).expectValue(0)
})

test('master data changes in another browser', async ({ app, secondApp }) => {
  await secondApp.navigate('Fixture Groups')

  await app.navigate('Fixture Groups')
  await app.button('Edit group', app.widget('Pars')).click()
  await app.entityEditor().fill('Name', 'Renamed Pars')
  await app.entityEditor().save()

  await expect(secondApp.widget('Renamed Pars')).toBeVisible()
  await expect(secondApp.widget('Pars')).toBeHidden()
})
