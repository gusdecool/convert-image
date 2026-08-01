import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '../shared/ipc-contract'
import type {
  ConvertBatchCompleteEvent,
  ConvertCancelRequest,
  ConvertCancelResponse,
  ConvertProgressEvent,
  ConvertStartRequest,
  ConvertStartResponse,
  FileMetadata,
  PreloadApi
} from '../shared/ipc-contract'

const api: PreloadApi = {
  // The only call here that isn't an IPC round trip: preload shares the renderer's
  // DOM realm, so it can read a dropped File object directly and resolve its real
  // filesystem path — File.path no longer exists once context isolation is on.
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),

  openFileDialog: (): Promise<string[] | null> => ipcRenderer.invoke(IPC.dialogOpenFiles),

  getFileMetadata: (paths: string[]): Promise<FileMetadata[]> =>
    ipcRenderer.invoke(IPC.filesGetMetadata, paths),

  startConversion: (request: ConvertStartRequest): Promise<ConvertStartResponse> =>
    ipcRenderer.invoke(IPC.convertStart, request),

  cancelConversion: (request: ConvertCancelRequest): Promise<ConvertCancelResponse> =>
    ipcRenderer.invoke(IPC.convertCancel, request),

  revealInFolder: (path: string): Promise<void> => ipcRenderer.invoke(IPC.shellRevealInFolder, path),

  onConvertProgress: (listener: (event: ConvertProgressEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: ConvertProgressEvent): void => listener(payload)
    ipcRenderer.on(IPC.convertProgress, handler)
    return () => ipcRenderer.removeListener(IPC.convertProgress, handler)
  },

  onConvertBatchComplete: (listener: (event: ConvertBatchCompleteEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: ConvertBatchCompleteEvent): void => listener(payload)
    ipcRenderer.on(IPC.convertBatchComplete, handler)
    return () => ipcRenderer.removeListener(IPC.convertBatchComplete, handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
