import { Device, devices, HID } from 'node-hid'
import { platform } from 'os'
import usbDetection from 'usb-detection'

import {
  devicesFlushInterval,
  universeSize,
  usbDmxPid,
  usbDmxVid,
} from '../../config'
import { getDmxUniverse } from '../../universe'
import { removeFromMutableArray } from '../../util/array'
import { logError, logInfo, logWarn } from '../../util/log'

import { blockSize, getChannelBlockMessage, getModeMessage } from './protocol'

interface HIDWithInfo extends HID {
  info: Device
}

const onWindows = platform() === 'win32'
const changedBlocks: Set<number> = new Set<number>()
const usbDmxDevices: HIDWithInfo[] = []

function doWrite(device: HIDWithInfo, message: number[]) {
  const messageToSend = onWindows
    ? [0, ...message] // https://github.com/node-hid/node-hid#prepend-byte-to-hid_write
    : message

  try {
    device.write(messageToSend)
  } catch (e) {
    logError('Error writing to UsbDmx device, disconnecting...', e)
    device.close()
    removeFromMutableArray(usbDmxDevices, device)
  }
}

function flushUsbDmxDevices() {
  if (changedBlocks.size === 0) {
    return
  }

  for (const block of changedBlocks) {
    const message = getChannelBlockMessage(getDmxUniverse(), block)
    usbDmxDevices.forEach(device => doWrite(device, message))
  }

  changedBlocks.clear()
}

function flushUniverse(device: HIDWithInfo) {
  const numberOfBlocks = Math.ceil(universeSize / blockSize)
  for (let block = 0; block < numberOfBlocks; block++) {
    doWrite(device, getChannelBlockMessage(getDmxUniverse(), block))
  }
}

function connectUsbDmxDevices() {
  devices()
    .filter(
      deviceInfo =>
        deviceInfo.vendorId === usbDmxVid &&
        deviceInfo.productId === usbDmxPid &&
        (!deviceInfo.path ||
          !usbDmxDevices.find(other => other.info.path === deviceInfo.path))
    )
    .forEach(deviceInfo => {
      try {
        const device: HIDWithInfo = new HID(usbDmxVid, usbDmxPid) as HIDWithInfo

        device.info = deviceInfo

        logInfo('UsbDmx device connected:', deviceInfo.path)

        doWrite(device, getModeMessage())
        flushUniverse(device)

        usbDmxDevices.push(device)

        device.on('error', e => {
          logWarn('UsbDmx device error, disconnecting:', e)
          removeFromMutableArray(usbDmxDevices, device)
        })
      } catch (e) {
        logWarn('Error connecting UsbDmx device:', e)
      }
    })
}

function disconnectUsbDmxDevices() {
  const paths = devices()
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
      logInfo('UsbDmx device disconnected:', device.info.path)
      device.close()
      removeFromMutableArray(usbDmxDevices, device)
    })
}

export function setChannelChangedForUsbDmxDevices(channel: number) {
  const block = Math.floor(channel / blockSize)
  changedBlocks.add(block)
}

export async function initUsbDmxDevices() {
  usbDetection.on(`add:${usbDmxVid}:${usbDmxPid}`, connectUsbDmxDevices)
  usbDetection.on(`remove:${usbDmxVid}:${usbDmxPid}`, disconnectUsbDmxDevices)
  usbDetection.startMonitoring()

  setInterval(flushUsbDmxDevices, devicesFlushInterval)

  connectUsbDmxDevices()
}

process.on('exit', () => {
  usbDetection.stopMonitoring()
})
