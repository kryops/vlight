import { ApiOutMessage } from '@vlight/api'
import React, { Component } from 'react'

import { isDevelopment } from './config'
import { UniverseContext } from './context'
import { logError, logTrace } from './util/log'

interface State {
  connecting: boolean
  universe?: number[]
}

export class ApiWrapper extends Component<{}, State> {
  state = {
    connecting: true,
    universe: undefined,
  }

  socket: WebSocket | undefined

  connectWebSocket() {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)

    this.socket = socket
    if (isDevelopment) {
      ;(window as any).socket = socket
    }

    socket.onopen = () => this.setState({ connecting: false })

    socket.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        this.handleApiMessage(message)
      } catch (e) {
        logError('WebSocket message parse error', e, 'message was:', event.data)
      }
    }

    socket.onclose = () => {
      this.setState({ connecting: true }, () => {
        setTimeout(() => this.connectWebSocket(), 1000)
      })
    }

    socket.onerror = e => logError('WebSocket error', e)
  }

  handleApiMessage(message: ApiOutMessage) {
    logTrace('WebSocket message', message)

    switch (message.type) {
      case 'universe':
        this.setState({ universe: message.universe })
        break

      case 'channels':
        this.setState(state => {
          const universe = [...(state.universe || [])]
          for (const channel of Object.keys(message.channels)) {
            universe[+channel] = message.channels[channel as any]
          }
          return { universe }
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
  }

  render() {
    if (this.state.connecting) {
      return null
    }
    return (
      <UniverseContext.Provider value={this.state.universe}>
        {this.props.children}
      </UniverseContext.Provider>
    )
  }
}
