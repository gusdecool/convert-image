import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'
import { ipc } from '@renderer/lib/ipc'
import { useQueueStore } from '@renderer/store/queueStore'
import { cn } from '@renderer/lib/cn'
import { Button } from './ui/button'

const ACCEPTED_MIME = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
}

export function Dropzone(): React.JSX.Element {
  const addFiles = useQueueStore((s) => s.addFiles)
  const [isImporting, setIsImporting] = useState(false)

  const importPaths = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return
      setIsImporting(true)
      try {
        const metadata = await ipc.getFileMetadata(paths)
        addFiles(metadata)
      } finally {
        setIsImporting(false)
      }
    },
    [addFiles]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const paths = acceptedFiles.map((file) => ipc.getPathForFile(file)).filter((p): p is string => Boolean(p))
      void importPaths(paths)
    },
    [importPaths]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME,
    noClick: true,
    noKeyboard: true
  })

  const handleAddFiles = useCallback(async () => {
    const paths = await ipc.openFileDialog()
    if (paths) void importPaths(paths)
  }, [importPaths])

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors',
        isDragActive && 'border-blue-500 bg-blue-50'
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="size-10 text-slate-400" />
      <div>
        <p className="text-base font-medium text-slate-700">Drag photos here</p>
        <p className="text-sm text-slate-500">or</p>
      </div>
      <Button type="button" onClick={() => void handleAddFiles()} disabled={isImporting}>
        {isImporting ? 'Adding…' : 'Add Files'}
      </Button>
      <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF</p>
    </div>
  )
}
