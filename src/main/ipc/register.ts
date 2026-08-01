import { registerConvertIpc } from './convert.ipc'
import { registerDialogIpc } from './dialog.ipc'
import { registerFilesIpc } from './files.ipc'

export function registerIpcHandlers(): void {
  registerDialogIpc()
  registerFilesIpc()
  registerConvertIpc()
}
