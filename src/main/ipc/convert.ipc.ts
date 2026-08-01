import { randomUUID } from 'node:crypto'
import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-contract'
import type {
  ConvertCancelRequest,
  ConvertCancelResponse,
  ConvertOverrides,
  ConvertStartRequest,
  ConvertStartResponse,
  OutputFormat,
  PresetId
} from '../../shared/ipc-contract'
import { cancelBatch, runBatch } from '../services/queue.service'

const MIN_QUALITY = 1
const MAX_QUALITY = 100
const MIN_DIMENSION = 16
const MAX_DIMENSION = 10000
const VALID_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'gif', 'keep']
const VALID_PRESETS: PresetId[] = ['web', 'email', 'social', 'custom']

// The preload bridge narrows the API surface but does not sanitize values —
// main re-validates/clamps everything before it reaches sharp or the filesystem.
function sanitizeRequest(raw: ConvertStartRequest): ConvertStartRequest {
  const preset = VALID_PRESETS.includes(raw?.preset) ? raw.preset : 'custom'

  const files = Array.isArray(raw?.files)
    ? raw.files.filter((f) => typeof f?.id === 'string' && typeof f?.path === 'string')
    : []

  const overrides = sanitizeOverrides(raw?.overrides)

  return {
    batchId: typeof raw?.batchId === 'string' && raw.batchId ? raw.batchId : randomUUID(),
    files,
    preset,
    overrides,
    keepTransparent: Boolean(raw?.keepTransparent)
  }
}

function sanitizeOverrides(overrides: ConvertOverrides | undefined): ConvertOverrides | undefined {
  if (!overrides) return undefined

  const maxDimension = clampNumber(overrides.maxDimension, MIN_DIMENSION, MAX_DIMENSION)
  const quality = clampNumber(overrides.quality, MIN_QUALITY, MAX_QUALITY)
  const format = VALID_FORMATS.includes(overrides.format as OutputFormat) ? overrides.format : undefined
  const suffix = typeof overrides.suffix === 'string' ? overrides.suffix.slice(0, 40) : undefined

  return { maxDimension, quality, format, suffix }
}

function clampNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

export function registerConvertIpc(): void {
  ipcMain.handle(IPC.convertStart, async (event, raw: ConvertStartRequest): Promise<ConvertStartResponse> => {
    const request = sanitizeRequest(raw)
    const sender = event.sender

    // Kicks off the batch and returns immediately; progress/completion stream back
    // over convert:progress / convert:batchComplete events as files finish.
    void runBatch(
      request,
      (progress) => {
        if (!sender.isDestroyed()) sender.send(IPC.convertProgress, progress)
      },
      (complete) => {
        if (!sender.isDestroyed()) sender.send(IPC.convertBatchComplete, complete)
      }
    )

    return { batchId: request.batchId, accepted: request.files.length }
  })

  ipcMain.handle(IPC.convertCancel, async (_event, request: ConvertCancelRequest): Promise<ConvertCancelResponse> => {
    return { canceled: cancelBatch(request?.batchId) }
  })
}
