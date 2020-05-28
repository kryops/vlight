import React from 'react'

import { logError } from './log'

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  error?: Error
  stackTrace?: string
  componentStack?: string
}

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {}

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.prepareError(error, info)
  }

  async prepareError(error: Error, { componentStack }: ErrorInfo) {
    if (this.state.error?.toString() === error.toString()) {
      return
    }

    let stackTrace = error.stack
    try {
      const stacktraceJs = await import('stacktrace-js')
      stackTrace = (await stacktraceJs.fromError(error))
        .map(x => x.toString())
        .join('\n')
    } catch {
      // do nothing
    }

    logger.error('[ErrorBoundary]', error, stackTrace, componentStack)

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
