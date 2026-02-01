"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

type Handler = () => void;

function parseShortcut(s: string): { key: string; ctrl: boolean; shift: boolean; alt: boolean } {
  const parts = s.toLowerCase().split("+");
  let key = "";
  let ctrl = false;
  let shift = false;
  let alt = false;
  for (const p of parts) {
    const t = p.trim();
    if (t === "mod" || t === "ctrl" || t === "meta") ctrl = true;
    else if (t === "shift") shift = true;
    else if (t === "alt") alt = true;
    else key = t;
  }
  return { key, ctrl, shift, alt };
}

function matchShortcut(
  evt: KeyboardEvent,
  shortcut: string
): boolean {
  const { key, ctrl, shift, alt } = parseShortcut(shortcut);
  const mod = evt.metaKey || evt.ctrlKey;
  if (key === " ") {
    if (evt.key !== " " || evt.repeat) return false;
    return !mod && !evt.altKey && evt.shiftKey === shift;
  }
  if (evt.key.toLowerCase() !== key) return false;
  if (ctrl && !mod) return false;
  if (shortcut.includes("mod") && !mod) return false;
  if (shift !== evt.shiftKey) return false;
  if (alt !== evt.altKey) return false;
  return true;
}

export function useShortcuts(options: {
  onCommandPalette?: Handler;
  onHelp?: Handler;
  onPlayPause?: Handler;
  onNew?: Handler;
  onSearch?: Handler;
  isTyping?: () => boolean;
}) {
  const router = useRouter();
  const { shortcuts, setMode } = useUIStore();
  const {
    onCommandPalette,
    onHelp,
    onPlayPause,
    onNew,
    onSearch,
    isTyping = () => false,
  } = options;

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      if (isTyping()) {
        if (matchShortcut(evt, shortcuts.commandPalette)) {
          evt.preventDefault();
          onCommandPalette?.();
        }
        if (matchShortcut(evt, shortcuts.help)) {
          evt.preventDefault();
          onHelp?.();
        }
        return;
      }

      if (matchShortcut(evt, shortcuts.commandPalette)) {
        evt.preventDefault();
        onCommandPalette?.();
        return;
      }
      if (matchShortcut(evt, shortcuts.search)) {
        evt.preventDefault();
        if (onSearch) {
          onSearch();
        } else {
          onCommandPalette?.();
        }
        return;
      }
      if (matchShortcut(evt, shortcuts.sanctuary)) {
        evt.preventDefault();
        setMode("sanctuary");
        router.push("/sanctuary");
        return;
      }
      if (matchShortcut(evt, shortcuts.studio)) {
        evt.preventDefault();
        setMode("studio");
        router.push("/studio");
        return;
      }
      if (matchShortcut(evt, shortcuts.cosmos)) {
        evt.preventDefault();
        setMode("cosmos");
        router.push("/cosmos");
        return;
      }
      if (matchShortcut(evt, shortcuts.meditation)) {
        evt.preventDefault();
        setMode("meditation");
        router.push("/meditation");
        return;
      }
      if (matchShortcut(evt, shortcuts.help)) {
        evt.preventDefault();
        onHelp?.();
        return;
      }
      if (matchShortcut(evt, shortcuts.playPause)) {
        evt.preventDefault();
        onPlayPause?.();
        return;
      }
      if (matchShortcut(evt, shortcuts.new)) {
        evt.preventDefault();
        onNew?.();
        return;
      }
    },
    [
      router,
      shortcuts,
      setMode,
      onCommandPalette,
      onHelp,
      onPlayPause,
      onNew,
      onSearch,
      isTyping,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
