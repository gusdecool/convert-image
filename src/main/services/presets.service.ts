import type { ConvertOverrides, EncodableFormat, ImageFormat, OutputFormat, PresetId } from '../../shared/ipc-contract'

export interface PresetDefinition {
  maxDimension: number
  quality: number
  format: EncodableFormat
  suffix: string
}

/** The numeric levers behind each plain-language preset. See plan §Preset Definitions. */
export const PRESETS: Record<Exclude<PresetId, 'custom'>, PresetDefinition> = {
  web: { maxDimension: 2000, quality: 75, format: 'webp', suffix: '-web' },
  email: { maxDimension: 1200, quality: 70, format: 'jpeg', suffix: '-email' },
  social: { maxDimension: 1080, quality: 80, format: 'jpeg', suffix: '-social' }
}

const CUSTOM_DEFAULTS: PresetDefinition = {
  maxDimension: 2000,
  quality: 80,
  format: 'webp',
  suffix: '-custom'
}

const MIN_QUALITY = 1
const MAX_QUALITY = 100
const MIN_DIMENSION = 16
const MAX_DIMENSION = 10000
const ENCODABLE_FORMATS: EncodableFormat[] = ['jpeg', 'png', 'webp', 'gif']

export interface SourceInfo {
  format: ImageFormat
  hasAlpha: boolean
  isAnimated: boolean
}

export interface ResolvedParams {
  maxDimension: number
  quality: number
  format: EncodableFormat
  suffix: string
  keepTransparent: boolean
  isAnimated: boolean
}

export function resolveEffectiveParams(
  preset: PresetId,
  overrides: ConvertOverrides | undefined,
  keepTransparent: boolean,
  source: SourceInfo
): ResolvedParams {
  const base = preset === 'custom' ? CUSTOM_DEFAULTS : PRESETS[preset]

  const maxDimension = clamp(overrides?.maxDimension, base.maxDimension, MIN_DIMENSION, MAX_DIMENSION)
  const quality = clamp(overrides?.quality, base.quality, MIN_QUALITY, MAX_QUALITY)
  const suffix = overrides?.suffix ?? base.suffix

  let format = resolveRequestedFormat(overrides?.format, base.format, source.format)

  if (source.isAnimated && source.hasAlpha) {
    // Animated + transparent source: keep an animation-capable container instead of
    // forcing PNG (the usual "preserve transparency" target), since PNG can't animate.
    format = format === 'gif' ? 'gif' : 'webp'
  } else if (keepTransparent && format === 'jpeg') {
    // JPEG has no alpha channel — never silently flatten when the user explicitly
    // asked to keep the transparent background.
    format = 'webp'
  }

  return { maxDimension, quality, format, suffix, keepTransparent, isAnimated: source.isAnimated }
}

function resolveRequestedFormat(
  requested: OutputFormat | undefined,
  fallback: EncodableFormat,
  sourceFormat: ImageFormat
): EncodableFormat {
  if (!requested) return fallback
  if (requested === 'keep') return sourceFormat === 'unknown' ? fallback : sourceFormat
  return ENCODABLE_FORMATS.includes(requested as EncodableFormat) ? (requested as EncodableFormat) : fallback
}

function clamp(value: number | undefined, fallback: number, min: number, max: number): number {
  const v = value ?? fallback
  if (Number.isNaN(v)) return fallback
  return Math.min(max, Math.max(min, v))
}
