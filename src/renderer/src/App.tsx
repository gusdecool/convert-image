import { useConversion } from './hooks/useConversion'
import { useQueueStore } from './store/queueStore'
import { Dropzone } from './components/Dropzone'
import { FileQueueList } from './components/FileQueueList'
import { PresetPicker } from './components/PresetPicker'
import { AdvancedPanel } from './components/AdvancedPanel'
import { TransparencyToggle } from './components/TransparencyToggle'
import { FormatHelpPanel } from './components/FormatHelpPanel'
import { ConvertButton } from './components/ConvertButton'
import { BatchSummary } from './components/BatchSummary'
import { TooltipProvider } from './components/ui/tooltip'

function App(): React.JSX.Element {
  useConversion()
  const hasFiles = useQueueStore((s) => s.files.length > 0)

  return (
    <TooltipProvider>
      <div className="mx-auto flex h-full max-w-2xl flex-col gap-6 overflow-y-auto p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Convert Image</h1>
            <p className="text-sm text-slate-500">Shrink and convert photos in bulk — nothing leaves your computer.</p>
          </div>
          <FormatHelpPanel />
        </header>

        <Dropzone />

        {hasFiles && (
          <>
            <FileQueueList />
            <PresetPicker />
            <TransparencyToggle />
            <AdvancedPanel />
            <BatchSummary />
            <div className="flex justify-end">
              <ConvertButton />
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

export default App
