// Use this file to override the default configuration
// found in /backend/src/config.ts

// @ts-check
/** @type {Partial<import('../backend/src/services/config').VLightConfiguration>} */
const userConfig = {
  project: 'mgv',
  enableUsbDmxDevices: true,
  enableVLightDevices: false,
  enableArtNetDevices: false,
}

module.exports = userConfig
