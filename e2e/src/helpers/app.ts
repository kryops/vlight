import { expect, Locator, Page } from '@playwright/test'

import { EntityEditor } from './entity-editor'
import { Fader } from './fader'

/**
 * Entry point for interacting with the vLight UI.
 */
export class App {
  constructor(readonly page: Page) {}

  get navigation(): Locator {
    return this.page.getByRole('navigation', { name: 'Main' })
  }

  /** Opens the app and waits until it is connected to the backend. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path)
    await expect(this.navigation).toBeVisible()
  }

  /** Navigates via the main navigation, e.g. `navigate('Fixture Groups')`. */
  async navigate(label: string): Promise<void> {
    await this.navigation.getByRole('link', { name: label }).click()
  }

  /** Opens the config page for an entity type, e.g. `openEntityConfig('Fixture Groups')`. */
  async openEntityConfig(name: string): Promise<void> {
    await this.navigate('Config')
    await this.page
      .getByRole('main')
      .getByRole('link', { name, exact: true })
      .click()
    await expect(this.page.getByRole('heading', { name })).toBeVisible()
  }

  /** Widget by its title. */
  widget(title: string | RegExp): Locator {
    return this.page.getByRole('region', { name: title })
  }

  /** The currently open modal dialog. */
  get dialog(): Locator {
    return this.page.getByRole('dialog')
  }

  entityEditor(): EntityEditor {
    return new EntityEditor(this.dialog)
  }

  fader(name: string, container: Locator | Page = this.page): Fader {
    return new Fader(container.getByRole('slider', { name, exact: true }))
  }

  /** Read-only DMX channel display, e.g. on the universe page. */
  channelMeter(channel: number): Locator {
    return this.page.getByRole('meter', {
      name: `Channel ${channel}`,
      exact: true,
    })
  }
}
