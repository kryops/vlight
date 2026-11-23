import { expect, Locator } from '@playwright/test'

/**
 * The modal dialog to create or edit a master data entity.
 */
export class EntityEditor {
  constructor(readonly dialog: Locator) {}

  async fill(label: string, value: string): Promise<void> {
    await this.dialog.getByLabel(label, { exact: true }).fill(value)
  }

  async select(label: string, option: string): Promise<void> {
    await this.dialog.getByLabel(label, { exact: true }).selectOption(option)
  }

  async toggle(name: string | RegExp): Promise<void> {
    await this.dialog.getByRole('button', { name, exact: true }).click()
  }

  async check(name: string | RegExp): Promise<void> {
    await this.dialog.getByRole('checkbox', { name }).click()
  }

  /**
   * Selects entities in a fixture list input, e.g.
   * `selectMembers('Fixture', 'Par 1')` or `selectMembers('Group', /^Pars/)`.
   */
  async selectMembers(
    category: string,
    ...entries: Array<string | RegExp>
  ): Promise<void> {
    await this.toggle(category)
    for (const entry of entries) await this.toggle(entry)
  }

  async save(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Ok', exact: true }).click()
    await expect(this.dialog).toBeHidden()
  }

  async cancel(): Promise<void> {
    await this.dialog
      .getByRole('button', { name: 'Cancel', exact: true })
      .click()
    await expect(this.dialog).toBeHidden()
  }
}
