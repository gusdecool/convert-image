import { CheckCircle2 } from 'lucide-react'
import { useQueueStore } from '@renderer/store/queueStore'
import { formatBytes } from '@renderer/lib/formatBytes'
import { Button } from './ui/button'

export function BatchSummary(): React.JSX.Element | null {
  const summary = useQueueStore((s) => s.summary)
  const reset = useQueueStore((s) => s.reset)

  if (!summary) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-6 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            {summary.succeeded} image{summary.succeeded === 1 ? '' : 's'} converted
            {summary.failed > 0 ? `, ${summary.failed} failed` : ''}
          </p>
          <p className="text-xs text-emerald-700">Saved {formatBytes(summary.totalBytesSaved)} total</p>
        </div>
      </div>
      <Button variant="secondary" onClick={reset}>
        Convert more
      </Button>
    </div>
  )
}
