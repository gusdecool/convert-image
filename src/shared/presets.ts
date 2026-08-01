import type { EncodableFormat, PresetId } from './ipc-contract'

export interface PresetOption {
  id: Exclude<PresetId, 'custom'>
  label: string
  description: string
}

/**
 * UI-facing labels only. The actual max dimension / quality / format / suffix
 * values for each preset live in src/main/services/presets.service.ts — the
 * renderer never hardcodes those numbers, it only requests a PresetId.
 */
export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'web',
    label: 'For Web (fast loading)',
    description: 'Shrinks the image so it loads quickly on a website, without looking blurry.'
  },
  {
    id: 'email',
    label: 'For Email/Chat',
    description: 'Makes the file small enough to attach and send easily.'
  },
  {
    id: 'social',
    label: 'For Social Media',
    description: 'Sized and compressed the way most social platforms expect.'
  }
]

export interface PresetUiDefaults {
  maxDimension: number
  quality: number
  format: EncodableFormat
  suffix: string
}

/**
 * Display-only prefill values for the Advanced panel's sliders/fields. These must
 * mirror src/main/services/presets.service.ts, but they are NOT the source of
 * truth: the renderer only sends `overrides` to main when the user actually edits
 * a field, so the numbers actually applied always come from main's own preset
 * table unless the user customized something. Worst case if these drift is a
 * stale-looking prefilled number before the user touches it — never a wrong output.
 */
export const PRESET_UI_DEFAULTS: Record<Exclude<PresetId, 'custom'>, PresetUiDefaults> = {
  web: { maxDimension: 2000, quality: 75, format: 'webp', suffix: '-web' },
  email: { maxDimension: 1200, quality: 70, format: 'jpeg', suffix: '-email' },
  social: { maxDimension: 1080, quality: 80, format: 'jpeg', suffix: '-social' }
}
