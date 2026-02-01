"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Loop, Synth } from "tone";
import { Button } from "@/components/ui/button";
import * as engine from "@/lib/audio-engine";
import { Play, Square, Download } from "lucide-react";

const DEFAULT_CODE = `// Minimal DSL: tempo(), synth(), schedule(), pattern()
tempo(120);
const s = synth({ type: "sine" });
schedule(s, [
  { time: 0, note: "C4", duration: "8n" },
  { time: 0.5, note: "E4", duration: "8n" },
  { time: 1, note: "G4", duration: "8n" },
  { time: 1.5, note: "C5", duration: "4n" },
]);
`;

export function CodeMode() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loopsRef = useRef<Loop[]>([]);
  const synthsRef = useRef<Synth[]>([]);

  const runCode = useCallback(async () => {
    setError(null);
    await engine.initAudio();
    engine.stopAll();
    loopsRef.current.forEach((l) => l.dispose());
    synthsRef.current.forEach((s) => s.dispose());
    loopsRef.current = [];
    synthsRef.current = [];

    const tempo = (bpm: number) => engine.setTempo(bpm);
    const synth = (opts?: { type?: "sine" | "square" | "sawtooth" | "triangle" }) => {
      const s = engine.createSynth(opts);
      synthsRef.current.push(s);
      return s;
    };
    const schedule = (
      s: Synth,
      notes: { time: number; note: string; duration: string; velocity?: number }[]
    ) => engine.schedule(s, notes);
    const pattern = (s: Synth, notes: string[], interval: string) => {
      const loop = engine.pattern(s, notes, interval);
      loopsRef.current.push(loop);
      return loop;
    };

    try {
      const fn = new Function(
        "tempo",
        "synth",
        "schedule",
        "pattern",
        `"use strict"; ${code}`
      );
      fn(tempo, synth, schedule, pattern);
      engine.getTransport().start();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Runtime error");
    }
  }, [code]);

  const stop = useCallback(() => {
    engine.stopAll();
    loopsRef.current.forEach((l) => l.dispose());
    synthsRef.current.forEach((s) => s.dispose());
    loopsRef.current = [];
    synthsRef.current = [];
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      engine.stopAll();
      loopsRef.current.forEach((l) => l.dispose());
      synthsRef.current.forEach((s) => s.dispose());
    };
  }, []);

  const handlePlay = useCallback(async () => {
    await runCode();
    setPlaying(true);
  }, [runCode]);

  const handleExport = useCallback(async () => {
    setError(null);
    setExporting(true);
    await engine.initAudio();
    try {
      const Tone = await import("tone");
      const blob = await engine.exportOffline(async (ctx) => {
        const tempo = (bpm: number) => {
          ctx.transport.bpm.value = bpm;
        };
        const synth = (opts?: { type?: "sine" | "square" | "sawtooth" | "triangle" }) => {
          return new Tone.Synth({
            oscillator: { type: opts?.type ?? "sine" },
            volume: -6,
          }).toDestination();
        };
        const schedule = (
          s: Synth,
          notes: { time: number; note: string; duration: string; velocity?: number }[]
        ) => {
          notes.forEach(({ time, note, duration, velocity: v = 0.8 }) => {
            s.triggerAttackRelease(note, duration, time, v);
          });
        };
        const pattern = (s: Synth, notes: string[], interval: string) => {
          let i = 0;
          return new Tone.Loop((time) => {
            const note = notes[i % notes.length];
            s.triggerAttackRelease(note, "8n", time, 0.7);
            i += 1;
          }, interval).start(0);
        };
        const fn = new Function(
          "tempo",
          "synth",
          "schedule",
          "pattern",
          `"use strict"; ${code}`
        );
        fn(tempo, synth, schedule, pattern);
        ctx.transport.start(0);
      }, 4);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "aurelia-export.wav";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [code]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={playing ? stop : handlePlay}
          className="flex items-center gap-2"
        >
          {playing ? (
            <>
              <Square className="h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export WAV"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="h-64 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-offset-2"
        spellCheck={false}
        aria-label="Code editor"
      />
      <p className="text-xs text-[var(--muted-foreground)]">
        API: <code>tempo(bpm)</code>, <code>synth({"{ type? }"})</code>,{" "}
        <code>schedule(synth, notes)</code>, <code>pattern(synth, notes, interval)</code>.
        Notes: <code>{`{ time, note, duration, velocity? }`}</code>.
      </p>
    </div>
  );
}
