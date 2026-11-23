import { test, expect } from '../src/fixtures'
import { App } from '../src/helpers/app'

/**
 * Deleting master data entities updates or deletes the entities referencing them.
 */

async function deleteEntry(app: App, entityType: string, name: string) {
  await app.openEntityConfig(entityType)
  await app.entityEntryAction(name, 'Delete').click()
  await app.confirm()
  await expect(app.entityEntry(name)).toBeHidden()
}

test('deleting a fixture deletes groups and memories that become empty', async ({
  api,
  app,
}) => {
  await api.send({
    type: 'add-entity',
    entity: 'fixtureGroups',
    entry: { id: '2', name: 'Mixed', fixtures: ['dimmer', 'all:par'] },
  })

  await deleteEntry(app, 'Fixtures', 'Par #')

  await app.openEntityConfig('Fixture Groups')
  await expect(app.entityEntry('Pars')).toBeHidden()
  await expect(app.entityEntry('Mixed')).toContainText('1 Fixtures')

  await app.openEntityConfig('Memories')
  await expect(app.entityEntry('Red Pars')).toBeHidden()

  // the deleted memory is removed from actions
  await app.openEntityConfig('Buttons')
  await expect(app.entityEntry('Red Pars')).toContainText('0 Actions')
  await app.openEntityConfig('Sequences')
  await expect(app.entityEntry('Memory Sequence')).toContainText('0 Actions')
})

test('deleting a fixture removes it from actions', async ({ api, app }) => {
  await api.send({
    type: 'add-entity',
    entity: 'buttons',
    entry: {
      id: 'test',
      label: 'Dimmer Flash',
      down: [
        {
          type: 'fixture',
          members: ['dimmer'],
          state: { on: true },
          partial: true,
        },
        { type: 'channels', channels: { 20: 100 } },
      ],
      up: [],
    },
  })

  await deleteEntry(app, 'Fixtures', 'Dimmer')

  await app.openEntityConfig('Buttons')
  await expect(app.entityEntry('Dimmer Flash')).toContainText('1 Actions')
})

test('deleting a group replaces it with its members', async ({
  app,
  universe,
}) => {
  await deleteEntry(app, 'Fixture Groups', 'Pars')

  // memory
  await app.navigate('Memories')
  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 2: 255, 3: 255, 6: 255, 7: 255 })
  await app.toggleWidget('Red Pars')
  await universe.expectChannels({ 2: 0, 6: 0 })

  // live chase
  await app.navigate('Chases')
  await app.button('Start', app.widget('Red/Blue Chase')).click()
  await universe.expectChannels({ 2: 255, 6: 255 })
})

test('deleting a memory removes it from actions', async ({ app }) => {
  await deleteEntry(app, 'Memories', 'Red Pars')

  await app.openEntityConfig('Buttons')
  await expect(app.entityEntry('Red Pars')).toContainText('0 Actions')

  await app.openEntityConfig('Sequences')
  await expect(app.entityEntry('Memory Sequence')).toContainText('0 Actions')
})

test('deleting a named action removes it from actions', async ({
  api,
  app,
}) => {
  await api.send({
    type: 'add-entity',
    entity: 'buttons',
    entry: {
      id: 'test',
      label: 'Named',
      down: [{ type: 'action', ids: ['1'] }],
      up: [],
    },
  })

  await deleteEntry(app, 'Actions', 'Red Pars On')

  await app.openEntityConfig('Buttons')
  await expect(app.entityEntry('Named')).toContainText('0 Actions')
})
