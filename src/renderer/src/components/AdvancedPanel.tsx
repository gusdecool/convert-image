import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { useSettingsStore } from '@renderer/store/settingsStore'
import { PRESET_UI_DEFAULTS } from '@shared/presets'
import type { EncodableFormat } from '@shared/ipc-contract'
import { Slider } from './ui/slider'
import { Select } from './ui/select'
import type { SelectOption } from './ui/select'
import { FormatTooltip } from './FormatTooltip'

const FORMAT_OPTIONS: { value: EncodableFormat; label: string }[] = [
  { value: 'webp', label: 'WebP' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' }
]

export function AdvancedPanel(): React.JSX.Element {
  const basePreset = useSettingsStore((s) => s.basePreset)
  const overrides = useSettingsStore((s) => s.overrides)
  const isCustomized = useSettingsStore((s) => s.isCustomized)
  const keepTransparent = useSettingsStore((s) => s.keepTransparent)
  const setOverride = useSettingsStore((s) => s.setOverride)

  const defaults = PRESET_UI_DEFAULTS[basePreset]
  const maxDimension = overrides.maxDimension ?? defaults.maxDimension
  const quality = overrides.quality ?? defaults.quality
  const format = (overrides.format as EncodableFormat | undefined) ?? defaults.format
  const suffix = overrides.suffix ?? defaults.suffix

  const formatOptions: SelectOption[] = FORMAT_OPTIONS.map((opt) => ({
    ...opt,
    disabled: keepTransparent && opt.value === 'jpeg',
    disabledReason: opt.value === 'jpeg' ? "JPG can't have a transparent background." : undefined
  }))

  return (
    <Accordion.Root type="single" collapsible className="rounded-xl border border-slate-200 bg-white">
      <Accordion.Item value="advanced">
        <Accordion.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2">
            Advanced settings
            {isCustomized && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Custom
              </span>
            )}
          </span>
          <ChevronDown className="size-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
        <Accordion.Content className="flex flex-col gap-5 border-t border-slate-100 px-4 py-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <label htmlFor="max-dimension">Max size (long edge)</label>
              <span className="font-medium">{maxDimension}px</span>
            </div>
            <Slider
              id="max-dimension"
              min={200}
              max={4000}
              step={50}
              value={maxDimension}
              onValueChange={(v) => setOverride({ maxDimension: v })}
            />
            <p className="mt-1 text-xs text-slate-400">
              This is what actually makes images smaller for the web — not DPI, which is a print-only setting.
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <label htmlFor="quality">Image quality</label>
              <span className="font-medium">{quality}</span>
            </div>
            <Slider
              id="quality"
              min={1}
              max={100}
              value={quality}
              onValueChange={(v) => setOverride({ quality: v })}
            />
            <p className="mt-1 text-xs text-slate-400">Higher looks better; lower makes a smaller file.</p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-slate-700">
              <label htmlFor="format">Save as</label>
              <FormatTooltip format={format} />
            </div>
            <Select
              id="format"
              value={format}
              onValueChange={(v) => setOverride({ format: v as EncodableFormat })}
              options={formatOptions}
            />
          </div>

          <div>
            <label htmlFor="suffix" className="mb-1 block text-sm text-slate-700">
              Add to filename
            </label>
            <input
              id="suffix"
              type="text"
              value={suffix}
              onChange={(e) => setOverride({ suffix: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
