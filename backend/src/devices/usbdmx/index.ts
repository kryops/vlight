import { HID } from 'node-hid'

export async function initUsbDmxDevices() {
  // TODO
  // console.log('DEVICES', hid.devices())

  const device = new HID(1204, 3871)

  console.log(device)

  setMode(device)

  setInterval(() => {
    setChannel(device)
  }, 20)
}

function setMode(device: HID) {
  const foobar = new Array(34).fill(0)
  foobar[0] = 16
  // Modes:
  // 0: Do nothing - Standby
  // 1: DMX In -> DMX Out
  // 2: PC Out -> DMX Out
  // 3: DMX In + PC Out -> DMX Out
  // 4: DMX In -> PC In
  // 5: DMX In -> DMX Out & DMX In -> PC In
  // 6: PC Out -> DMX Out & DMX In -> PC In
  // 7: DMX In + PC Out -> DMX Out & DMX In -> PC In
  foobar[1] = 2
  device.write(foobar)
}

let value = 0

function setChannel(device: HID) {
  value = (value + 1) % 255
  const foobar = new Array(34).fill(0)
  foobar[0] = 0
  // blocks of 32 channels
  foobar[1] = 0
  foobar[2] = value
  device.write(foobar)
}
