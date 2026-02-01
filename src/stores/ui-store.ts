import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export type Mode = "sanctuary" | "studio" | "cosmos" | "meditation";
export type ThemeName = "ember" | "aurora" | "noir";
export type FontScale = 0.9 | 1 | 1.05 | 1.1 | 1.15 | 1.2;

export interface ShortcutConfig {
  commandPalette: string;
  sanctuary: string;
  studio: string;
  cosmos: string;
  meditation: string;
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
  meditation: "mod+4",
  search: "/",
  new: "n",
  playPause: " ",
  help: "shift+?",
};

export interface UIState {
  mode: Mode;
  reducedMotion: boolean;
  highContrast: boolean;
  theme: ThemeName;
  fontScale: FontScale;
  shortcuts: ShortcutConfig;
  setMode: (m: Mode) => void;
  setReducedMotion: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setTheme: (t: ThemeName) => void;
  setFontScale: (v: FontScale) => void;
  setShortcuts: (s: Partial<ShortcutConfig>) => void;
  resetShortcuts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mode: "sanctuary",
      reducedMotion: false,
      highContrast: false,
      theme: "ember",
      fontScale: 1,
      shortcuts: defaultShortcuts,
      setMode: (mode) => set({ mode }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
      setShortcuts: (s) =>
        set((state) => ({
          shortcuts: { ...state.shortcuts, ...s },
        })),
      resetShortcuts: () => set({ shortcuts: defaultShortcuts }),
    }),
    {
      name: "aurelia-ui",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        const noopStorage: StateStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
        return noopStorage;
      }),
      partialize: (s) => ({
        reducedMotion: s.reducedMotion,
        highContrast: s.highContrast,
        theme: s.theme,
        fontScale: s.fontScale,
        shortcuts: s.shortcuts,
      }),
    }
  )
);
