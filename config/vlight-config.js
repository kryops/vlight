// Use this file to override the default configuration
// found in /backend/src/config.ts

/** @type {import('../backend/src/config').VLightConfiguration} */
const userConfig = {
  enableUsbDmxDevices: false,
  enableVLightDevices: false,
  enableArtNetDevices: false,
}

module.exports = userConfig
