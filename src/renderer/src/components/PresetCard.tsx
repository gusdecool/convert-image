import { cn } from '@renderer/lib/cn'
import type { PresetOption } from '@shared/presets'

interface PresetCardProps {
  option: PresetOption
  selected: boolean
  onSelect: () => void
}

export function PresetCard({ option, selected, onSelect }: PresetCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors',
        selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <span className="text-sm font-semibold text-slate-900">{option.label}</span>
      <span className="text-xs text-slate-500">{option.description}</span>
    </button>
  )
}
