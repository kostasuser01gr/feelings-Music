"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { initAudio, createSynth, pattern, setTempo, stopAll, getTransport } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    id: "breath",
    name: "Breath",
    tempo: 56,
    notes: ["C4", "D4", "G4", "A4"],
    interval: "2n",
    osc: "sine" as const,
  },
  {
    id: "stillness",
    name: "Stillness",
    tempo: 48,
    notes: ["A3", "C4", "E4"],
    interval: "1n",
    osc: "triangle" as const,
  },
  {
    id: "glow",
    name: "Glow",
    tempo: 64,
    notes: ["D4", "F4", "A4", "C5"],
    interval: "2n",
    osc: "sine" as const,
  },
] as const;

export function MeditationSoundscape() {
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]["id"]>(PRESETS[0].id);
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef<ReturnType<typeof createSynth> | null>(null);
  const loopRef = useRef<ReturnType<typeof pattern> | null>(null);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId]
  );

  const stop = useCallback(() => {
    stopAll();
    loopRef.current = null;
    synthRef.current?.dispose?.();
    synthRef.current = null;
  }, []);

  const start = useCallback(async () => {
    await initAudio();
    stopAll();
    synthRef.current?.dispose?.();
    synthRef.current = createSynth({ type: preset.osc, volume: -14 });
    setTempo(preset.tempo);
    loopRef.current = pattern(synthRef.current, [...preset.notes], preset.interval);
    getTransport().start();
  }, [preset]);

  useEffect(() => {
    if (!playing) return;
    start();
    return () => {
      stopAll();
    };
  }, [playing, presetId, start]);

  useEffect(() => () => stop(), [stop]);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Soundscape</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Soft synth loops designed for slow focus.
          </p>
        </div>
        <Button
          size="sm"
          variant={playing ? "secondary" : "default"}
          onClick={() => {
            if (playing) {
              stop();
              setPlaying(false);
            } else {
              setPlaying(true);
              start();
            }
          }}
        >
          {playing ? "Stop" : "Play"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPresetId(p.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              presetId === p.id
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 text-sm text-[var(--muted-foreground)]">
        Tempo {preset.tempo} bpm · {preset.notes.join(" ")} · {preset.interval}
      </div>
    </section>
  );
}
