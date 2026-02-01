"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const PHASES = [
  { label: "Inhale", seconds: 4, tone: "Focus on rising" },
  { label: "Hold", seconds: 4, tone: "Keep it gentle" },
  { label: "Exhale", seconds: 6, tone: "Let go slowly" },
  { label: "Hold", seconds: 2, tone: "Stillness" },
] as const;

type BreathPhase = (typeof PHASES)[number];

export function MeditationBreath() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const total = PHASES.reduce((sum, p) => sum + p.seconds, 0);
  const cycle = total === 0 ? 0 : elapsed % total;
  let acc = 0;
  let phase: BreathPhase = PHASES[0];
  let remaining = PHASES[0].seconds;
  let progress = 0;
  for (const p of PHASES) {
    if (cycle < acc + p.seconds) {
      phase = p;
      remaining = acc + p.seconds - cycle;
      progress = (p.seconds - remaining) / p.seconds;
      break;
    }
    acc += p.seconds;
  }

  const scale = reducedMotion
    ? 1
    : phase.label === "Inhale"
      ? 1 + 0.25 * progress
      : phase.label === "Exhale"
        ? 1.25 - 0.25 * progress
        : 1.25;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Breath rhythm</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Follow the gentle cadence to settle your body.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRunning((v) => !v)}
        >
          {running ? "Pause" : "Resume"}
        </Button>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="relative flex min-h-[180px] items-center justify-center">
          <div
            className={cn(
              "absolute h-40 w-40 rounded-full bg-amber-500/10 blur-2xl",
              reducedMotion ? "" : "transition-transform duration-700"
            )}
            style={{ transform: `scale(${scale})` }}
            aria-hidden
          />
          <div
            className={cn(
              "relative flex h-36 w-36 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10",
              reducedMotion ? "" : "transition-transform duration-700"
            )}
            style={{ transform: `scale(${scale})` }}
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {phase.label}
              </p>
              <p className="mt-1 text-3xl font-semibold text-amber-200">
                {remaining}s
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)]">{phase.tone}</p>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
            <p className="text-sm">
              Cycle: 4-4-6-2 · Repeat as long as you like.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setElapsed(0)}>
            Reset cycle
          </Button>
        </div>
      </div>
    </section>
  );
}
