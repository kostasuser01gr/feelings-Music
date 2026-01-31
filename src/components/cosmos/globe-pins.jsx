"use client";

import { useMemo } from "react";
import { MOCK_PINS, latLngToVector3 } from "@/lib/cosmos-data";

const RADIUS = 0.52;
const PIN_SCALE = 0.015;

export function GlobePins() {
  const pins = useMemo(() => {
    return MOCK_PINS.map((p) => {
      const [x, y, z] = latLngToVector3(p.lat, p.lng, RADIUS);
      return { id: p.id, x, y, z, title: p.title };
    });
  }, []);

  return (
    <group>
      {pins.map(({ id, x, y, z }) => (
        <mesh key={id} position={[x, y, z]} scale={[PIN_SCALE, PIN_SCALE, PIN_SCALE]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}
    </group>
  );
}
