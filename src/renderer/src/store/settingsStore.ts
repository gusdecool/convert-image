import { create } from 'zustand'
import type { ConvertOverrides, PresetId } from '@shared/ipc-contract'

type BasePresetId = Exclude<PresetId, 'custom'>

interface SettingsState {
  basePreset: BasePresetId
  isCustomized: boolean
  overrides: ConvertOverrides
  keepTransparent: boolean
  selectPreset: (preset: BasePresetId) => void
  setOverride: (patch: ConvertOverrides) => void
  setKeepTransparent: (value: boolean) => void
  effectivePreset: () => PresetId
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  basePreset: 'web',
  isCustomized: false,
  overrides: {},
  keepTransparent: false,

  selectPreset: (preset) => set({ basePreset: preset, overrides: {}, isCustomized: false }),

  setOverride: (patch) =>
    set((state) => ({
      isCustomized: true,
      overrides: { ...state.overrides, ...patch }
    })),

  setKeepTransparent: (value) => set({ keepTransparent: value }),

  effectivePreset: () => (get().isCustomized ? 'custom' : get().basePreset)
}))
