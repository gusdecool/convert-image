import { ElectronAPI } from '@electron-toolkit/preload'
import type { PreloadApi } from '../shared/ipc-contract'

declare global {
  interface Window {
    electron: ElectronAPI
    api: PreloadApi
  }
}
