"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneContent } from "./cosmos-scene-inner";

interface CosmosSceneProps {
  reducedMotion: boolean;
  audioEnabled?: boolean;
  quality?: number;
  viewMode?: string;
}

export function CosmosScene({ 
  reducedMotion, 
  audioEnabled = false, 
  quality = 1.0,
  viewMode = 'explore' 
}: CosmosSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, Math.min(2, quality * 2)]}
        gl={{ 
          antialias: quality > 0.5, 
          alpha: true,
          powerPreference: quality > 0.7 ? "high-performance" : "default"
        }}
        shadows={quality > 0.6}
        performance={{
          min: quality < 0.5 ? 0.3 : 0.5,
          max: 1,
          debounce: 200
        }}
      >
        <SceneContent 
          reducedMotion={reducedMotion}
          audioEnabled={audioEnabled}
          quality={quality}
          viewMode={viewMode}
        />
      </Canvas>
    </div>
  );
}
