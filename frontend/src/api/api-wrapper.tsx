import { ApiInMessage, ApiOutMessage } from '@vlight/api'
import React, { Component } from 'react'

import { ChannelUniverseContext, DmxUniverseContext } from '../api'
import { socketProcessingInterval } from '../config'
import { logError, logInfo, logTrace, logWarn } from '../util/log'

import { setSocket } from '.'

interface State {
  connecting: boolean
  universe: number[] | undefined
  channels: number[] | undefined
}

function processDelta(
  universe: number[] | undefined,
  message: { [channel: number]: number }
) {
  const newUniverse = [...(universe || [])]
  for (const [channel, value] of Object.entries(message)) {
    newUniverse[+channel - 1] = value
  }
  return newUniverse
}

function processApiMessage(message: ApiOutMessage, state: Partial<State>) {
  switch (message.type) {
    case 'state':
      state.universe = message.universe
      state.channels = message.channels
      break

    case 'universe':
      state.universe = message.universe
      break

    case 'universe-delta':
      state.universe = processDelta(state.universe, message.channels)
      break

    case 'channels':
      state.channels = processDelta(state.channels, message.channels)
      break

    default:
      logError('Invalid API message received:', message)
  }
}

export class ApiWrapper extends Component<{}, State> {
  state = {
    connecting: true,
    universe: undefined,
    channels: undefined,
  }

  socket: WebSocket | undefined
  interval: number | undefined
  messageQueue: ApiInMessage[] = []

  connectWebSocket() {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)

    this.socket = socket
    setSocket(socket)

    socket.onopen = () => {
      logInfo('WebSocket connection established')
      this.setState({ connecting: false })
    }

    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        logTrace('WebSocket message', message)
        this.messageQueue.push(message)
      } catch (e) {
        logError('WebSocket message parse error', e, 'message was:', event.data)
      }
    }

    socket.onclose = () => {
      logWarn('WebSocket connection was closed, reconnecting...')
      this.setState({ connecting: true }, () => {
        setTimeout(() => this.connectWebSocket(), 1000)
      })
    }

    socket.onerror = e => logError('WebSocket error', e)
  }

  processMessageQueue() {
    if (!this.messageQueue.length) {
      return
    }

    logTrace(`Processing ${this.messageQueue.length} WebSocket messages`)

    const newState: Pick<State, keyof State> = { ...this.state }

    for (const message of this.messageQueue) {
      processApiMessage(message, newState)
    }

    this.messageQueue = []
    this.setState(newState)
  }

  componentDidMount() {
    this.connectWebSocket()
    this.interval = window.setInterval(
      () => this.processMessageQueue(),
      socketProcessingInterval
    )
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close()
    }
    setSocket(undefined)
    window.clearInterval(this.interval)
  }

  render() {
    if (this.state.connecting) {
      return <div>Loading...</div>
    }
    return (
      <DmxUniverseContext.Provider value={this.state.universe}>
        <ChannelUniverseContext.Provider value={this.state.channels}>
          {this.props.children}
        </ChannelUniverseContext.Provider>
      </DmxUniverseContext.Provider>
    )
  }
}
