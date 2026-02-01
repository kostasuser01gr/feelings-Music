"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TRACKS = ["Drums", "Bass", "Chords", "Melody", "Vocals"] as const;
const LOOP_STEPS = 16;

export function ArrangementDaw() {
  const [grid, setGrid] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(TRACKS.map((t) => [t, Array(LOOP_STEPS).fill(false)]))
  );

  const toggle = (track: string, step: number) => {
    setGrid((g) => {
      const row = [...(g[track] ?? [])];
      row[step] = !row[step];
      return { ...g, [track]: row };
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Loop grid · DAW-lite v1. Click to toggle steps.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-left font-medium">
                Track
              </th>
              {Array.from({ length: LOOP_STEPS }, (_, i) => (
                <th
                  key={i}
                  className="w-8 border border-[var(--border)] bg-[var(--muted)] px-1 py-1 text-center font-mono text-xs"
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRACKS.map((track) => (
              <tr key={track}>
                <td className="border border-[var(--border)] px-2 py-1 font-medium">
                  {track}
                </td>
                {Array.from({ length: LOOP_STEPS }, (_, i) => (
                  <td key={i} className="border border-[var(--border)] p-0">
                    <button
                      type="button"
                      onClick={() => toggle(track, i)}
                      className={cn(
                        "h-8 w-full focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:ring-inset",
                        grid[track]?.[i]
                          ? "bg-amber-500/30"
                          : "bg-[var(--input)] hover:bg-[var(--muted)]"
                      )}
                      aria-pressed={grid[track]?.[i]}
                      aria-label={`${track} step ${i + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        Arrangement timeline + effects rack — Phase 3 polish.
      </p>
    </div>
  );
}
