"use client";

import { useMemo } from "react";
import * as THREE from "three";

const COUNT = 2000;

export function Starfield({ reducedMotion }) {
  const positions = useMemo(() => {
    const n = reducedMotion ? 400 : COUNT;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const k = (i * 9973) % 10000;
      const k2 = (i * 7919) % 10000;
      const k3 = (i * 5527) % 10000;
      const r = 4 + (k / 10000) * 6;
      const theta = (k2 / 10000) * Math.PI * 2;
      const phi = Math.acos(2 * (k3 / 10000) - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [reducedMotion]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points geometry={geom}>
      <pointsMaterial
        size={reducedMotion ? 0.06 : 0.04}
        color="#e8e0d5"
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}
