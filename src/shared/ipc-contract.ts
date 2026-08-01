export const IPC = {
  dialogOpenFiles: 'dialog:openFiles',
  filesGetMetadata: 'files:getMetadata',
  convertStart: 'convert:start',
  convertCancel: 'convert:cancel',
  convertProgress: 'convert:progress',
  convertBatchComplete: 'convert:batchComplete',
  shellRevealInFolder: 'shell:revealInFolder'
} as const

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'unknown'
export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'keep'
/** OutputFormat minus the "keep source format" sentinel — what a sharp pipeline can actually encode to. */
export type EncodableFormat = Exclude<OutputFormat, 'keep'>

export interface FileMetadata {
  id: string
  path: string
  fileName: string
  byteSize: number
  width: number
  height: number
  format: ImageFormat
  hasAlpha: boolean
  isAnimated: boolean
  error?: string
}

export type PresetId = 'web' | 'email' | 'social' | 'custom'

export interface ConvertOverrides {
  maxDimension?: number
  quality?: number
  format?: OutputFormat
  suffix?: string
}

export interface ConvertStartRequest {
  batchId: string
  files: { id: string; path: string }[]
  preset: PresetId
  overrides?: ConvertOverrides
  keepTransparent: boolean
}

export interface ConvertStartResponse {
  batchId: string
  accepted: number
}

export interface ConvertCancelRequest {
  batchId: string
}

export interface ConvertCancelResponse {
  canceled: boolean
}

export type ConvertFileStatus = 'processing' | 'done' | 'error' | 'canceled'

export interface ConvertProgressEvent {
  batchId: string
  fileId: string
  status: ConvertFileStatus
  outputPath?: string
  outputByteSize?: number
  originalByteSize?: number
  percentReduction?: number
  errorMessage?: string
}

export interface ConvertBatchCompleteEvent {
  batchId: string
  succeeded: number
  failed: number
  canceled: number
  totalBytesSaved: number
}

export interface RevealInFolderRequest {
  path: string
}

/** Contract for the contextBridge surface exposed as `window.api` by the preload script. */
export interface PreloadApi {
  getPathForFile: (file: File) => string
  openFileDialog: () => Promise<string[] | null>
  getFileMetadata: (paths: string[]) => Promise<FileMetadata[]>
  startConversion: (request: ConvertStartRequest) => Promise<ConvertStartResponse>
  cancelConversion: (request: ConvertCancelRequest) => Promise<ConvertCancelResponse>
  revealInFolder: (path: string) => Promise<void>
  onConvertProgress: (listener: (event: ConvertProgressEvent) => void) => () => void
  onConvertBatchComplete: (listener: (event: ConvertBatchCompleteEvent) => void) => () => void
}
