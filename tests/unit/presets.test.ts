import { describe, expect, test } from 'bun:test'
import { PRESETS, resolveEffectiveParams } from '../../src/main/services/presets.service'
import type { SourceInfo } from '../../src/main/services/presets.service'

const STATIC_OPAQUE: SourceInfo = { format: 'jpeg', hasAlpha: false, isAnimated: false }
const STATIC_ALPHA: SourceInfo = { format: 'png', hasAlpha: true, isAnimated: false }
const ANIMATED_ALPHA: SourceInfo = { format: 'gif', hasAlpha: true, isAnimated: true }

describe('resolveEffectiveParams — presets', () => {
  test('web preset with no overrides matches PRESETS.web', () => {
    const result = resolveEffectiveParams('web', undefined, false, STATIC_OPAQUE)
    expect(result).toMatchObject({
      maxDimension: PRESETS.web.maxDimension,
      quality: PRESETS.web.quality,
      format: PRESETS.web.format,
      suffix: PRESETS.web.suffix
    })
  })

  test('custom preset falls back to its own defaults, distinct from named presets', () => {
    const result = resolveEffectiveParams('custom', undefined, false, STATIC_OPAQUE)
    expect(result.suffix).toBe('-custom')
  })

  test('overrides win over preset defaults', () => {
    const result = resolveEffectiveParams('web', { maxDimension: 800, quality: 50, suffix: '-mine' }, false, STATIC_OPAQUE)
    expect(result.maxDimension).toBe(800)
    expect(result.quality).toBe(50)
    expect(result.suffix).toBe('-mine')
  })

  test('clamps out-of-range overrides instead of trusting them', () => {
    const result = resolveEffectiveParams('web', { maxDimension: 999999, quality: -5 }, false, STATIC_OPAQUE)
    expect(result.maxDimension).toBeLessThanOrEqual(10000)
    expect(result.quality).toBeGreaterThanOrEqual(1)
  })

  test('"keep" format override resolves to the source format', () => {
    const result = resolveEffectiveParams('web', { format: 'keep' }, false, { ...STATIC_OPAQUE, format: 'png' })
    expect(result.format).toBe('png')
  })
})

describe('resolveEffectiveParams — transparency toggle', () => {
  test('keepTransparent forces JPEG presets to WebP instead of flattening', () => {
    const result = resolveEffectiveParams('email', undefined, true, STATIC_ALPHA)
    expect(PRESETS.email.format).toBe('jpeg')
    expect(result.format).toBe('webp')
  })

  test('keepTransparent leaves an already-transparency-capable format alone', () => {
    const result = resolveEffectiveParams('web', undefined, true, STATIC_ALPHA)
    expect(result.format).toBe('webp')
  })

  test('keepTransparent false does not force a format change', () => {
    const result = resolveEffectiveParams('email', undefined, false, STATIC_OPAQUE)
    expect(result.format).toBe('jpeg')
  })
})

describe('resolveEffectiveParams — animated + alpha edge case', () => {
  test('an animated source with alpha keeps an animation-capable container even on a JPEG preset', () => {
    const result = resolveEffectiveParams('email', undefined, false, ANIMATED_ALPHA)
    expect(PRESETS.email.format).toBe('jpeg')
    expect(result.format).toBe('webp')
  })

  test('an explicit gif override survives the animated+alpha branch', () => {
    const result = resolveEffectiveParams('email', { format: 'gif' }, false, ANIMATED_ALPHA)
    expect(result.format).toBe('gif')
  })

  test('the animated+alpha rule takes priority even when keepTransparent is also true', () => {
    const result = resolveEffectiveParams('email', undefined, true, ANIMATED_ALPHA)
    expect(result.format).toBe('webp')
  })
})
