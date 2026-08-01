# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Electron desktop app (React + TypeScript, built with `electron-vite`) that converts images for
Web/email/social use via `sharp`. Uses `bun` as the package manager and test runner.

## Commands

```bash
bun install                # install deps
bun run dev                # electron-vite dev (HMR)
bun run build               # typecheck (node + web) then electron-vite build
bun run typecheck           # both typecheck:node and typecheck:web
bun run typecheck:node      # tsc --noEmit -p tsconfig.node.json (main + preload + shared)
bun run typecheck:web       # tsc --noEmit -p tsconfig.web.json (renderer + shared)
bun run lint                # eslint --cache .
bun run format              # prettier --write .
bun test                    # run all tests (bun:test)
bun test tests/unit/outputPath.test.ts   # run a single test file
bun run build:mac           # electron-builder mac package (build:win / build:linux also exist)
```

There is no separate lint/typecheck-fix loop config beyond the above — always run `bun run
typecheck` and `bun run lint` after non-trivial changes since there's no CI configured in this
repo to catch them.

## Architecture

Standard three-process Electron split, with all cross-process contracts centralized in
`src/shared/`:

- **`src/shared/ipc-contract.ts`** — the single source of truth for every IPC channel name (the
  `IPC` const), request/response/event payload types, and the `PreloadApi` interface that
  `window.api` implements. When adding a new main↔renderer capability, start here.
- **`src/shared/presets.ts`** / **`src/shared/formatHelp.ts`** — preset metadata and format-help
  copy shared between main (validation) and renderer (display).
- **`src/main/`** — Electron main process.
  - `ipc/` — one file per IPC surface (`dialog.ipc.ts`, `files.ipc.ts`, `convert.ipc.ts`), each
    exporting a `register*Ipc()` function, wired up in `ipc/register.ts` and called once from
    `main/index.ts`. Handlers re-validate/clamp all renderer input (see `sanitizeRequest` in
    `convert.ipc.ts`) — the preload bridge narrows the API surface but doesn't sanitize.
  - `services/` — business logic, framework-free (no Electron imports except where noted):
    - `presets.service.ts` — resolves a preset + user overrides + source image info (format,
      alpha, animation) into final `ResolvedParams` for the sharp pipeline. Contains the
      format-fallback rules (e.g. animated+transparent forces webp/gif; JPEG requested with
      "keep transparent" forces webp instead of silently flattening).
    - `converter.service.ts` — reads image metadata via sharp and runs a single file through
      the sharp pipeline (resize → optional flatten → format encode).
    - `outputPath.service.ts` — derives `<name><suffix>.<ext>` next to the source file,
      guaranteeing no collision with the source or with another output already produced in the
      same batch (tracked via a `usedPaths` Set passed through the batch).
    - `queue.service.ts` — runs a batch of files concurrently (`p-limit`, capped to CPU count;
      `sharp.concurrency(1)` so libvips threading doesn't fight the limiter), streams
      `convert:progress` per file and `convert:batchComplete` at the end via callbacks, and
      supports mid-batch cancellation through an in-memory `activeBatches` map keyed by
      `batchId`.
- **`src/preload/index.ts`** — the only `contextBridge` surface (`window.api`), implementing
  `PreloadApi`. Runs in a **sandboxed** preload (`sandbox: true` in `main/index.ts`), so it
  cannot `require()` external npm packages — only `electron` and Node builtins — which is why
  `electron.vite.config.ts` intentionally omits `externalizeDepsPlugin()` for the preload build
  (must stay fully bundled). `getPathForFile` is the one non-IPC call: it resolves a dropped
  `File`'s real filesystem path via `webUtils`, since `File.path` doesn't exist under context
  isolation.
- **`src/renderer/src/`** — React UI.
  - `store/` — Zustand stores: `queueStore.ts` (file queue + per-file conversion status +
    batch summary) and `settingsStore.ts` (selected preset, overrides, transparency toggle).
  - `hooks/` — `useStartConversion.ts` builds a `ConvertStartRequest` from current queue +
    settings state and kicks off a batch (used by both the main Convert button and per-row
    Retry); `useConversion.ts` subscribes to the `convert:progress` / `convert:batchComplete`
    IPC events and applies them to `queueStore`.
  - `lib/ipc.ts` — thin wrapper around `window.api` for renderer call sites.
  - `components/` — feature components at the top level, generic primitives (button, dialog,
    select, slider, switch, tooltip) under `components/ui/`.
  - Path aliases (renderer + shared only): `@renderer/*` → `src/renderer/src/*`, `@shared/*` →
    `src/shared/*` (defined in both `electron.vite.config.ts` and `tsconfig.web.json`).

### Data flow for a conversion batch

1. Renderer collects file paths (dropzone via `getPathForFile`, or the native dialog via
   `dialog:openFiles`), fetches metadata via `files:getMetadata` (`readFileMetadata` in
   `converter.service.ts`), and adds them to `queueStore`.
2. `useStartConversion` builds a `ConvertStartRequest` (preset or custom overrides,
   `keepTransparent`) and calls `convert:start`.
3. `convert.ipc.ts` sanitizes the request and calls `queue.service.runBatch`, returning
   immediately with `{ batchId, accepted }`.
4. `runBatch` resolves per-file params (`presets.service.resolveEffectiveParams`, which needs
   each file's actual format/alpha/animation — not just the preset), converts
   (`converter.service.convertOne`), and pushes `convert:progress` events per file plus one
   `convert:batchComplete` at the end.
5. `useConversion` in the renderer listens for those events and updates `queueStore` /
   `settingsStore` accordingly.

## Notes

- Preset definitions (`web`, `email`, `social`) and the `custom` fallback live only in
  `presets.service.ts` — keep `src/shared/presets.ts` (display copy) in sync if you change the
  underlying numbers.
- Tests are colocated under `tests/unit/` and run with `bun:test`, not vitest/jest — import
  `describe`/`expect`/`test` from `'bun:test'`.
