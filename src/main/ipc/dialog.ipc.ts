import { BrowserWindow, dialog, ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-contract'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

export function registerDialogIpc(): void {
  ipcMain.handle(IPC.dialogOpenFiles, async (event): Promise<string[] | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: IMAGE_EXTENSIONS }]
    }
    const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options)
    return result.canceled ? null : result.filePaths
  })
}
