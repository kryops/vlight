import { expect, Page } from '@playwright/test'

/**
 * Second browser page displaying the universe page, so tests can check the
 * DMX output without navigating away from the page under test.
 *
 * Also verifies that changes are synchronized between clients.
 */
export class Universe {
  constructor(readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/universe')
    await expect(
      this.page.getByRole('heading', { name: 'Universe' })
    ).toBeVisible()
  }

  meter(channel: number) {
    return this.page.getByRole('meter', {
      name: `Channel ${channel}`,
      exact: true,
    })
  }

  /** Waits until all given channels have the given values. */
  async expectChannels(channels: Record<number, number>): Promise<void> {
    for (const [channel, value] of Object.entries(channels)) {
      await expect(
        this.meter(Number(channel)),
        `Channel ${channel}`
      ).toHaveAttribute('aria-valuenow', String(value))
    }
  }

  /** Reads the current value of a channel. */
  async value(channel: number): Promise<number> {
    return Number(await this.meter(channel).getAttribute('aria-valuenow'))
  }

  /** Waits until the channel's value fulfills the predicate. */
  async expectChannel(
    channel: number,
    predicate: (value: number) => boolean,
    message?: string
  ): Promise<void> {
    await expect
      .poll(async () => predicate(await this.value(channel)), {
        message: message ?? `Channel ${channel}`,
      })
      .toBe(true)
  }
}
