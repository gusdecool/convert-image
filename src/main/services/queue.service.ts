import os from 'node:os'
import pLimit from 'p-limit'
import sharp from 'sharp'
import type { ConvertBatchCompleteEvent, ConvertProgressEvent, ConvertStartRequest } from '../../shared/ipc-contract'
import { convertOne, readFileMetadata } from './converter.service'
import { resolveEffectiveParams } from './presets.service'

// Each sharp operation already fans out to libvips' own thread pool; capping it to 1
// thread per operation and instead limiting how many operations run at once (below)
// gets full CPU utilization without threads fighting each other.
sharp.concurrency(1)

interface BatchHandle {
  canceled: boolean
}

const activeBatches = new Map<string, BatchHandle>()

export function cancelBatch(batchId: string): boolean {
  const handle = activeBatches.get(batchId)
  if (!handle) return false
  handle.canceled = true
  return true
}

export async function runBatch(
  request: ConvertStartRequest,
  onProgress: (event: ConvertProgressEvent) => void,
  onComplete: (event: ConvertBatchCompleteEvent) => void
): Promise<void> {
  const handle: BatchHandle = { canceled: false }
  activeBatches.set(request.batchId, handle)

  const limit = pLimit(Math.max(1, os.cpus().length))
  const usedOutputPaths = new Set<string>()

  let succeeded = 0
  let failed = 0
  let canceled = 0
  let totalBytesSaved = 0

  await Promise.all(
    request.files.map((file) =>
      limit(async () => {
        if (handle.canceled) {
          canceled += 1
          onProgress({ batchId: request.batchId, fileId: file.id, status: 'canceled' })
          return
        }

        onProgress({ batchId: request.batchId, fileId: file.id, status: 'processing' })

        try {
          const meta = await readFileMetadata(file.path, file.id)
          if (meta.error) throw new Error(meta.error)

          const params = resolveEffectiveParams(request.preset, request.overrides, request.keepTransparent, {
            format: meta.format,
            hasAlpha: meta.hasAlpha,
            isAnimated: meta.isAnimated
          })

          const result = await convertOne(file.path, params, usedOutputPaths)
          succeeded += 1
          totalBytesSaved += Math.max(0, result.originalByteSize - result.outputByteSize)

          onProgress({
            batchId: request.batchId,
            fileId: file.id,
            status: 'done',
            outputPath: result.outputPath,
            outputByteSize: result.outputByteSize,
            originalByteSize: result.originalByteSize,
            percentReduction: result.percentReduction
          })
        } catch (error) {
          failed += 1
          onProgress({
            batchId: request.batchId,
            fileId: file.id,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Conversion failed.'
          })
        }
      })
    )
  )

  activeBatches.delete(request.batchId)
  onComplete({ batchId: request.batchId, succeeded, failed, canceled, totalBytesSaved })
}
