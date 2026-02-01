"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import {
  Home,
  Music,
  Globe,
  Plus,
  Settings,
  Users,
  FileText,
  Moon,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const shortcuts = useUIStore((s) => s.shortcuts);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const highContrast = useUIStore((s) => s.highContrast);
  const setHighContrast = useUIStore((s) => s.setHighContrast);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/sanctuary");
              })
            }
          >
            <Home className="mr-2 h-4 w-4" />
            Sanctuary
            <CommandShortcut>{shortcuts.sanctuary}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/studio");
              })
            }
          >
            <Music className="mr-2 h-4 w-4" />
            Studio
            <CommandShortcut>{shortcuts.studio}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/cosmos");
              })
            }
          >
            <Globe className="mr-2 h-4 w-4" />
            Cosmos
            <CommandShortcut>{shortcuts.cosmos}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/meditation");
              })
            }
          >
            <Moon className="mr-2 h-4 w-4" />
            Meditation
            <CommandShortcut>{shortcuts.meditation}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/bands");
              })
            }
          >
            <Users className="mr-2 h-4 w-4" />
            Bands
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/settings");
              })
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut>⌘ ,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/sanctuary?create=confession");
              })
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            New confession
            <CommandShortcut>{shortcuts.new}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/studio?new=1");
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New project
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                router.push("/meditation?session=5");
              })
            }
          >
            <Moon className="mr-2 h-4 w-4" />
            Start 5-minute meditation
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() =>
              run(() => {
                setTheme("ember");
              })
            }
          >
            Ember theme
            {theme === "ember" && <CommandShortcut>Active</CommandShortcut>}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                setTheme("aurora");
              })
            }
          >
            Aurora theme
            {theme === "aurora" && <CommandShortcut>Active</CommandShortcut>}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                setTheme("noir");
              })
            }
          >
            Noir theme
            {theme === "noir" && <CommandShortcut>Active</CommandShortcut>}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                setHighContrast(!highContrast);
              })
            }
          >
            {highContrast ? "Disable" : "Enable"} high contrast
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                setReducedMotion(!reducedMotion);
              })
            }
          >
            {reducedMotion ? "Disable" : "Enable"} reduced motion
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
