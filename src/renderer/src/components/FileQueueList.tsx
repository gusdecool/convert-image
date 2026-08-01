import { useQueueStore } from '@renderer/store/queueStore'
import { FileQueueItem } from './FileQueueItem'

export function FileQueueList(): React.JSX.Element | null {
  const files = useQueueStore((s) => s.files)
  if (files.length === 0) return null

  return (
    <ul className="flex flex-col gap-2">
      {files.map((file) => (
        <FileQueueItem key={file.id} file={file} />
      ))}
    </ul>
  )
}
