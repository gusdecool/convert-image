import { HelpCircle } from 'lucide-react'
import { Tooltip } from './ui/tooltip'
import { getFormatHelp } from '@shared/formatHelp'
import type { OutputFormat } from '@shared/ipc-contract'

export function FormatTooltip({ format }: { format: OutputFormat }): React.JSX.Element | null {
  const help = getFormatHelp(format)
  if (!help) return null

  return (
    <Tooltip label={help.short}>
      <HelpCircle className="size-4 shrink-0 cursor-help text-slate-400" />
    </Tooltip>
  )
}
