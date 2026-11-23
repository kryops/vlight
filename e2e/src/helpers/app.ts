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

  get main(): Locator {
    return this.page.getByRole('main')
  }

  /** Opens the app and waits until it is connected to the backend. */
  async open(path = '/'): Promise<void> {
    await this.page.goto(path)
    await expect(this.navigation).toBeVisible()
  }

  /** Navigates via the main navigation, e.g. `navigate('Fixture Groups')`. */
  async navigate(label: string): Promise<void> {
    await this.navigation
      .getByRole('link', { name: label, exact: true })
      .click()
  }

  /** Opens the config page for an entity type, e.g. `openEntityConfig('Fixture Groups')`. */
  async openEntityConfig(name: string): Promise<void> {
    await this.navigate('Config')
    await this.main.getByRole('link', { name, exact: true }).click()
    await expect(this.page.getByRole('heading', { name })).toBeVisible()
  }

  /** The page's level 1 heading. */
  get heading(): Locator {
    return this.main.getByRole('heading', { level: 1 })
  }

  /** Widget by its title. */
  widget(title: string | RegExp): Locator {
    return this.main.getByRole('region', { name: title, exact: true })
  }

  /** Clicks a widget's title, which usually turns it on or off. */
  async toggleWidget(title: string | RegExp): Promise<void> {
    await this.widget(title)
      .getByRole('button', { name: title, exact: true })
      .first()
      .click()
  }

  /**
   * Entry in an entity config list, by the start of its displayed text.
   * Clicking it opens the editor.
   */
  entityEntry(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return this.main
      .getByRole('button', { name: new RegExp(`^${escaped}(?!\\w)`) })
      .filter({ hasNot: this.page.getByRole('button', { name: 'Copy' }) })
  }

  /** Copy/Delete buttons of an entity config list entry. */
  entityEntryAction(name: string, action: 'Copy' | 'Delete'): Locator {
    return this.entityEntry(name)
      .locator('..')
      .getByRole('button', { name: action, exact: true })
  }

  button(name: string | RegExp, container: Locator = this.main): Locator {
    return container.getByRole('button', { name, exact: true })
  }

  /** The currently open modal dialog. */
  get dialog(): Locator {
    return this.page.getByRole('dialog')
  }

  /** Confirms a yes/no dialog. */
  async confirm(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Yes', exact: true }).click()
    await expect(this.dialog).toBeHidden()
  }

  entityEditor(): EntityEditor {
    return new EntityEditor(this.dialog)
  }

  fader(name: string, container: Locator = this.main): Fader {
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
