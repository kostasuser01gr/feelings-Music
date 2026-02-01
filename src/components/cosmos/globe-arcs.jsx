"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MOCK_PINS, MOCK_CONNECTIONS, latLngToVector3 } from "@/lib/cosmos-data";

const RADIUS = 0.55;

function arcPoints(from, to, segments = 24) {
  const vFrom = new THREE.Vector3(...from);
  const vTo = new THREE.Vector3(...to);
  const mid = vFrom.clone().add(vTo).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(RADIUS * 1.15);
  const curve = new THREE.QuadraticBezierCurve3(vFrom, mid, vTo);
  return curve.getPoints(segments);
}

export function GlobeArcs({ reducedMotion }) {
  const geom = useMemo(() => {
    const pts = [];
    const idx = [];
    const pinMap = Object.fromEntries(
      MOCK_PINS.map((p) => [p.id, latLngToVector3(p.lat, p.lng, RADIUS)])
    );
    const segs = reducedMotion ? 8 : 24;
    MOCK_CONNECTIONS.forEach((c) => {
      const from = pinMap[c.fromId];
      const to = pinMap[c.toId];
      if (!from || !to) return;
      const arc = arcPoints(from, to, segs);
      const base = pts.length / 3;
      arc.forEach((p) => {
        pts.push(p.x, p.y, p.z);
      });
      for (let i = 0; i < arc.length - 1; i++) {
        idx.push(base + i, base + i + 1);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }, [reducedMotion]);

  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#f59e0b" />
    </lineSegments>
  );
}
