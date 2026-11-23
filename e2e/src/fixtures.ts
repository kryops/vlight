import { test as base, expect } from '@playwright/test'
import { ApiInMessage } from '@vlight/types'

import { startServer, VLightServer } from './server'
import { App } from './helpers/app'
import { Universe } from './helpers/universe'

export interface VLightApi {
  /** Sends a message to the backend via the REST API, e.g. to arrange state. */
  send: (message: ApiInMessage) => Promise<void>
}

interface Fixtures {
  server: VLightServer
  api: VLightApi
  app: App
  universe: Universe
  /** The app in a second, independent browser context. */
  secondApp: App
}

/**
 * Test with vLight fixtures:
 * - every test gets a fresh read-only server with the E2E seed project
 * - `page` uses this server as `baseURL`
 */
export const test = base.extend<Fixtures>({
  server: async ({}, use, testInfo) => {
    const server = await startServer(testInfo.parallelIndex)
    await use(server)
    await server.stop()
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('server-output', {
        body: server.output(),
        contentType: 'text/plain',
      })
    }
  },

  baseURL: async ({ server }, use) => use(server.baseURL),

  api: async ({ request, server }, use) => {
    await use({
      send: async message => {
        const response = await request.post(`${server.baseURL}/api`, {
          data: message,
        })
        expect(await response.json()).toEqual({ ok: true })
      },
    })
  },

  app: async ({ page }, use) => {
    const app = new App(page)
    await app.open()
    await use(app)
  },

  secondApp: async ({ browser, server }, use) => {
    const context = await browser.newContext({ baseURL: server.baseURL })
    const app = new App(await context.newPage())
    await app.open()
    await use(app)
    await context.close()
  },

  universe: async ({ context }, use) => {
    const universe = new Universe(await context.newPage())
    await universe.open()
    await use(universe)
  },
})

export { expect }
