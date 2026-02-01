"use client";

import { useUIStore, type FontScale } from "@/stores/ui-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const highContrast = useUIStore((s) => s.highContrast);
  const setHighContrast = useUIStore((s) => s.setHighContrast);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const fontScale = useUIStore((s) => s.fontScale);
  const setFontScale = useUIStore((s) => s.setFontScale);
  const shortcuts = useUIStore((s) => s.shortcuts);
  const setShortcuts = useUIStore((s) => s.setShortcuts);
  const resetShortcuts = useUIStore((s) => s.resetShortcuts);

  const handleFontScaleChange = (value: number) => {
    setFontScale(value as FontScale);
  };

  const handleExport = () => {
    const payload = JSON.stringify(shortcuts, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aurelia-shortcuts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as Partial<typeof shortcuts>;
      setShortcuts(parsed);
    } catch {
      // Ignore malformed imports
    }
  };

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
        <div className="space-y-4">
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
          <div className="flex items-center gap-4">
            <input
              id="high-contrast"
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-amber-500 focus:ring-amber-500/80"
              aria-describedby="high-contrast-desc"
            />
            <div>
              <LabelEl htmlFor="high-contrast">High contrast</LabelEl>
              <p id="high-contrast-desc" className="text-sm text-[var(--muted-foreground)]">
                Boosts contrast for text and focus states.
              </p>
            </div>
          </div>
          <div>
            <LabelEl htmlFor="font-scale">Font scale</LabelEl>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="font-scale"
                type="range"
                min={0.9}
                max={1.2}
                step={0.05}
                value={fontScale}
                onChange={(e) => handleFontScaleChange(Number(e.target.value))}
                className="w-full accent-amber-500"
                aria-describedby="font-scale-desc"
              />
              <span className="w-14 text-right text-sm text-[var(--muted-foreground)]">
                {Math.round(fontScale * 100)}%
              </span>
            </div>
            <p id="font-scale-desc" className="text-sm text-[var(--muted-foreground)] mt-1">
              Increase or reduce the base font size across the app.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-lg font-medium mb-4">
          Appearance
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={theme === "ember" ? "default" : "secondary"}
            onClick={() => setTheme("ember")}
          >
            Ember
          </Button>
          <Button
            type="button"
            variant={theme === "aurora" ? "default" : "secondary"}
            onClick={() => setTheme("aurora")}
          >
            Aurora
          </Button>
          <Button
            type="button"
            variant={theme === "noir" ? "default" : "secondary"}
            onClick={() => setTheme("noir")}
          >
            Noir
          </Button>
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Themes update the entire color system instantly.
        </p>
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
            <LabelEl htmlFor="search">Search</LabelEl>
            <Input
              id="search"
              value={shortcuts.search}
              onChange={(e) => setShortcuts({ search: e.target.value })}
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
          <div>
            <LabelEl htmlFor="meditation">Meditation</LabelEl>
            <Input
              id="meditation"
              value={shortcuts.meditation}
              onChange={(e) => setShortcuts({ meditation: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="new">New</LabelEl>
            <Input
              id="new"
              value={shortcuts.new}
              onChange={(e) => setShortcuts({ new: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="play-pause">Play / Pause</LabelEl>
            <Input
              id="play-pause"
              value={shortcuts.playPause}
              onChange={(e) => setShortcuts({ playPause: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <LabelEl htmlFor="help">Help</LabelEl>
            <Input
              id="help"
              value={shortcuts.help}
              onChange={(e) => setShortcuts({ help: e.target.value })}
              className="mt-1 font-mono"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={handleExport}>
            Export shortcuts
          </Button>
          <Button asChild type="button" variant="outline">
            <label className="cursor-pointer">
              Import shortcuts
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={(e) => void handleImport(e.target.files?.[0] ?? null)}
              />
            </label>
          </Button>
          <Button type="button" variant="ghost" onClick={resetShortcuts}>
            Reset to defaults
          </Button>
        </div>
      </section>
    </div>
  );
}
