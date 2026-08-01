import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
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
