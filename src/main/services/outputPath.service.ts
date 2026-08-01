import { basename, dirname, extname, join } from 'node:path'
import type { OutputFormat } from '../../shared/ipc-contract'

const EXTENSION_BY_FORMAT: Record<Exclude<OutputFormat, 'keep'>, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif'
}

/**
 * Builds `<dir>/<name><suffix>.<ext>` next to the source file, and guarantees the
 * result never equals the source path and never collides with another output
 * already produced in the same batch (two source files with the same basename
 * but different extensions could otherwise both resolve to e.g. `photo-web.webp`).
 */
export function deriveOutputPath(
  sourcePath: string,
  suffix: string,
  format: OutputFormat,
  usedPaths: Set<string>
): string {
  const dir = dirname(sourcePath)
  const sourceExt = extname(sourcePath)
  const nameWithoutExt = basename(sourcePath, sourceExt)
  const targetExt = format === 'keep' ? sourceExt.replace(/^\./, '') || 'img' : EXTENSION_BY_FORMAT[format]

  let candidate = join(dir, `${nameWithoutExt}${suffix}.${targetExt}`)
  let counter = 2
  while (candidate === sourcePath || usedPaths.has(candidate)) {
    candidate = join(dir, `${nameWithoutExt}${suffix} (${counter}).${targetExt}`)
    counter += 1
  }

  usedPaths.add(candidate)
  return candidate
}
