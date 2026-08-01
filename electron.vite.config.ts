import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    // p-limit is ESM-only ("type": "module", no CJS export). Externalizing it leaves a raw
    // require('p-limit') in the output, and Node's CJS/ESM interop hands back the module
    // namespace object instead of the default export, so `pLimit` isn't callable at runtime.
    // Excluding it here makes Vite bundle it in with proper interop instead.
    plugins: [externalizeDepsPlugin({ exclude: ['p-limit'] })]
  },
  // No externalizeDepsPlugin here: the window runs with sandbox: true, and a
  // sandboxed preload's require() only allows 'electron' and a few Node builtins —
  // requiring an external npm package (e.g. @electron-toolkit/preload) throws and
  // crashes the whole preload script before contextBridge ever runs. Bundling
  // keeps the preload output fully self-contained.
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
