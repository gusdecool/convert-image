import { CheckCircle2, FolderOpen, Loader2, RotateCcw, TriangleAlert, X } from 'lucide-react'
import { formatBytes } from '@renderer/lib/formatBytes'
import { ipc } from '@renderer/lib/ipc'
import { useQueueStore } from '@renderer/store/queueStore'
import type { QueueFile } from '@renderer/store/queueStore'
import { useStartConversion } from '@renderer/hooks/useStartConversion'
import { Button } from './ui/button'

const FORMAT_LABEL: Record<QueueFile['format'], string> = {
  jpeg: 'JPG',
  png: 'PNG',
  webp: 'WEBP',
  gif: 'GIF',
  unknown: '?'
}

export function FileQueueItem({ file }: { file: QueueFile }): React.JSX.Element {
  const removeFile = useQueueStore((s) => s.removeFile)
  const startConversion = useStartConversion()

  return (
    <li className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="w-14 shrink-0 rounded bg-slate-100 py-1 text-center text-xs font-semibold text-slate-500">
        {FORMAT_LABEL[file.format]}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{file.fileName}</p>
        <p className="text-xs text-slate-500">
          {file.status === 'done' && file.outputByteSize != null ? (
            <>
              {formatBytes(file.originalByteSize)} → {formatBytes(file.outputByteSize)}
              {typeof file.percentReduction === 'number' && (
                <span className="ml-1 font-medium text-emerald-600">(-{file.percentReduction}%)</span>
              )}
            </>
          ) : (
            <>
              {formatBytes(file.originalByteSize)}
              {file.width > 0 && ` · ${file.width}×${file.height}`}
            </>
          )}
        </p>
        {file.status === 'error' && file.errorMessage && (
          <p className="mt-1 text-xs text-red-600">{file.errorMessage}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <StatusIcon status={file.status} />
        {file.status === 'error' && (
          <Button
            variant="secondary"
            className="p-2"
            onClick={() => void startConversion([file.id])}
            title="Try again"
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
        {file.status === 'done' && file.outputPath && (
          <Button
            variant="secondary"
            className="p-2"
            onClick={() => void ipc.revealInFolder(file.outputPath as string)}
            title="Show in Finder"
          >
            <FolderOpen className="size-4" />
          </Button>
        )}
        {(file.status === 'ready' || file.status === 'error') && (
          <Button variant="ghost" className="p-2" onClick={() => removeFile(file.id)} title="Remove">
            <X className="size-4" />
          </Button>
        )}
      </div>
    </li>
  )
}

function StatusIcon({ status }: { status: QueueFile['status'] }): React.JSX.Element | null {
  switch (status) {
    case 'processing':
      return <Loader2 className="size-5 animate-spin text-blue-500" />
    case 'done':
      return <CheckCircle2 className="size-5 text-emerald-500" />
    case 'error':
      return <TriangleAlert className="size-5 text-red-500" />
    default:
      return null
  }
}
