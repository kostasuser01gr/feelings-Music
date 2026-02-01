"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";

interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  const shortcuts = useUIStore((s) => s.shortcuts);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions for navigating Aurelia.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-3 text-sm">
          <ShortcutRow label="Command palette" value={shortcuts.commandPalette} />
          <ShortcutRow label="Search" value={shortcuts.search} />
          <ShortcutRow label="Sanctuary" value={shortcuts.sanctuary} />
          <ShortcutRow label="Meditation" value={shortcuts.meditation} />
          <ShortcutRow label="Studio" value={shortcuts.studio} />
          <ShortcutRow label="Cosmos" value={shortcuts.cosmos} />
          <ShortcutRow label="New" value={shortcuts.new} />
          <ShortcutRow label="Play / Pause" value={shortcuts.playPause} />
          <ShortcutRow label="Help" value={shortcuts.help} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2">
      <span className="text-[var(--foreground)]">{label}</span>
      <span className="font-mono text-xs text-[var(--muted-foreground)]">
        {value}
      </span>
    </div>
  );
}
