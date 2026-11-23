import { expect, Locator } from '@playwright/test'

/**
 * Custom vertical fader (`role="slider"`), operated via pointer.
 */
export class Fader {
  constructor(readonly locator: Locator) {}

  /** Drags the fader to the given fraction (0 = bottom, 1 = top). */
  async dragTo(fraction: number): Promise<void> {
    await this.locator.scrollIntoViewIfNeeded()
    const box = await this.locator.boundingBox()
    if (!box) throw new Error('Fader is not visible')
    const x = box.x + box.width / 2
    const page = this.locator.page()

    await page.mouse.move(x, box.y + box.height / 2)
    await page.mouse.down()
    // overshoot so 0 and 1 are reached reliably despite the button size
    const y =
      fraction <= 0
        ? box.y + box.height + 10
        : fraction >= 1
          ? box.y - 10
          : box.y + box.height * (1 - fraction)
    await page.mouse.move(x, y, { steps: 5 })
    await page.mouse.up()
  }

  /** Scrolls the mouse wheel over the fader with a modifier key pressed. */
  async wheel(direction: 1 | -1, times = 1): Promise<void> {
    await this.locator.hover()
    const page = this.locator.page()
    await page.keyboard.down('Shift')
    for (let i = 0; i < times; i++) {
      await page.mouse.wheel(0, direction * -100)
    }
    await page.keyboard.up('Shift')
  }

  async expectValue(value: number): Promise<void> {
    await expect(this.locator).toHaveAttribute('aria-valuenow', String(value))
  }

  async value(): Promise<number> {
    return Number(await this.locator.getAttribute('aria-valuenow'))
  }
}
