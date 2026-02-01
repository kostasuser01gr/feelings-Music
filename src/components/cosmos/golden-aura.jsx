"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { latLngToVector3 } from "@/lib/cosmos-data";

const RADIUS = 0.52;
const TRAIL_LEN = 6;

function trailPoints(lat, lng) {
  const [x, y, z] = latLngToVector3(lat, lng, RADIUS);
  const out = [];
  const up = new THREE.Vector3(x, y, z).normalize();
  for (let i = 0; i < TRAIL_LEN; i++) {
    const t = (i + 1) / (TRAIL_LEN + 1);
    out.push(
      x + up.x * t * 0.1,
      y + up.y * t * 0.1 + t * 0.08,
      z + up.z * t * 0.1
    );
  }
  return out;
}

export function GoldenAura({ reducedMotion }) {
  const geom = useMemo(() => {
    const first = latLngToVector3(35.6, 139.7, RADIUS);
    const trail = trailPoints(35.6, 139.7);
    const pts = [...first, ...trail];
    const numPoints = 1 + trail.length / 3;
    const indices = [];
    for (let i = 0; i < numPoints - 1; i++) indices.push(i, i + 1);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    g.setIndex(indices);
    return g;
  }, []);

  if (reducedMotion) return null;

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#f59e0b" transparent opacity={0.7} />
    </lineSegments>
  );
}
