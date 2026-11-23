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

  async toggle(name: string): Promise<void> {
    await this.dialog.getByRole('button', { name, exact: true }).click()
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
