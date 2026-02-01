"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MOCK_PINS, latLngToVector3 } from "@/lib/cosmos-data";

const RADIUS = 0.52;
const PIN_SCALE = 0.015;

export function GlobePins({ reducedMotion = false }) {
  const pins = useMemo(() => {
    return MOCK_PINS.map((p) => {
      const [x, y, z] = latLngToVector3(p.lat, p.lng, RADIUS);
      return { id: p.id, x, y, z, title: p.title };
    });
  }, []);

  const density = reducedMotion ? 2 : 1;
  const visiblePins = useMemo(
    () => pins.filter((_, i) => i % density === 0),
    [pins, density]
  );

  const geometry = useMemo(() => {
    const segments = reducedMotion ? 6 : 8;
    return new THREE.SphereGeometry(1, segments, segments - 2);
  }, [reducedMotion]);

  return (
    <group>
      {visiblePins.map(({ id, x, y, z }) => (
        <mesh
          key={id}
          position={[x, y, z]}
          scale={[PIN_SCALE, PIN_SCALE, PIN_SCALE]}
          geometry={geometry}
        >
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}
    </group>
  );
}
