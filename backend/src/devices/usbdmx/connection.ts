import { Device, HID } from 'node-hid'
import { removeFromMutableArray, logger } from '@vlight/utils'

import { usbDmxPid, usbDmxVid } from '../../services/config'
import { onWindows } from '../../services/env'

import { HIDWithInfo, usbDmxDevices, bannedDevices } from '.'

function connectWithFallback(deviceInfo: Device) {
  if (deviceInfo.path) {
    try {
      return new HID(deviceInfo.path)
    } catch (e) {
      logger.warn(
        'UsbDmx connecting failed using path, trying via VID/PID...',
        deviceInfo.path,
        e
      )
    }
  }

  return new HID(usbDmxVid, usbDmxPid)
}

export async function connectUsbDmxDevices(
  callback: (device: HIDWithInfo) => void
): Promise<void> {
  const hid: typeof import('node-hid') = require('node-hid') // eslint-disable-line

  hid
    .devices()
    .filter(
      deviceInfo =>
        deviceInfo.vendorId === usbDmxVid &&
        deviceInfo.productId === usbDmxPid &&
        (!deviceInfo.path ||
          (!usbDmxDevices.find(other => other.info.path === deviceInfo.path) &&
            !bannedDevices.has(deviceInfo.path)))
    )
    .forEach(deviceInfo => {
      try {
        const device = connectWithFallback(deviceInfo) as HIDWithInfo
        device.info = deviceInfo

        device.on('error', e => {
          logger.error('UsbDmx device error, disconnecting:', e)
          removeFromMutableArray(usbDmxDevices, device)
        })

        logger.info('UsbDmx device connected:', deviceInfo.path)

        callback(device)
      } catch (e) {
        logger.error('Error connecting UsbDmx device:', e)
      }
    })
}

export async function disconnectUsbDmxDevices(): Promise<void> {
  const hid: typeof import('node-hid') = require('node-hid') // eslint-disable-line
  const paths = hid
    .devices()
    .filter(
      deviceInfo =>
        deviceInfo.vendorId === usbDmxVid &&
        deviceInfo.productId === usbDmxPid &&
        deviceInfo.path
    )
    .map(device => device.path!)

  usbDmxDevices
    .filter(device => device.info.path && !paths.includes(device.info.path))
    .forEach(device => {
      logger.info('UsbDmx device disconnected:', device.info.path)
      device.close()
      removeFromMutableArray(usbDmxDevices, device)
    })
}

export function writeToUsbDmxDevice(
  device: HIDWithInfo,
  message: number[]
): boolean {
  const messageToSend =
    onWindows && message[0] !== 0
      ? [0, ...message] // https://github.com/node-hid/node-hid#prepend-byte-to-hid_write
      : message

  try {
    device.write(messageToSend)
  } catch (e) {
    logger.error('Error writing to UsbDmx device, disconnecting...', e)
    device.close()
    removeFromMutableArray(usbDmxDevices, device)
    return false
  }

  return true
}

process.on('exit', () => {
  try {
    usbDmxDevices.forEach(device => device.close())
  } catch {
    // do nothing
  }
})
