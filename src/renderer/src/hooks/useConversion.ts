import { useEffect } from 'react'
import { ipc } from '@renderer/lib/ipc'
import { useQueueStore } from '@renderer/store/queueStore'

/** Subscribes for the lifetime of the app to progress/completion events from the main process. */
export function useConversion(): void {
  const updateFileStatus = useQueueStore((s) => s.updateFileStatus)
  const finishBatch = useQueueStore((s) => s.finishBatch)

  useEffect(() => {
    const unsubscribeProgress = ipc.onConvertProgress((event) => {
      updateFileStatus(event.fileId, {
        status: event.status,
        outputPath: event.outputPath,
        outputByteSize: event.outputByteSize,
        percentReduction: event.percentReduction,
        errorMessage: event.errorMessage
      })
    })

    const unsubscribeComplete = ipc.onConvertBatchComplete((event) => {
      finishBatch({
        succeeded: event.succeeded,
        failed: event.failed,
        canceled: event.canceled,
        totalBytesSaved: event.totalBytesSaved
      })
    })

    return () => {
      unsubscribeProgress()
      unsubscribeComplete()
    }
  }, [updateFileStatus, finishBatch])
}
