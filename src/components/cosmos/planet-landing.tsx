/**
 * Planet Landing Experience
 * Interactive 3D terrain when landing on planets
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

interface TerrainData {
  type: 'rocky' | 'desert' | 'ice' | 'gas' | 'ocean';
  color: string;
  roughness: number;
  features: string[];
}

interface PlanetLandingProps {
  planetName: string;
  musicData?: MusicAnalysisData;
  onExit?: () => void;
}

export function PlanetLanding({ planetName, musicData, onExit }: PlanetLandingProps) {
  const terrain = getPlanetTerrain(planetName);
  
  return (
    <group>
      <ProceduralTerrain terrain={terrain} musicData={musicData} />
      <AtmosphericEffects planetName={planetName} musicData={musicData} />
      <LandingPad onExit={onExit} />
    </group>
  );
}

// Procedural terrain generation
function ProceduralTerrain({
  terrain,
  musicData
}: {
  terrain: TerrainData;
  musicData?: MusicAnalysisData;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  
  // Generate terrain heightmap
  const heightData = useMemo(() => {
    const size = 128;
    const data = new Float32Array(size * size);
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = (i / size) * 10;
        const y = (j / size) * 10;
        
        // Multi-octave noise simulation
        let height = 0;
        height += Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2;
        height += Math.sin(x * 1.2) * Math.cos(y * 1.2) * 1;
        height += Math.sin(x * 2.4) * Math.cos(y * 2.4) * 0.5;
        height += (Math.random() - 0.5) * 0.3;
        
        data[i * size + j] = height;
      }
    }
    
    return data;
  }, []);
  
  // Apply heightmap to geometry
  useEffect(() => {
    if (!geometryRef.current) return;
    
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const size = 128;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 2] = heightData[i] || 0;
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  }, [heightData]);
  
  // Animate terrain based on music
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const bass = musicData?.bass || 0;
    
    // Subtle pulsing
    meshRef.current.scale.z = 1 + bass * 0.1;
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry ref={geometryRef} args={[100, 100, 127, 127]} />
      <meshStandardMaterial
        color={terrain.color}
        roughness={terrain.roughness}
        metalness={0.1}
        wireframe={false}
      />
    </mesh>
  );
}

// Atmospheric effects for planet
function AtmosphericEffects({
  planetName,
  musicData
}: {
  planetName: string;
  musicData?: MusicAnalysisData;
}) {
  const fogRef = useRef<THREE.Fog>(null);
  
  useFrame(() => {
    const volume = musicData?.volume || 0;
    
    // Adjust fog density with music
    if (fogRef.current) {
      fogRef.current.far = 50 + volume * 30;
    }
  });
  
  const fogColor = useMemo(() => {
    const colors: Record<string, string> = {
      Mercury: '#8B7355',
      Venus: '#FDB813',
      Earth: '#87CEEB',
      Mars: '#CD5C5C',
      Jupiter: '#DAA520',
      Saturn: '#F4A460',
      Uranus: '#4FD0E7',
      Neptune: '#4169E1'
    };
    return colors[planetName] || '#87CEEB';
  }, [planetName]);
  
  return (
    <>
      <fog ref={fogRef} attach="fog" args={[fogColor, 10, 80]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

// Landing pad  with exit functionality
function LandingPad({ onExit }: { onExit?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotating platform
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  
  return (
    <group position={[0, -1.9, 0]}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onExit}
      >
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Exit hologram */}
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshBasicMaterial
          color="#00ff00"
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Get terrain data for each planet
function getPlanetTerrain(planetName: string): TerrainData {
  const terrainMap: Record<string, TerrainData> = {
    Mercury: {
      type: 'rocky',
      color: '#8B7355',
      roughness: 0.9,
      features: ['craters', 'cliffs']
    },
    Venus: {
      type: 'desert',
      color: '#FDB813',
      roughness: 0.7,
      features: ['volcanoes', 'lava']
    },
    Earth: {
      type: 'ocean',
      color: '#2E8B57',
      roughness: 0.5,
      features: ['mountains', 'valleys', 'water']
    },
    Mars: {
      type: 'desert',
      color: '#CD5C5C',
      roughness: 0.8,
      features: ['canyons', 'dunes']
    },
    Jupiter: {
      type: 'gas',
      color: '#DAA520',
      roughness: 0.3,
      features: ['storms', 'bands']
    },
    Saturn: {
      type: 'gas',
      color: '#F4A460',
      roughness: 0.3,
      features: ['storms', 'bands']
    },
    Uranus: {
      type: 'ice',
      color: '#4FD0E7',
      roughness: 0.4,
      features: ['ice', 'clouds']
    },
    Neptune: {
      type: 'ice',
      color: '#4169E1',
      roughness: 0.4,
      features: ['storms', 'ice']
    }
  };
  
  return terrainMap[planetName] || terrainMap.Earth;
}

// Import for useEffect
import { useEffect } from 'react';
