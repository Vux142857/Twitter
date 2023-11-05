import fs from 'fs'
import path from 'path'

export const initFolder = async (nameFolder: string) => {
  const newFolder = path.resolve(nameFolder)
  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder, {
      recursive: true
    })
  }
}