import { promises as fs } from 'node:fs'
import { basename } from 'node:path'
import sharp, { type Sharp } from 'sharp'
import type { EncodableFormat, FileMetadata, ImageFormat } from '../../shared/ipc-contract'
import type { ResolvedParams } from './presets.service'
import { deriveOutputPath } from './outputPath.service'

const SHARP_FORMAT_TO_IMAGE_FORMAT: Record<string, ImageFormat> = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif'
}

export async function readFileMetadata(filePath: string, id: string): Promise<FileMetadata> {
  const fileName = basename(filePath)
  try {
    const [stat, meta] = await Promise.all([fs.stat(filePath), sharp(filePath).metadata()])
    return {
      id,
      path: filePath,
      fileName,
      byteSize: stat.size,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      format: SHARP_FORMAT_TO_IMAGE_FORMAT[meta.format ?? ''] ?? 'unknown',
      hasAlpha: meta.hasAlpha ?? false,
      isAnimated: (meta.pages ?? 1) > 1
    }
  } catch (error) {
    return {
      id,
      path: filePath,
      fileName,
      byteSize: 0,
      width: 0,
      height: 0,
      format: 'unknown',
      hasAlpha: false,
      isAnimated: false,
      error: error instanceof Error ? error.message : "Couldn't read this file as an image."
    }
  }
}

export interface ConvertResult {
  outputPath: string
  outputByteSize: number
  originalByteSize: number
  percentReduction: number
}

export async function convertOne(
  sourcePath: string,
  params: ResolvedParams,
  usedOutputPaths: Set<string>
): Promise<ConvertResult> {
  const originalByteSize = (await fs.stat(sourcePath)).size

  let pipeline = sharp(sourcePath, { animated: params.isAnimated }).resize({
    width: params.maxDimension,
    height: params.maxDimension,
    fit: 'inside',
    withoutEnlargement: true
  })

  if (!params.keepTransparent && params.format === 'jpeg') {
    pipeline = pipeline.flatten({ background: '#ffffff' })
  }

  pipeline = applyFormat(pipeline, params.format, params.quality)

  const outputPath = deriveOutputPath(sourcePath, params.suffix, params.format, usedOutputPaths)
  const info = await pipeline.toFile(outputPath)

  return {
    outputPath,
    outputByteSize: info.size,
    originalByteSize,
    percentReduction: originalByteSize > 0 ? Math.round((1 - info.size / originalByteSize) * 100) : 0
  }
}

function applyFormat(pipeline: Sharp, format: EncodableFormat, quality: number): Sharp {
  switch (format) {
    case 'jpeg':
      return pipeline.jpeg({ quality })
    case 'webp':
      return pipeline.webp({ quality })
    case 'png':
      return pipeline.png({ quality })
    case 'gif':
      return pipeline.gif()
  }
}
