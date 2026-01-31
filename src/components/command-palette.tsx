"use client";

import { useCallback, useEffect } from "react";
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
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const shortcuts = useUIStore((s) => s.shortcuts);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

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
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
