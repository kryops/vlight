import { Device, HID } from 'node-hid'

import {
  devicesFlushInterval,
  enableUsbDmxDevices,
  universeSize,
  usbDmxPid,
  usbDmxVid,
} from '../../config'
import { onWindows } from '../../env'
import { getDmxUniverse } from '../../services/universe'
import { logTrace, shouldLogTrace, logWarn, logInfo } from '../../util/log'
import { delay, howLong } from '../../util/time'

import {
  connectUsbDmxDevices,
  disconnectUsbDmxDevices,
  writeToUsbDmxDevice,
} from './connection'
import { blockSize, getChannelBlockMessage, getModeMessage } from './protocol'

export interface HIDWithInfo extends HID {
  info: Device
}

const changedBlocks: Set<number> = new Set<number>()
export const usbDmxDevices: HIDWithInfo[] = []
/**
 * Devices that aren't plugged into power try to connect, but then fail receiving
 * messages. We ban them, and clear the list periodically to retry
 */
export const bannedDevices = new Set<string>()

function flushUsbDmxDevices() {
  if (!usbDmxDevices.length || changedBlocks.size === 0) {
    return
  }

  for (const block of changedBlocks) {
    const message = getChannelBlockMessage(getDmxUniverse(), block)
    if (shouldLogTrace) {
      logTrace(`broadcast UsbDmx message: <${message.join(' ')}>`)
    }
    usbDmxDevices.forEach(device => writeToUsbDmxDevice(device, message))
  }

  changedBlocks.clear()
}

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
    logWarn(`Adding ${device.info.path} to banned UsbDmx devices`)
    bannedDevices.add(device.info.path)
  }
}

function clearBannedDevices() {
  if (!bannedDevices.size) return

  logInfo('Clearing banned UsbDmx devices')
  bannedDevices.clear()
  connectUsbDmxDevices(initDevice)
}

export function setChannelChangedForUsbDmxDevices(channel: number) {
  if (!enableUsbDmxDevices || !usbDmxDevices.length) {
    return
  }

  const block = Math.floor(channel / blockSize)
  changedBlocks.add(block)
}

export async function initUsbDmxDevices() {
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
