/**
 * Post-Processing Effects
 * Advanced visual effects using @react-three/postprocessing
 */

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

interface PostProcessingProps {
  musicData?: MusicAnalysisData;
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  enableNoise?: boolean;
  enableVignette?: boolean;
}

export function PostProcessing({
  musicData,
  enableBloom = true,
  enableChromaticAberration = true,
  enableNoise = true,
  enableVignette = true
}: PostProcessingProps) {
  const bloomRef = useRef<any>(null);
  const chromaticRef = useRef<any>(null);
  const noiseRef = useRef<any>(null);
  
  // Update effects based on music
  useFrame(() => {
    const bass = musicData?.bass || 0;
    const volume = musicData?.volume || 0;
    const beat = musicData?.beat || false;
    
    // Update bloom intensity
    if (bloomRef.current && enableBloom) {
      bloomRef.current.intensity = 1.5 + bass * 2 + (beat ? 0.5 : 0);
    }
    
    // Update chromatic aberration based on bass
    if (chromaticRef.current && enableChromaticAberration) {
      // ChromaticAberration effect properties are managed via props
    }
    
    // Noise intensity based on volume
    if (noiseRef.current && enableNoise) {
      // Noise effect properties are managed via props  
    }
  });
  
  return (
    <EffectComposer>
      {enableBloom && (
        <Bloom
          ref={bloomRef}
          intensity={1.5}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          blendFunction={BlendFunction.SCREEN}
        />
      )}
      {enableChromaticAberration && (
        <ChromaticAberration
          ref={chromaticRef}
          offset={[0.002, 0.002] as [number, number]}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      {enableNoise && (
        <Noise
          ref={noiseRef}
          opacity={0.08}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
      {enableVignette && (
        <Vignette
          offset={0.5}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
}

// Volumetric Light (God Rays) Component
export function VolumetricLight({
  position = [0, 0, 0],
  color = '#ffffff',
  intensity = 1,
  musicData
}: {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
  musicData?: MusicAnalysisData;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  
  useFrame(() => {
    if (!lightRef.current) return;
    
    const volume = musicData?.volume || 0;
    const beat = musicData?.beat || false;
    const time = Date.now() * 0.001;
    
    // Pulse light intensity
    const pulseIntensity = intensity * (1 + volume * 2 + (beat ? 0.5 : 0));
    lightRef.current.intensity = pulseIntensity;
    
    // Animate light position slightly
    lightRef.current.position.y = position[1] + Math.sin(time) * 0.5;
  });
  
  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        distance={100}
        decay={2}
      />
      {/* Visible glow sphere */}
      <mesh>
        <sphereGeometry ref={geometryRef} args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Lens Flare Component
export function LensFlare({
  position = [0, 0, 0],
  color = '#ffffff',
  musicData
}: {
  position?: [number, number, number];
  color?: string;
  musicData?: MusicAnalysisData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const flareElements = useMemo(() => {
    return [
      { size: 2, distance: 0, opacity: 1 },
      { size: 1.5, distance: 0.2, opacity: 0.7 },
      { size: 1, distance: 0.4, opacity: 0.5 },
      { size: 0.8, distance: 0.6, opacity: 0.4 },
      { size: 0.6, distance: 0.8, opacity: 0.3 },
      { size: 0.4, distance: 1, opacity: 0.2 }
    ];
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const volume = musicData?.volume || 0;
    
    // Scale based on music
    groupRef.current.scale.setScalar(1 + volume * 0.5);
  });
  
  return (
    <group ref={groupRef} position={position}>
      {flareElements.map((flare, i) => (
        <mesh
          key={i}
          position={[flare.distance * 2, 0, 0]}
        >
          <circleGeometry args={[flare.size, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={flare.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
