import { PRESET_OPTIONS } from '@shared/presets'
import { useSettingsStore } from '@renderer/store/settingsStore'
import { PresetCard } from './PresetCard'

export function PresetPicker(): React.JSX.Element {
  const basePreset = useSettingsStore((s) => s.basePreset)
  const selectPreset = useSettingsStore((s) => s.selectPreset)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PRESET_OPTIONS.map((option) => (
        <PresetCard
          key={option.id}
          option={option}
          selected={basePreset === option.id}
          onSelect={() => selectPreset(option.id)}
        />
      ))}
    </div>
  )
}
