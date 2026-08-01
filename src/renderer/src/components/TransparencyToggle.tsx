import { Switch } from './ui/switch'
import { useSettingsStore } from '@renderer/store/settingsStore'

export function TransparencyToggle(): React.JSX.Element {
  const keepTransparent = useSettingsStore((s) => s.keepTransparent)
  const setKeepTransparent = useSettingsStore((s) => s.setKeepTransparent)

  return (
    <label
      htmlFor="keep-transparent"
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <Switch id="keep-transparent" checked={keepTransparent} onCheckedChange={setKeepTransparent} />
      <div>
        <p className="text-sm font-medium text-slate-800">Keep transparent background</p>
        <p className="text-xs text-slate-500">
          Turn this on for logos or graphics that shouldn&apos;t get a solid background.
        </p>
      </div>
    </label>
  )
}
