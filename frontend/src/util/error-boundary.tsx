import React from 'react'
import { fromError } from 'stacktrace-js'

import { logError } from './log'

interface ErrorInfo {
  componentStack: string
}

interface State {
  error?: Error
  stackTrace?: string
  componentStack?: string
}

export class ErrorBoundary extends React.Component<{}, State> {
  state: State = {}

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.prepareError(error, info)
  }

  async prepareError(error: Error, { componentStack }: ErrorInfo) {
    if (this.state.error && this.state.error.toString() === error.toString()) {
      return
    }

    let stackTrace = error.stack
    try {
      stackTrace = (await fromError(error)).map(x => x.toString()).join('\n')
    } catch {
      // do nothing
    }

    logError('[ErrorBoundary]', error, stackTrace, componentStack)

    this.setState({ error, stackTrace, componentStack })
  }

  render() {
    const { error, componentStack, stackTrace } = this.state
    if (error) {
      return (
        <div>
          {error.toString()}
          <hr />
          <pre>{stackTrace}</pre>
          <hr />
          <pre>{componentStack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}