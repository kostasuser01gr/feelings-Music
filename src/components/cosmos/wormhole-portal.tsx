/**
 * Wormhole Portal System
 * Visual portals for teleportation between planets
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

interface WormholeProps {
  position: [number, number, number];
  destination: string;
  color?: string;
  active?: boolean;
  musicData?: MusicAnalysisData;
  onEnter?: (destination: string) => void;
}

export function Wormhole({
  position,
  destination,
  color = '#00ffff',
  active = true,
  musicData,
  onEnter
}: WormholeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create swirling particle effect
  const particleGeometry = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 8;
      const radius = (i / count) * 3;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, [color]);
  
  // Animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const bass = musicData?.bass || 0;
    const volume = musicData?.volume || 0;
    
    // Rotate portal
    groupRef.current.rotation.z += delta * (0.5 + bass * 2);
    
    // Pulse size
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 + volume * 0.2;
    groupRef.current.scale.setScalar(scale);
    
    // Animate rings
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.z += delta * (1 + i * 0.2);
      ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (i + 1)) * 0.05);
    });
    
    // Swirl particles
    if (particlesRef.current) {
      particlesRef.current.rotation.z -= delta * 2;
    }
  });
  
  return (
    <group
      ref={groupRef}
      position={position}
      onClick={() => active && onEnter?.(destination)}
    >
      {/* Portal rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ringRefs.current[i] = el;
          }}
        >
          <torusGeometry args={[2 + i * 0.5, 0.1, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5 + i * 0.2}
            transparent
            opacity={0.7 - i * 0.2}
          />
        </mesh>
      ))}
      
      {/* Center disc */}
      <mesh>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Swirling particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Destination label */}
      <Html position={[0, 3, 0]} center>
        <div className="text-white text-sm font-bold bg-black/50 px-2 py-1 rounded">
          {destination}
        </div>
      </Html>
    </group>
  );
}

// Portal manager component
export function PortalSystem({
  portals,
  musicData,
  onTeleport
}: {
  portals: Array<{
    id: string;
    position: [number, number, number];
    destination: string;
    color?: string;
  }>;
  musicData?: MusicAnalysisData;
  onTeleport?: (destination: string) => void;
}) {
  return (
    <group>
      {portals.map((portal) => (
        <Wormhole
          key={portal.id}
          position={portal.position}
          destination={portal.destination}
          color={portal.color}
          musicData={musicData}
          onEnter={onTeleport}
        />
      ))}
    </group>
  );
}

// HTML label component (needs to be defined or imported from drei)
function Html({ position, center, children }: any) {
  return (
    <mesh position={position}>
      <planeGeometry args={[2, 0.5]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
