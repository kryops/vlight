// oxlint-disable-next-line import/no-nodejs-modules
import { join } from 'node:path'

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import wyw from '@wyw-in-js/vite'
import browserslist from 'browserslist'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: {
      // transpile from sources in frontend build
      '@vlight/controls': join(import.meta.dirname, '../shared/controls/src'),
      '@vlight/utils': join(import.meta.dirname, '../shared/utils/src'),
    },
  },
  define: {
    // needed for emittery dependency
    'process.env.DEBUG': JSON.stringify(false),
  },
  plugins: [
    wyw({
      sourceMap: true,
      importOverrides: {
        // evaluated at build time via a runtime require()
        polished: { unknown: 'allow' },
        '@mdi/js': { unknown: 'allow' },
        // api-state starts the API worker, which cannot be evaluated at build time
        './src/api/api-state.ts': {
          mock: './src/util/wyw-api-state-stub.ts',
        },
      },
    }),
    react(),
    // only adds the core-js polyfills that are used and missing in the
    // browsers listed in .browserslistrc
    legacy({
      renderLegacyChunks: false,
      modernPolyfills: true,
      modernTargets: browserslist(null, { path: import.meta.dirname }),
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    port: 8001,
    open: true,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:8000/',
      '/websocket': { target: 'ws://localhost:8000/', ws: true },
    },
  },
})
