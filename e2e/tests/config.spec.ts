import { test, expect } from '../src/fixtures'

test('creates a fixture group', async ({ app, page }) => {
  await app.openEntityConfig('Fixture Groups')
  await page.getByRole('button', { name: 'Add' }).click()

  const editor = app.entityEditor()
  await editor.fill('Name', 'Heads')
  await editor.toggle('Fixture')
  await editor.toggle('Moving Head')
  await editor.save()

  await expect(page.getByRole('main').getByText('Heads')).toBeVisible()

  await app.navigate('Fixture Groups')
  await expect(app.widget('Heads')).toBeVisible()
  await expect(app.widget('Pars')).toBeVisible()
})
