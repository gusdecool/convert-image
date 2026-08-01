import { Loader2 } from 'lucide-react'
import { useQueueStore } from '@renderer/store/queueStore'
import { useStartConversion } from '@renderer/hooks/useStartConversion'
import { ipc } from '@renderer/lib/ipc'
import { Button } from './ui/button'

export function ConvertButton(): React.JSX.Element {
  const files = useQueueStore((s) => s.files)
  const isConverting = useQueueStore((s) => s.isConverting)
  const batchId = useQueueStore((s) => s.batchId)
  const startConversion = useStartConversion()

  const readyCount = files.filter((f) => f.status === 'ready' || f.status === 'error').length

  if (isConverting) {
    return (
      <Button
        variant="secondary"
        onClick={() => batchId && void ipc.cancelConversion({ batchId })}
        className="w-full sm:w-auto"
      >
        <Loader2 className="size-4 animate-spin" />
        Converting… Cancel
      </Button>
    )
  }

  return (
    <Button onClick={() => void startConversion()} disabled={readyCount === 0} className="w-full sm:w-auto">
      {readyCount > 0 ? `Convert ${readyCount} image${readyCount === 1 ? '' : 's'}` : 'Convert'}
    </Button>
  )
}
