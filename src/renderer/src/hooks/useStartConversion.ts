import { useCallback } from 'react'
import { ipc } from '@renderer/lib/ipc'
import { useQueueStore } from '@renderer/store/queueStore'
import { useSettingsStore } from '@renderer/store/settingsStore'
import type { ConvertStartRequest } from '@shared/ipc-contract'

/** Kicks off a batch for the given file ids, or every ready/error file when none are given (used for the main Convert button vs a per-row Retry). */
export function useStartConversion(): (fileIds?: string[]) => Promise<void> {
  const files = useQueueStore((s) => s.files)
  const startBatch = useQueueStore((s) => s.startBatch)
  const basePreset = useSettingsStore((s) => s.basePreset)
  const isCustomized = useSettingsStore((s) => s.isCustomized)
  const overrides = useSettingsStore((s) => s.overrides)
  const keepTransparent = useSettingsStore((s) => s.keepTransparent)

  return useCallback(
    async (fileIds) => {
      const targetIds =
        fileIds ?? files.filter((f) => f.status === 'ready' || f.status === 'error').map((f) => f.id)
      const targets = files.filter((f) => targetIds.includes(f.id))
      if (targets.length === 0) return

      const request: ConvertStartRequest = {
        batchId: crypto.randomUUID(),
        files: targets.map((f) => ({ id: f.id, path: f.path })),
        preset: isCustomized ? 'custom' : basePreset,
        overrides: isCustomized ? overrides : undefined,
        keepTransparent
      }

      startBatch(request.batchId, targetIds)
      await ipc.startConversion(request)
    },
    [files, basePreset, isCustomized, overrides, keepTransparent, startBatch]
  )
}
