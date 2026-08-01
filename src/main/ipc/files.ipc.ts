import { randomUUID } from 'node:crypto'
import { ipcMain, shell } from 'electron'
import { IPC } from '../../shared/ipc-contract'
import type { FileMetadata } from '../../shared/ipc-contract'
import { readFileMetadata } from '../services/converter.service'

export function registerFilesIpc(): void {
  ipcMain.handle(IPC.filesGetMetadata, async (_event, paths: string[]): Promise<FileMetadata[]> => {
    if (!Array.isArray(paths)) return []
    return Promise.all(
      paths.filter((p): p is string => typeof p === 'string').map((p) => readFileMetadata(p, randomUUID()))
    )
  })

  ipcMain.handle(IPC.shellRevealInFolder, async (_event, path: string): Promise<void> => {
    if (typeof path === 'string' && path) shell.showItemInFolder(path)
  })
}
