"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUIStore } from "@/stores/ui-store";
import { CosmosControls } from "./cosmos-controls";
import { ErrorBoundary } from "@/components/error-boundary";

const CosmosScene = dynamic(
  () => import("./cosmos-scene").then((m) => m.CosmosScene),
  { ssr: false, loading: () => <CosmosPlaceholder /> }
);

function CosmosPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[var(--muted-foreground)]">Initializing Cosmos...</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Loading real-time astronomical data and 3D engine
        </p>
      </div>
    </div>
  );
}

export function CosmosView() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [quality, setQuality] = useState(1.0);
  const [viewMode, setViewMode] = useState('explore');

  const handleAudioToggle = (enabled: boolean) => {
    setAudioEnabled(enabled);
    console.log('Audio toggled:', enabled);
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    console.log('Quality changed:', newQuality);
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    console.log('View mode changed:', mode);
  };

  return (
    <div className="relative h-full w-full" role="application" aria-label="Cosmos 3D view">
      <ErrorBoundary>
        <CosmosScene 
          reducedMotion={reducedMotion}
          audioEnabled={audioEnabled}
          quality={quality}
          viewMode={viewMode}
        />
      </ErrorBoundary>
      
      <aside
        className="absolute right-0 top-0 z-10 flex h-full w-80 flex-col border-l border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur overflow-y-auto"
        aria-label="Cosmos controls"
      >
        <CosmosControls
          onAudioToggle={handleAudioToggle}
          onQualityChange={handleQualityChange}
          onViewModeChange={handleViewModeChange}
        />
      </aside>

      {/* Full-screen toggle */}
      <button
        className="absolute top-4 left-4 z-20 p-2 bg-[var(--card)]/80 backdrop-blur rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors"
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }}
        aria-label="Toggle fullscreen"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>

      {/* Performance indicator */}
      <div className="absolute bottom-4 left-4 z-20 p-2 bg-[var(--card)]/80 backdrop-blur rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span>Audio: {audioEnabled ? 'Active' : 'Inactive'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Quality: {Math.round(quality * 100)}%</span>
        </div>
      </div>

      {/* Help overlay toggle */}
      <button
        className="absolute top-4 right-[21rem] z-20 p-2 bg-[var(--card)]/80 backdrop-blur rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors"
        aria-label="Show help"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <point cx="12" cy="17" />
        </svg>
      </button>
    </div>
  );
}
