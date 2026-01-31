"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/stores/ui-store";
import { CosmosListView } from "./cosmos-list-view";

const CosmosScene = dynamic(
  () => import("./cosmos-scene").then((m) => m.CosmosScene),
  { ssr: false, loading: () => <CosmosPlaceholder /> }
);

function CosmosPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--background)]">
      <p className="text-[var(--muted-foreground)]">Loading Cosmos…</p>
    </div>
  );
}

export function CosmosView() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  return (
    <div className="relative h-full w-full" role="application" aria-label="Cosmos 3D view">
      <CosmosScene reducedMotion={reducedMotion} />
      <aside
        className="absolute right-0 top-0 z-10 flex h-full w-80 flex-col border-l border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur"
        aria-label="List view"
      >
        <CosmosListView />
      </aside>
    </div>
  );
}
