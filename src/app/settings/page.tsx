"use client";

import { useUIStore } from "@/stores/ui-store";
import { Input } from "@/components/ui/input";

function LabelEl({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const shortcuts = useUIStore((s) => s.shortcuts);
  const setShortcuts = useUIStore((s) => s.setShortcuts);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Preferences, shortcuts, and accessibility.
        </p>
      </div>

      <section aria-labelledby="a11y-heading">
        <h2 id="a11y-heading" className="text-lg font-medium mb-4">
          Accessibility
        </h2>
        <div className="flex items-center gap-4">
          <input
            id="reduce-motion"
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] text-amber-500 focus:ring-amber-500/80"
            aria-describedby="reduce-motion-desc"
          />
          <div>
            <LabelEl htmlFor="reduce-motion">Reduce motion</LabelEl>
            <p id="reduce-motion-desc" className="text-sm text-[var(--muted-foreground)]">
              Simplifies Cosmos animations and UI transitions.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="text-lg font-medium mb-4">
          Shortcuts
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Keyboard shortcuts (e.g. <kbd>mod+k</kbd> for Ctrl/Cmd+K). Remappable
          here.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <LabelEl htmlFor="cmd-palette">Command palette</LabelEl>
            <Input
              id="cmd-palette"
              value={shortcuts.commandPalette}
              onChange={(e) =>
                setShortcuts({ commandPalette: e.target.value })
              }
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="sanctuary">Sanctuary</LabelEl>
            <Input
              id="sanctuary"
              value={shortcuts.sanctuary}
              onChange={(e) => setShortcuts({ sanctuary: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="studio">Studio</LabelEl>
            <Input
              id="studio"
              value={shortcuts.studio}
              onChange={(e) => setShortcuts({ studio: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="cosmos">Cosmos</LabelEl>
            <Input
              id="cosmos"
              value={shortcuts.cosmos}
              onChange={(e) => setShortcuts({ cosmos: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
