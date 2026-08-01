import type { OutputFormat } from './ipc-contract'

export interface FormatHelpEntry {
  format: Exclude<OutputFormat, 'keep'>
  label: string
  /** One line, shown in the inline "?" tooltip next to the format picker. */
  short: string
  /** Longer version shown in the full "Which format should I use?" panel. */
  long: string
  supportsTransparency: boolean
  supportsAnimation: boolean
}

export const FORMAT_HELP: FormatHelpEntry[] = [
  {
    format: 'jpeg',
    label: 'JPG',
    short: 'Best for photos. No transparent backgrounds.',
    long: "The safest, most universal choice for photos and gradients — it opens everywhere. It's lossy, meaning it throws away a little detail to save space, which is normal and usually invisible. It can't have a transparent background.",
    supportsTransparency: false,
    supportsAnimation: false
  },
  {
    format: 'png',
    label: 'PNG',
    short: 'Supports transparent backgrounds. Larger files for photos.',
    long: 'Best for logos, screenshots, and graphics with text or sharp edges — it supports a transparent background and stays perfectly crisp. Because nothing is thrown away, PNG files are usually bigger than JPG for photos.',
    supportsTransparency: true,
    supportsAnimation: false
  },
  {
    format: 'webp',
    label: 'WebP',
    short: 'Usually the smallest file. Supports transparency.',
    long: "A modern format that's usually the smallest file for a given look, and supports transparent backgrounds too — the best of both JPG and PNG. Caveat: some older programs, some Windows photo viewers, and some email or design tools may not open it directly, so it's safest for websites and less safe when sending to someone whose app you don't control.",
    supportsTransparency: true,
    supportsAnimation: true
  },
  {
    format: 'gif',
    label: 'GIF',
    short: 'The only one that animates. Not for photos.',
    long: 'The only format here that supports simple looping animation. It only supports 256 colors, so photos end up looking banded or blotchy — only use it for short animated clips, never for still photos.',
    supportsTransparency: true,
    supportsAnimation: true
  }
]

export function getFormatHelp(format: OutputFormat): FormatHelpEntry | undefined {
  return FORMAT_HELP.find((entry) => entry.format === format)
}
