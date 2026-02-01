/**
 * Planet Weather Systems
 * Animated atmospheric effects: clouds, storms, auroras
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

interface WeatherSystemProps {
  planetRadius: number;
  planetType: 'earth' | 'mars' | 'jupiter' | 'venus' | 'neptune';
  musicData?: MusicAnalysisData;
}

export function WeatherSystem({ planetRadius, planetType, musicData }: WeatherSystemProps) {
  switch (planetType) {
    case 'earth':
      return <EarthWeather radius={planetRadius} musicData={musicData} />;
    case 'jupiter':
      return <JupiterStorms radius={planetRadius} musicData={musicData} />;
    case 'mars':
      return <MartianDust radius={planetRadius} musicData={musicData} />;
    case 'venus':
      return <VenusianClouds radius={planetRadius} musicData={musicData} />;
    case 'neptune':
      return <NeptuneStorms radius={planetRadius} musicData={musicData} />;
    default:
      return null;
  }
}

// Earth weather: clouds and auroras
function EarthWeather({ radius, musicData }: { radius: number; musicData?: MusicAnalysisData }) {
  const cloudRef = useRef<THREE.Mesh>(null);
  const auroraRef = useRef<THREE.Mesh>(null);
  
  // Cloud texture (procedural)
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Generate cloud pattern
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 20 + Math.random() * 60;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.05;
      
      const volume = musicData?.volume || 0;
      cloudRef.current.material.opacity = 0.3 + volume * 0.2;
    }
    
    if (auroraRef.current) {
      const bass = musicData?.bass || 0;
      auroraRef.current.material.opacity = 0.5 + bass * 0.5;
      auroraRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group>
      {/* Clouds */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[radius * 1.02, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Aurora at poles */}
      <mesh ref={auroraRef} position={[0, radius * 0.8, 0]}>
        <torusGeometry args={[radius * 0.3, radius * 0.1, 16, 100]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Jupiter: massive storms
function JupiterStorms({ radius, musicData }: { radius: number; musicData?: MusicAnalysisData }) {
  const stormRef = useRef<THREE.Group>(null);
  
  const storms = useMemo(() => {
    return Array(5).fill(null).map((_, i) => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lon: (i / 5) * Math.PI * 2,
      size: 0.2 + Math.random() * 0.3,
      speed: 0.1 + Math.random() * 0.2
    }));
  }, []);
  
  useFrame((state, delta) => {
    if (!stormRef.current) return;
    
    const volume = musicData?.volume || 0;
    
    stormRef.current.children.forEach((child, i) => {
      child.rotation.z += delta * storms[i].speed * (1 + volume);
      child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime + i) * 0.1);
    });
  });
  
  return (
    <group ref={stormRef}>
      {storms.map((storm, i) => {
        const x = radius * Math.cos(storm.lat) * Math.cos(storm.lon);
        const y = radius * Math.sin(storm.lat);
        const z = radius * Math.cos(storm.lat) * Math.sin(storm.lon);
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[radius * storm.size, 32, 32]} />
            <meshBasicMaterial
              color="#ff6600"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Mars: dust storms
function MartianDust({ radius, musicData }: { radius: number; musicData?: MusicAnalysisData }) {
  const dustRef = useRef<THREE.Points>(null);
  
  const particleCount = 1000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (1.01 + Math.random() * 0.1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    return positions;
  }, [radius, particleCount]);
  
  useFrame((state, delta) => {
    if (!dustRef.current) return;
    
    const beat = musicData?.beat || false;
    const speed = beat ? 0.2 : 0.05;
    
    dustRef.current.rotation.y += delta * speed;
    dustRef.current.rotation.x += delta * 0.01;
  });
  
  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#CD5C5C"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Venus: thick cloud layers
function VenusianClouds({ radius, musicData }: { radius: number; musicData?: MusicAnalysisData }) {
  const cloudLayerRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state, delta) => {
    cloudLayerRefs.current.forEach((layer, i) => {
      if (!layer) return;
      
      const bass = musicData?.bass || 0;
      layer.rotation.y += delta * (0.1 + i * 0.05) * (1 + bass);
    });
  });
  
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) cloudLayerRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[radius * (1.02 + i * 0.02), 64, 64]} />
          <meshStandardMaterial
            color="#FDB813"
            transparent
            opacity={0.3 - i * 0.08}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Neptune: dynamic storms
function NeptuneStorms({ radius, musicData }: { radius: number; musicData?: MusicAnalysisData }) {
  const stormRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!stormRef.current) return;
    
    const treble = musicData?.treble || 0;
    
    stormRef.current.rotation.y += delta * (0.5 + treble * 2);
    stormRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
  });
  
  return (
    <mesh ref={stormRef}>
      <sphereGeometry args={[radius * 0.3, 32, 32]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
