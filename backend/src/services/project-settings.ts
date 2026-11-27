import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

import {
  ApiProjectSettingsMessage,
  MapSettings,
  ProjectSettings,
} from '@vlight/types'
import { logger } from '@vlight/utils'

import { howLong } from '../util/time'

import { configDirectoryPath, project, readOnly } from './config'
import { registerApiMessageHandler } from './api/registry'
import { broadcastToSockets } from './http/websocket'

const settingsFileName = 'settings.json'

const maxMapDimension = 10000

function getDefaultProjectSettings(): ProjectSettings {
  return {
    map: { width: 100, height: 100 },
  }
}

/** The current project settings. */
let projectSettings: ProjectSettings = getDefaultProjectSettings()

/**
 * Returns the current project settings.
 */
export function getProjectSettings(): ProjectSettings {
  return projectSettings
}

function isValidMapDimension(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= maxMapDimension
  )
}

/**
 * Merges the given (untrusted) settings into the given base settings,
 * ignoring any invalid values.
 */
function mergeProjectSettings(
  base: ProjectSettings,
  input: unknown
): ProjectSettings {
  const result: ProjectSettings = { ...base, map: { ...base.map } }
  if (!input || typeof input !== 'object') return result

  const { map } = input as Partial<Record<keyof ProjectSettings, unknown>>
  if (map && typeof map === 'object') {
    const { width, height } = map as Partial<Record<keyof MapSettings, unknown>>
    if (isValidMapDimension(width)) result.map.width = width
    if (isValidMapDimension(height)) result.map.height = height
  }

  return result
}

function getSettingsFilePath() {
  return join(configDirectoryPath, project, settingsFileName)
}

async function loadProjectSettings(): Promise<ProjectSettings> {
  let content: string
  try {
    content = await readFile(getSettingsFilePath(), 'utf-8')
  } catch {
    // no settings file (yet)
    return getDefaultProjectSettings()
  }
  try {
    return mergeProjectSettings(
      getDefaultProjectSettings(),
      JSON.parse(content)
    )
  } catch (e) {
    logger.error('Parsing project settings failed:', e)
    return getDefaultProjectSettings()
  }
}

async function persistProjectSettings(settings: ProjectSettings) {
  if (readOnly) return
  try {
    const filePath = getSettingsFilePath()
    await mkdir(join(filePath, '..'), { recursive: true })
    await writeFile(filePath, JSON.stringify(settings, null, 2) + '\n')
  } catch (e) {
    logger.error('Persisting project settings failed:', e)
  }
}

/**
 * Loads the project settings and registers the API message handler to change them.
 */
export async function initProjectSettings(): Promise<void> {
  const start = Date.now()

  projectSettings = await loadProjectSettings()

  registerApiMessageHandler(
    'project-settings',
    (message: ApiProjectSettingsMessage) => {
      projectSettings = mergeProjectSettings(projectSettings, message.settings)
      void persistProjectSettings(projectSettings)
      // broadcast the complete settings instead of the (partial) incoming message
      broadcastToSockets({
        type: 'project-settings',
        settings: projectSettings,
      })
      return false
    }
  )

  howLong(start, 'initProjectSettings')
}
