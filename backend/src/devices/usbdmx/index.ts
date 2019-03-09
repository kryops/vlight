import { Device, HID } from 'node-hid'
import usbDetection from 'usb-detection'

import {
  devicesFlushInterval,
  enableUsbDmxDevices,
  universeSize,
  usbDmxPid,
  usbDmxVid,
} from '../../config'
import { onWindows } from '../../env'
import { getDmxUniverse } from '../../universe'
import { logTrace, shouldLogTrace } from '../../util/log'
import { delay } from '../../util/time'

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

function flushUniverse(device: HIDWithInfo) {
  const numberOfBlocks = Math.ceil(universeSize / blockSize)
  for (let block = 0; block < numberOfBlocks; block++) {
    writeToUsbDmxDevice(device, getChannelBlockMessage(getDmxUniverse(), block))
  }
}

async function initDevice(device: HIDWithInfo) {
  if (onWindows) {
    await delay(100)
  }
  writeToUsbDmxDevice(device, getModeMessage())
  flushUniverse(device)

  usbDmxDevices.push(device)
}

export function setChannelChangedForUsbDmxDevices(channel: number) {
  if (!enableUsbDmxDevices || !usbDmxDevices.length) {
    return
  }

  const block = Math.floor(channel / blockSize)
  changedBlocks.add(block)
}

export function initUsbDmxDevices() {
  if (!enableUsbDmxDevices) {
    return
  }

  usbDetection.on(`add:${usbDmxVid}:${usbDmxPid}`, async () => {
    // linux seems to need a bit of time here
    await delay(100)
    connectUsbDmxDevices(initDevice)
  })
  usbDetection.on(`remove:${usbDmxVid}:${usbDmxPid}`, disconnectUsbDmxDevices)
  usbDetection.startMonitoring()

  setInterval(flushUsbDmxDevices, devicesFlushInterval)

  connectUsbDmxDevices(initDevice)
}

process.on('exit', () => {
  try {
    usbDetection.stopMonitoring()
  } catch {
    // do nothing
  }
})
