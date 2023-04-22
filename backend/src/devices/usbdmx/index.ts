import { Device, HID } from 'node-hid'
import { LogLevel, logger } from '@vlight/utils'

import {
  devicesFlushInterval,
  enableUsbDmxDevices,
  universeSize,
  usbDmxPid,
  usbDmxVid,
  logLevel,
} from '../../services/config'
import { onWindows } from '../../services/env'
import { getDmxUniverse } from '../../services/universe'
import { delay, howLong } from '../../util/time'
import { deviceRegistry } from '../registry'

import {
  connectUsbDmxDevices,
  disconnectUsbDmxDevices,
  writeToUsbDmxDevice,
} from './connection'
import { blockSize, getChannelBlockMessage, getModeMessage } from './protocol'

export interface HIDWithInfo extends HID {
  info: Device
}

/** Set of block numbers that contain changed channels awaiting to be flushed to the devices. */
const changedBlocks: Set<number> = new Set<number>()

/** Array of all currently connected USB DMX devices */
export const usbDmxDevices: HIDWithInfo[] = []

/**
 * Devices that aren't plugged into power try to connect, but then fail receiving
 * messages. We ban them, and clear the list periodically to retry
 */
export const bannedDevices = new Set<string>()

/**
 * Flushes all DMX universe changes to all connected devices.
 */
function flushUsbDmxDevices() {
  if (!usbDmxDevices.length || changedBlocks.size === 0) {
    return
  }

  for (const block of changedBlocks) {
    const message = getChannelBlockMessage(getDmxUniverse(), block)
    if (logLevel === LogLevel.Trace) {
      logger.trace(`broadcast UsbDmx message: <${message.join(' ')}>`)
    }
    usbDmxDevices.forEach(device => writeToUsbDmxDevice(device, message))
  }

  changedBlocks.clear()
}

/**
 * Flushes the complete DMX universe to the given device.
 */
function flushUniverse(device: HIDWithInfo): boolean {
  const numberOfBlocks = Math.ceil(universeSize / blockSize)
  for (let block = 0; block < numberOfBlocks; block++) {
    if (
      !writeToUsbDmxDevice(
        device,
        getChannelBlockMessage(getDmxUniverse(), block)
      )
    ) {
      return false
    }
  }
  return true
}

async function initDevice(device: HIDWithInfo) {
  if (onWindows) {
    await delay(100)
  }
  const success =
    writeToUsbDmxDevice(device, getModeMessage()) && flushUniverse(device)

  if (success) {
    usbDmxDevices.push(device)
  } else if (device.info.path) {
    logger.warn(`Adding ${device.info.path} to banned UsbDmx devices`)
    bannedDevices.add(device.info.path)
  }
}

function clearBannedDevices() {
  if (!bannedDevices.size) return

  logger.info('Clearing banned UsbDmx devices')
  bannedDevices.clear()
  connectUsbDmxDevices(initDevice)
}

function broadcastUniverseChannel(channel: number) {
  if (!enableUsbDmxDevices || !usbDmxDevices.length) {
    return
  }

  const block = Math.floor((channel - 1) / blockSize)
  changedBlocks.add(block)
}

export async function init(): Promise<void> {
  if (!enableUsbDmxDevices) {
    return
  }
  const start = Date.now()
  const usbDetection: typeof import('usb-detection') = require('usb-detection') // eslint-disable-line

  usbDetection.on(`add:${usbDmxVid}:${usbDmxPid}`, async () => {
    // linux seems to need a bit of time here
    await delay(100)
    connectUsbDmxDevices(initDevice)
  })
  usbDetection.on(`remove:${usbDmxVid}:${usbDmxPid}`, disconnectUsbDmxDevices)
  usbDetection.startMonitoring()

  setInterval(flushUsbDmxDevices, devicesFlushInterval)
  setInterval(clearBannedDevices, 30000)

  await connectUsbDmxDevices(initDevice)

  deviceRegistry.register({ broadcastUniverseChannel })

  howLong(start, 'initUsbDmxDevices')
}

process.on('exit', () => {
  if (!enableUsbDmxDevices) return
  try {
    const usbDetection: typeof import('usb-detection') = require('usb-detection') // eslint-disable-line
    usbDetection.stopMonitoring()
  } catch {
    // do nothing
  }
})
