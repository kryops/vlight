import { ChildProcess, spawn } from 'node:child_process'
import { join } from 'node:path'

const rootDirectory = join(__dirname, '../..')
const backendEntry = join(rootDirectory, 'backend/dist/index.js')
const configDirectory = join(__dirname, '../config')

const basePort = 9100
const startupTimeout = 10_000

export interface VLightServer {
  baseURL: string
  /** Everything the server wrote to stdout/stderr. */
  output: () => string
  stop: () => Promise<void>
}

async function waitUntilReachable(url: string, process: ChildProcess) {
  const deadline = Date.now() + startupTimeout
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Server exited with code ${process.exitCode}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // not started yet
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  throw new Error(`Server did not start within ${startupTimeout}ms`)
}

/**
 * Starts a read-only vLight server with the E2E config.
 *
 * As tests within a worker run sequentially, the port only depends on the worker index.
 */
export async function startServer(workerIndex: number): Promise<VLightServer> {
  const port = basePort + workerIndex
  const baseURL = `http://127.0.0.1:${port}`

  let output = ''
  const serverProcess = spawn(process.execPath, [backendEntry], {
    cwd: rootDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VLIGHT_CONFIG_DIR: configDirectory,
      VLIGHT_HTTP_PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  serverProcess.stdout?.on('data', data => (output += data))
  serverProcess.stderr?.on('data', data => (output += data))

  const exited = new Promise<void>(resolve =>
    serverProcess.once('exit', () => resolve())
  )

  const stop = async () => {
    if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL')
    await exited
  }

  try {
    await waitUntilReachable(baseURL, serverProcess)
  } catch (error) {
    await stop()
    throw new Error(`${(error as Error).message}\n\n${output}`)
  }

  return { baseURL, output: () => output, stop }
}
