/** Thin, testable indirection over the contextBridge surface — components import this instead of touching `window.api` directly. */
export const ipc = window.api
