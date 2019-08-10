import { promises } from 'fs'
import { join } from 'path'

import { relativeConfigDirectoryPath } from '.'

const { writeFile } = promises

export function serialize(value: any) {
  return `module.exports = ${JSON.stringify(value, null, 2)};\n`
}

export async function writeEntity(fileName: string, content: string) {
  await writeFile(
    join(__dirname, relativeConfigDirectoryPath, fileName + '.js'),
    content
  )
}
