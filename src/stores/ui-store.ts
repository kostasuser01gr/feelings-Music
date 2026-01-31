import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "sanctuary" | "studio" | "cosmos";

export interface ShortcutConfig {
  commandPalette: string;
  sanctuary: string;
  studio: string;
  cosmos: string;
  search: string;
  new: string;
  playPause: string;
  help: string;
}

const defaultShortcuts: ShortcutConfig = {
  commandPalette: "mod+k",
  sanctuary: "mod+1",
  studio: "mod+2",
  cosmos: "mod+3",
  search: "/",
  new: "n",
  playPause: " ",
  help: "shift+?",
};

export interface UIState {
  mode: Mode;
  reducedMotion: boolean;
  shortcuts: ShortcutConfig;
  setMode: (m: Mode) => void;
  setReducedMotion: (v: boolean) => void;
  setShortcuts: (s: Partial<ShortcutConfig>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mode: "sanctuary",
      reducedMotion: false,
      shortcuts: defaultShortcuts,
      setMode: (mode) => set({ mode }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setShortcuts: (s) =>
        set((state) => ({
          shortcuts: { ...state.shortcuts, ...s },
        })),
    }),
    { name: "aurelia-ui", partialize: (s) => ({ reducedMotion: s.reducedMotion, shortcuts: s.shortcuts }) }
  )
);
