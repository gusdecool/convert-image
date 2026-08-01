import { describe, expect, test } from 'bun:test'
import { deriveOutputPath } from '../../src/main/services/outputPath.service'

describe('deriveOutputPath', () => {
  test('builds <name><suffix>.<ext> next to the source', () => {
    const path = deriveOutputPath('/a/b/photo.jpg', '-web', 'webp', new Set())
    expect(path).toBe('/a/b/photo-web.webp')
  })

  test('keeps the source extension when format is "keep"', () => {
    const path = deriveOutputPath('/a/b/photo.jpeg', '-email', 'keep', new Set())
    expect(path).toBe('/a/b/photo-email.jpeg')
  })

  test('never returns a path equal to the source, even with an empty suffix and matching format', () => {
    const path = deriveOutputPath('/a/b/photo.jpg', '', 'keep', new Set())
    expect(path).not.toBe('/a/b/photo.jpg')
    expect(path).toBe('/a/b/photo (2).jpg')
  })

  test('avoids colliding with another output already produced in the same batch', () => {
    const used = new Set<string>()
    const first = deriveOutputPath('/a/b/photo.jpg', '-web', 'webp', used)
    const second = deriveOutputPath('/a/b/photo.png', '-web', 'webp', used)

    expect(first).toBe('/a/b/photo-web.webp')
    expect(second).not.toBe(first)
    expect(second).toBe('/a/b/photo-web (2).webp')
  })

  test('tracks the returned path in usedPaths for subsequent calls', () => {
    const used = new Set<string>()
    deriveOutputPath('/a/b/photo.jpg', '-web', 'webp', used)
    expect(used.has('/a/b/photo-web.webp')).toBe(true)
  })
})
