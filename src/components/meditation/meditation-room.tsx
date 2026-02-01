"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores/ui-store";
import { MeditationBreath } from "@/components/meditation/meditation-breath";
import { MeditationTimer } from "@/components/meditation/meditation-timer";
const MeditationSoundscape = dynamic(
  () =>
    import("@/components/meditation/meditation-soundscape").then(
      (m) => m.MeditationSoundscape
    ),
  { ssr: false }
);

const INTENTION_PRESETS = [
  "soften the body",
  "release tension",
  "quiet the mind",
  "hold compassion",
  "ground in gratitude",
] as const;

function MeditationRoomContent() {
  const setMode = useUIStore((s) => s.setMode);
  const searchParams = useSearchParams();
  const sessionParam = Number(searchParams.get("session"));
  const initialMinutes = Number.isFinite(sessionParam) ? sessionParam : undefined;

  const [intention, setIntention] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("aurelia-meditation-intention") ?? "";
  });

  useEffect(() => {
    setMode("meditation");
  }, [setMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("aurelia-meditation-intention", intention);
  }, [intention]);

  const intentionValue = useMemo(() => intention.trim(), [intention]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Meditation Room</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            A quiet space to breathe, focus, and reconnect your music to calm.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sanctuary">Journal in Sanctuary</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/cosmos">Explore calm in Cosmos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/studio">Return to Studio</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <MeditationBreath />
          <MeditationTimer initialMinutes={initialMinutes} />
          <MeditationSoundscape />
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="font-serif text-2xl font-semibold">Set an intention</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              A small phrase helps anchor the session. Keep it simple.
            </p>
            <input
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Example: soften the body"
              className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/80"
              aria-label="Meditation intention"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {INTENTION_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setIntention(p)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 text-sm text-[var(--muted-foreground)]">
              {intentionValue
                ? `Your anchor: “${intentionValue}”.`
                : "No intention set yet — choose a phrase when ready."}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="font-serif text-2xl font-semibold">Connect your flow</h2>
            <Tabs defaultValue="sanctuary" className="mt-4 w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sanctuary">Sanctuary</TabsTrigger>
                <TabsTrigger value="cosmos">Cosmos</TabsTrigger>
                <TabsTrigger value="studio">Studio</TabsTrigger>
              </TabsList>
              <TabsContent value="sanctuary" className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
                <p>Turn your intention into a short confession and save the moment.</p>
                <Button size="sm" asChild>
                  <Link href="/sanctuary?create=confession">Write confession</Link>
                </Button>
              </TabsContent>
              <TabsContent value="cosmos" className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
                <p>Explore calm, ambient tracks synced with your mood.</p>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/cosmos">Open calm list</Link>
                </Button>
              </TabsContent>
              <TabsContent value="studio" className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
                <p>Carry this session into a slow ambient arrangement.</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/studio?new=1">Start ambient project</Link>
                </Button>
              </TabsContent>
            </Tabs>
          </section>
        </aside>
      </section>
    </div>
  );
}

export function MeditationRoom() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl space-y-8"><div className="font-serif text-3xl font-semibold">Loading meditation room...</div></div>}>
      <MeditationRoomContent />
    </Suspense>
  );
}
