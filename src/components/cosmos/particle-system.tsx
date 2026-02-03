/**
 * Advanced Particle System
 * Music-reactive particles with various effects:
 * - Comet tails
 * - Shooting stars
 * - Orbital trails
 * - Nebula particles
 * - Energy bursts
 */

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

interface ParticleSystemProps {
  count?: number;
  musicData?: MusicAnalysisData;
  type?: 'trail' | 'stars' | 'nebula' | 'burst' | 'orbital';
  color?: string;
  size?: number;
  speed?: number;
}

export function ParticleSystem({
  count = 1000,
  musicData,
  type = 'stars',
  color = '#ffffff',
  size = 0.05,
  speed = 1
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const lifetimesRef = useRef<Float32Array | null>(null);
  
  // Seeded random generator for deterministic particle positions
  const createSeededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  // Create particle geometry and materials
  const { positions, colors, sizes } = useMemo(() => {
    // Create seeded random for deterministic particles
    const random = createSeededRandom(count * (type === 'stars' ? 1 : type === 'nebula' ? 2 : type === 'burst' ? 3 : type === 'orbital' ? 4 : 5));
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Initialize positions based on type
      switch (type) {
        case 'stars':
          // Random sphere distribution
          const theta = random() * Math.PI * 2;
          const phi = Math.acos(2 * random() - 1);
          const radius = 50 + random() * 150;
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
          velocities[i3] = (random() - 0.5) * 0.01;
          velocities[i3 + 1] = (random() - 0.5) * 0.01;
          velocities[i3 + 2] = (random() - 0.5) * 0.01;
          break;
          
        case 'nebula':
          // Clustered cloud
          const angle = random() * Math.PI * 2;
          const distance = random() * 30;
          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = (random() - 0.5) * 10;
          positions[i3 + 2] = Math.sin(angle) * distance;
          velocities[i3] = Math.cos(angle) * 0.02;
          velocities[i3 + 1] = (random() - 0.5) * 0.01;
          velocities[i3 + 2] = Math.sin(angle) * 0.02;
          break;
          
        case 'burst':
          // Radial burst from center
          const burstTheta = random() * Math.PI * 2;
          const burstPhi = Math.acos(2 * random() - 1);
          positions[i3] = 0;
          positions[i3 + 1] = 0;
          positions[i3 + 2] = 0;
          velocities[i3] = Math.sin(burstPhi) * Math.cos(burstTheta) * 0.5;
          velocities[i3 + 1] = Math.sin(burstPhi) * Math.sin(burstTheta) * 0.5;
          velocities[i3 + 2] = Math.cos(burstPhi) * 0.5;
          break;
          
        case 'orbital':
          // Ring around origin
          const orbitalAngle = (i / count) * Math.PI * 2;
          const orbitalRadius = 20 + random() * 5;
          positions[i3] = Math.cos(orbitalAngle) * orbitalRadius;
          positions[i3 + 1] = (random() - 0.5) * 2;
          positions[i3 + 2] = Math.sin(orbitalAngle) * orbitalRadius;
          velocities[i3] = -Math.sin(orbitalAngle) * 0.05;
          velocities[i3 + 1] = 0;
          velocities[i3 + 2] = Math.cos(orbitalAngle) * 0.05;
          break;
          
        default:
          positions[i3] = (random() - 0.5) * 100;
          positions[i3 + 1] = (random() - 0.5) * 100;
          positions[i3 + 2] = (random() - 0.5) * 100;
      }
      
      // Random color variation
      const colorVariation = 0.2;
      colors[i3] = baseColor.r + (random() - 0.5) * colorVariation;
      colors[i3 + 1] = baseColor.g + (random() - 0.5) * colorVariation;
      colors[i3 + 2] = baseColor.b + (random() - 0.5) * colorVariation;
      
      // Random size variation
      sizes[i] = size * (0.5 + random() * 1.5);
      
      // Random lifetime
      lifetimes[i] = random();
    }
    
    velocitiesRef.current = velocities;
    lifetimesRef.current = lifetimes;
    
    return { positions, colors, sizes };
  }, [count, color, size, type]);
  
  // Animate particles
  useFrame((_, delta) => {
    if (!pointsRef.current || !velocitiesRef.current || !lifetimesRef.current) return;
    
    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;
    
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;
    
    // Music influence
    const bassInfluence = musicData?.bass || 0;
    const beatInfluence = musicData?.beat ? 1 : 0;
    const volumeInfluence = musicData?.volume || 0;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] += delta * 0.1;
      if (lifetimes[i] > 1) {
        lifetimes[i] = 0;
        
        // Respawn particle
        if (type === 'burst' || type === 'stars') {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = type === 'stars' ? 50 + Math.random() * 150 : 0;
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
        }
      }
      
      // Update position
      const speedMultiplier = speed * (1 + bassInfluence * 2);
      positions[i3] += velocities[i3] * delta * speedMultiplier;
      positions[i3 + 1] += velocities[i3 + 1] * delta * speedMultiplier;
      positions[i3 + 2] += velocities[i3 + 2] * delta * speedMultiplier;
      
      // Update size based on music
      const originalSize = size * (0.5 + Math.random() * 1.5);
      sizes[i] = originalSize * (1 + volumeInfluence * 0.5 + beatInfluence * 0.3);
      
      // Update color brightness based on music
      const brightness = 1 + volumeInfluence * 0.5;
      colors[i3] *= brightness;
      colors[i3 + 1] *= brightness;
      colors[i3 + 2] *= brightness;
      
      // Fade out at end of lifetime
      const fade = type === 'burst' ? (1 - lifetimes[i]) : 1;
      colors[i3] *= fade;
      colors[i3 + 1] *= fade;
      colors[i3 + 2] *= fade;
    }
    
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
      const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;
      
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      
      // Rotate entire system slightly
      pointsRef.current.rotation.y += delta * 0.02 * (1 + bassInfluence);
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Shooting stars effect
export function ShootingStars({ musicData }: { musicData?: MusicAnalysisData }) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<Array<{ active: boolean; progress: number; direction: THREE.Vector3 }>>([]);
  
  // Initialize shooting stars once on mount
  useMemo(() => {
    const random = (i: number) => {
      let value = i * 12345;
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
    
    starsRef.current = Array(10).fill(null).map((_, i) => ({
      active: false,
      progress: 0,
      direction: new THREE.Vector3(
        (random(i * 3) - 0.5) * 2,
        (random(i * 3 + 1) - 0.5) * 2,
        (random(i * 3 + 2) - 0.5) * 2
      ).normalize()
    }));
  }, []);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const beat = musicData?.beat || false;
    
    // Trigger new shooting star on beat
    if (beat) {
      const inactive = starsRef.current.find(star => !star.active);
      if (inactive) {
        inactive.active = true;
        inactive.progress = 0;
        inactive.direction = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
      }
    }
    
    // Update active shooting stars
    starsRef.current.forEach(star => {
      if (star.active) {
        star.progress += delta * 2;
        if (star.progress > 1) {
          star.active = false;
        }
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {starsRef.current.map((star, i) => (
        star.active && (
          <mesh
            key={i}
            position={[
              star.direction.x * star.progress * 50,
              star.direction.y * star.progress * 50,
              star.direction.z * star.progress * 50
            ]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={1 - star.progress}
            />
          </mesh>
        )
      ))}
    </group>
  );
}
