import { expect, Locator } from '@playwright/test'

/**
 * Custom vertical fader (`role="slider"`), operated via pointer.
 */
export class Fader {
  constructor(readonly locator: Locator) {}

  /** Drags the fader to the given fraction (0 = bottom, 1 = top). */
  async dragTo(fraction: number): Promise<void> {
    const box = await this.locator.boundingBox()
    if (!box) throw new Error('Fader is not visible')
    const x = box.x + box.width / 2
    const page = this.locator.page()

    await page.mouse.move(x, box.y + box.height / 2)
    await page.mouse.down()
    // overshoot so 0 and 1 are reached reliably despite the button size
    const target = fraction <= 0 ? box.height + 10 : fraction >= 1 ? -10 : 0
    const y =
      fraction > 0 && fraction < 1
        ? box.y + box.height * (1 - fraction)
        : box.y + target
    await page.mouse.move(x, y, { steps: 5 })
    await page.mouse.up()
  }

  async expectValue(value: number): Promise<void> {
    await expect(this.locator).toHaveAttribute('aria-valuenow', String(value))
  }
}
