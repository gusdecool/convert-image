import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { FORMAT_HELP } from '@shared/formatHelp'

export function FormatHelpPanel(): React.JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <HelpCircle className="size-4" />
        Which format should I use?
      </button>
      <Dialog open={open} onOpenChange={setOpen} title="Which format should I use?">
        <dl className="flex flex-col gap-4">
          {FORMAT_HELP.map((entry) => (
            <div key={entry.format}>
              <dt className="text-sm font-semibold text-slate-900">{entry.label}</dt>
              <dd className="mt-1 text-sm text-slate-600">{entry.long}</dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </>
  )
}
