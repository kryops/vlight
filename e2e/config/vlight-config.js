// Configuration for the E2E tests.
// The HTTP port is set per test via the VLIGHT_HTTP_PORT environment variable.

// @ts-check
/** @type {Partial<import('../../backend/src/services/config').VLightConfiguration>} */
const userConfig = {
  project: 'e2e',
  logLevel: 'warn',
  readOnly: true,
  enableUsbDmxDevices: false,
  enableVLightDevices: false,
  enableArtNetDevices: false,
}

module.exports = userConfig
