"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { initAudio, createSynth, stopAll } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

const DURATIONS = [5, 10, 15, 20, 30] as const;

interface MeditationTimerProps {
  initialMinutes?: number;
}

export function MeditationTimer({ initialMinutes }: MeditationTimerProps) {
  const safeInitial = useMemo(() => {
    if (!initialMinutes || Number.isNaN(initialMinutes)) return 10;
    return Math.min(45, Math.max(3, Math.round(initialMinutes)));
  }, [initialMinutes]);

  const [minutes, setMinutes] = useState(safeInitial);
  const [remaining, setRemaining] = useState(safeInitial * 60);
  const [running, setRunning] = useState(false);
  const bellRef = useRef<ReturnType<typeof createSynth> | null>(null);

  useEffect(() => {
    setMinutes(safeInitial);
    setRemaining(safeInitial * 60);
  }, [safeInitial]);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining !== 0 || running) return;
    const playBell = async () => {
      await initAudio();
      if (!bellRef.current) {
        bellRef.current = createSynth({ type: "sine", volume: -10 });
      }
      bellRef.current.triggerAttackRelease("C5", "2n");
    };
    playBell();
  }, [remaining, running]);

  useEffect(() => () => stopAll(), []);

  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(remaining % 60)
    .toString()
    .padStart(2, "0");

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Meditation timer</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Set a gentle focus window. A soft bell plays when time ends.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-sm font-mono">
          {mm}:{ss}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setMinutes(d);
              setRemaining(d * 60);
              setRunning(false);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              minutes === d
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            )}
          >
            {d} min
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          onClick={() => setRunning((v) => !v)}
          variant={running ? "secondary" : "default"}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRemaining(minutes * 60);
            setRunning(false);
          }}
        >
          Reset
        </Button>
      </div>
    </section>
  );
}
