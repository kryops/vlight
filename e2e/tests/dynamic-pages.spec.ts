import { test, expect } from '../src/fixtures'

test('dynamic pages display the configured widgets', async ({
  app,
  universe,
}) => {
  await app.navigate('Show')
  await expect(
    app.main.getByRole('heading', { name: 'Controls' })
  ).toBeVisible()
  await expect(app.widget('DMX Master')).toBeVisible()
  await expect(app.widget('Red Pars')).toBeVisible()

  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 2: 255 })
})

test('creating a dynamic page adds it to the navigation', async ({ app }) => {
  await app.openEntityConfig('Dynamic Pages')
  await app.button('Add').click()
  const editor = app.entityEditor()
  await editor.fill('Headline', 'Stage')
  await editor.select('Widget type', 'Fixture Group')
  await editor.save()

  await app.navigate('Stage')
  await expect(app.heading).toHaveText('Stage')
  await expect(app.widget('Pars')).toBeVisible()
})

test('editing a dynamic page from the page', async ({ app }) => {
  await app.navigate('Show')
  await app.button('Edit').click()
  await app.main
    .getByRole('textbox', { name: 'Headline', exact: true })
    .first()
    .fill('Concert')
  // the first one is in the header, next to "Cancel"
  await app.button('Save').first().click()

  await expect(app.heading).toHaveText('Concert')
  await expect(
    app.navigation.getByRole('link', { name: 'Concert', exact: true })
  ).toBeVisible()
})
