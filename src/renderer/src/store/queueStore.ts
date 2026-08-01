import { create } from 'zustand'
import type { ConvertFileStatus, FileMetadata, ImageFormat } from '@shared/ipc-contract'

export type QueueFileStatus = 'ready' | ConvertFileStatus

export interface QueueFile {
  id: string
  path: string
  fileName: string
  originalByteSize: number
  width: number
  height: number
  format: ImageFormat
  hasAlpha: boolean
  isAnimated: boolean
  status: QueueFileStatus
  outputPath?: string
  outputByteSize?: number
  percentReduction?: number
  errorMessage?: string
}

export interface BatchSummary {
  succeeded: number
  failed: number
  canceled: number
  totalBytesSaved: number
}

interface QueueState {
  files: QueueFile[]
  batchId: string | null
  isConverting: boolean
  summary: BatchSummary | null
  addFiles: (metadata: FileMetadata[]) => void
  removeFile: (id: string) => void
  updateFileStatus: (id: string, patch: Partial<QueueFile>) => void
  startBatch: (batchId: string, fileIds: string[]) => void
  finishBatch: (summary: BatchSummary) => void
  reset: () => void
}

function toQueueFile(meta: FileMetadata): QueueFile {
  return {
    id: meta.id,
    path: meta.path,
    fileName: meta.fileName,
    originalByteSize: meta.byteSize,
    width: meta.width,
    height: meta.height,
    format: meta.format,
    hasAlpha: meta.hasAlpha,
    isAnimated: meta.isAnimated,
    status: meta.error ? 'error' : 'ready',
    errorMessage: meta.error
  }
}

export const useQueueStore = create<QueueState>((set) => ({
  files: [],
  batchId: null,
  isConverting: false,
  summary: null,

  addFiles: (metadata) =>
    set((state) => {
      const existingPaths = new Set(state.files.map((f) => f.path))
      const additions = metadata.filter((m) => !existingPaths.has(m.path)).map(toQueueFile)
      return additions.length > 0 ? { files: [...state.files, ...additions] } : state
    }),

  removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

  updateFileStatus: (id, patch) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...patch } : f))
    })),

  startBatch: (batchId, fileIds) =>
    set((state) => ({
      batchId,
      isConverting: true,
      summary: null,
      files: state.files.map((f) =>
        fileIds.includes(f.id) ? { ...f, status: 'processing', errorMessage: undefined } : f
      )
    })),

  finishBatch: (summary) => set({ isConverting: false, summary }),

  reset: () => set({ files: [], batchId: null, isConverting: false, summary: null })
}))
