import { Component } from 'react'
import { logger } from '@vlight/utils'

import { Button } from '../ui/buttons/button'
import { iconSync } from '../ui/icons'

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  error: Error | null
  stackTrace: string | null
  componentStack: string | null
}

/**
 * React error boundary component that catches rendering errors.
 */
export class ErrorBoundary extends Component<
  { children?: any },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    stackTrace: null,
    componentStack: null,
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.prepareError(error, info)
  }

  async prepareError(error: Error, { componentStack }: ErrorInfo) {
    if (this.state.error?.toString() === error.toString()) {
      return
    }

    let stackTrace = error.stack ?? null
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
    const { error } = this.state
    if (error) {
      return (
        <div>
          Error: {error.toString()}
          <br />
          <Button
            transparent
            icon={iconSync}
            onClick={() =>
              this.setState({
                error: null,
                componentStack: null,
                stackTrace: null,
              })
            }
          />
        </div>
      )
    }
    return this.props.children
  }
}
