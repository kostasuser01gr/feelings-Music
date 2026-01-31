"use client";

import { Suspense, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GlobePins } from "./globe-pins";
import { GlobeArcs } from "./globe-arcs";
import { Starfield } from "./starfield";
import { GoldenAura } from "./golden-aura";

function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    const color = new THREE.Color("#0c0a09");
    const prev = scene.background;
    /* eslint-disable react-hooks/immutability -- R3F scene.background is intentionally set */
    scene.background = color;
    return () => {
      scene.background = prev;
    };
    /* eslint-enable react-hooks/immutability */
  }, [scene]);
  return null;
}

export function SceneContent({ reducedMotion = false }) {
  const segments = reducedMotion ? 16 : 32;
  return (
    <Suspense fallback={null}>
      <SceneBackground />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh>
        <sphereGeometry args={[0.5, segments, segments]} />
        <meshStandardMaterial
          color="#1e3a2f"
          roughness={0.8}
          metalness={0.1}
          emissive="#0d2818"
        />
      </mesh>
      <GlobePins />
      <GlobeArcs reducedMotion={reducedMotion} />
      <GoldenAura reducedMotion={reducedMotion} />
      <Starfield reducedMotion={reducedMotion} />
      <OrbitControls enableZoom enablePan minDistance={1.2} maxDistance={5} />
    </Suspense>
  );
}
