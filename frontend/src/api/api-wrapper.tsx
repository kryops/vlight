import { ApiOutMessage } from '@vlight/api'
import React, { Component } from 'react'

import { ChannelUniverseContext, DmxUniverseContext } from '../api'
import { logError, logInfo, logTrace, logWarn } from '../util/log'

import { setSocket } from '.'

interface State {
  connecting: boolean
  universe: number[] | undefined
  channels: number[] | undefined
}

export class ApiWrapper extends Component<{}, State> {
  state = {
    connecting: true,
    universe: undefined,
    channels: undefined,
  }

  socket: WebSocket | undefined

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
        this.handleApiMessage(message)
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

  handleApiMessage(message: ApiOutMessage) {
    logTrace('WebSocket message', message)

    switch (message.type) {
      case 'state':
        const { universe, channels } = message
        this.setState({ universe, channels })
        break

      case 'universe':
        this.setState({ channels: message.universe })
        break

      case 'universe-delta':
        this.setState(state => {
          const newUniverse = [...(state.universe || [])]
          for (const channel of Object.keys(message.channels)) {
            newUniverse[+channel - 1] = message.channels[channel as any]
          }
          return { universe: newUniverse }
        })
        break

      case 'channels':
        this.setState(state => {
          const newChannels = [...(state.channels || [])]
          for (const channel of Object.keys(message.channels)) {
            newChannels[+channel - 1] = message.channels[channel as any]
          }
          return { channels: newChannels }
        })
        break

      default:
        logError('Invalid API message received:', message)
    }
  }

  componentDidMount() {
    this.connectWebSocket()
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close()
    }
    setSocket(undefined)
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
