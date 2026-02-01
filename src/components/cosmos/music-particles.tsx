"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AudioAnalysisData } from '../../lib/enhanced-audio-analyzer';

interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  speed: number;
  size: number;
  gravity: number;
  turbulence: number;
  colorVariation: number;
}

interface MusicParticleSystemProps {
  audioData?: AudioAnalysisData;
  config?: Partial<ParticleSystemConfig>;
  position?: THREE.Vector3;
  enabled?: boolean;
}

export function MusicParticleSystem({ 
  audioData, 
  config = {}, 
  position = new THREE.Vector3(0, 0, 0),
  enabled = true 
}: MusicParticleSystemProps) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const fullConfig: ParticleSystemConfig = {
    maxParticles: 5000,
    emissionRate: 100,
    lifetime: 5.0,
    speed: 1.0,
    size: 0.1,
    gravity: -0.1,
    turbulence: 0.5,
    colorVariation: 0.3,
    ...config
  };

  // Particle data arrays
  const particleData = useMemo(() => {
    const maxParticles = fullConfig.maxParticles;
    
    return {
      positions: new Float32Array(maxParticles * 3),
      velocities: new Float32Array(maxParticles * 3),
      colors: new Float32Array(maxParticles * 3),
      sizes: new Float32Array(maxParticles),
      lifetimes: new Float32Array(maxParticles),
      ages: new Float32Array(maxParticles),
      active: new Array(maxParticles).fill(false),
      nextIndex: 0
    };
  }, [fullConfig.maxParticles]);

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(particleData.sizes, 1));
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioEnergy: { value: 0 },
        audioBass: { value: 0 },
        audioTreble: { value: 0 },
        baseSize: { value: fullConfig.size }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform float audioEnergy;
        uniform float audioBass;
        uniform float audioTreble;
        uniform float baseSize;
        
        varying vec3 vColor;
        varying float vAlpha;
        varying float vAudioEffect;
        
        void main() {
          vColor = color;
          
          // Calculate particle age effect
          float age = (time - size) / 5.0; // Assuming 5 second lifetime
          vAlpha = 1.0 - smoothstep(0.0, 1.0, age);
          
          // Audio-reactive size
          float audioScale = 1.0 + audioEnergy * 0.5 + audioBass * 0.3;
          float finalSize = size * baseSize * audioScale;
          
          // Audio-reactive position offset
          vec3 pos = position;
          pos.x += sin(time + position.y * 0.1) * audioTreble * 0.2;
          pos.y += cos(time + position.x * 0.1) * audioBass * 0.1;
          pos.z += sin(time + position.x * 0.05) * audioEnergy * 0.15;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = finalSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAudioEffect = audioEnergy;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vAudioEffect;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float distance = length(center);
          
          if (distance > 0.5) discard;
          
          // Soft edges
          float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
          alpha = pow(alpha, 2.0);
          
          // Audio-reactive glow
          float glow = 1.0 - distance * 2.0;
          glow = pow(max(0.0, glow), 3.0) * vAudioEffect;
          
          vec3 finalColor = vColor + vec3(glow) * 0.5;
          gl_FragColor = vec4(finalColor, alpha * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    return { geometry: geom, material: mat };
  }, [fullConfig.size, particleData]);

  // Emit new particles based on audio
  const emitParticle = useCallback((audioInfluence: number = 1) => {
    const { positions, velocities, colors, sizes, lifetimes, ages, active } = particleData;
    
    if (particleData.nextIndex >= fullConfig.maxParticles) {
      particleData.nextIndex = 0;
    }
    
    const index = particleData.nextIndex;
    const i3 = index * 3;
    
    // Position (start from emitter position)
    positions[i3] = position.x + (Math.random() - 0.5) * 0.5;
    positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.5;
    positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
    
    // Velocity with audio influence
    const speed = fullConfig.speed * audioInfluence;
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI;
    
    velocities[i3] = Math.cos(angle) * Math.cos(elevation) * speed;
    velocities[i3 + 1] = Math.sin(elevation) * speed;
    velocities[i3 + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
    
    // Color based on audio frequency content
    if (audioData) {
      // Map audio frequencies to color
      const bassInfluence = audioData.bass;
      const midInfluence = audioData.mid;
      const trebleInfluence = audioData.treble;
      
      colors[i3] = 0.5 + bassInfluence * 0.5; // Red from bass
      colors[i3 + 1] = 0.3 + midInfluence * 0.7; // Green from mid
      colors[i3 + 2] = 0.7 + trebleInfluence * 0.3; // Blue from treble
    } else {
      colors[i3] = 0.8 + Math.random() * 0.2;
      colors[i3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    }
    
    // Size with variation
    sizes[index] = fullConfig.size * (0.5 + Math.random() * 1.5) * audioInfluence;
    
    // Lifetime
    lifetimes[index] = fullConfig.lifetime * (0.8 + Math.random() * 0.4);
    ages[index] = 0;
    active[index] = true;
    
    particleData.nextIndex++;
  }, [audioData, fullConfig, position, particleData]);

  // Update particles
  useFrame((state, delta) => {
    if (!enabled || !particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const { positions, velocities, colors, sizes, lifetimes, ages, active } = particleData;
    
    // Update material uniforms with safe property access
    if (material.uniforms && 'time' in material.uniforms) {
      material.uniforms.time.value = time;
    }
    if (audioData && material.uniforms) {
      if ('audioEnergy' in material.uniforms) {
        material.uniforms.audioEnergy.value = audioData.energy;
      }
      if ('audioBass' in material.uniforms) {
        material.uniforms.audioBass.value = audioData.bass;
      }
      if ('audioTreble' in material.uniforms) {
        material.uniforms.audioTreble.value = audioData.treble;
      }
    }
    
    // Calculate emission rate based on audio
    let emissionMultiplier = 1;
    if (audioData) {
      emissionMultiplier = 1 + (audioData.energy + audioData.attack) * 2;
    }
    
    const particlesToEmit = Math.floor(fullConfig.emissionRate * emissionMultiplier * delta);
    
    // Emit new particles
    for (let i = 0; i < particlesToEmit; i++) {
      const audioInfluence = audioData ? (1 + audioData.energy) : 1;
      emitParticle(audioInfluence);
    }
    
    // Update existing particles
    for (let i = 0; i < fullConfig.maxParticles; i++) {
      if (!active[i]) continue;
      
      const i3 = i * 3;
      
      // Update age
      ages[i] += delta;
      
      // Check if particle should die
      if (ages[i] >= lifetimes[i]) {
        active[i] = false;
        continue;
      }
      
      // Update position
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Apply gravity
      velocities[i3 + 1] += fullConfig.gravity * delta;
      
      // Apply turbulence
      const turbulence = fullConfig.turbulence;
      if (audioData) {
        const audioTurbulence = audioData.tension * 2;
        const noiseX = Math.sin(time + positions[i3] * 0.1) * turbulence * audioTurbulence;
        const noiseY = Math.cos(time + positions[i3 + 1] * 0.1) * turbulence * audioTurbulence;
        const noiseZ = Math.sin(time + positions[i3 + 2] * 0.1) * turbulence * audioTurbulence;
        
        velocities[i3] += noiseX * delta;
        velocities[i3 + 1] += noiseY * delta;
        velocities[i3 + 2] += noiseZ * delta;
      }
      
      // Color evolution based on age and audio
      const ageRatio = ages[i] / lifetimes[i];
      if (audioData) {
        colors[i3] = colors[i3] * (1 - ageRatio * 0.3) + audioData.bass * ageRatio * 0.3;
        colors[i3 + 1] = colors[i3 + 1] * (1 - ageRatio * 0.2) + audioData.mid * ageRatio * 0.2;
        colors[i3 + 2] = colors[i3 + 2] * (1 - ageRatio * 0.4) + audioData.treble * ageRatio * 0.4;
      }
      
      // Size evolution
      sizes[i] = sizes[i] * (1 - ageRatio * 0.5);
    }
    
    // Update geometry
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
}

// Specialized particle systems for different cosmic phenomena

interface CosmicWindProps {
  audioData?: AudioAnalysisData;
  intensity?: number;
}

export function CosmicWind({ audioData, intensity = 1 }: CosmicWindProps) {
  return (
    <MusicParticleSystem
      audioData={audioData}
      position={new THREE.Vector3(0, 10, 0)}
      config={{
        maxParticles: 2000,
        emissionRate: 50,
        lifetime: 8.0,
        speed: 2.0 * intensity,
        size: 0.05,
        gravity: 0,
        turbulence: 0.8,
      }}
    />
  );
}

interface AuroraParticlesProps {
  audioData?: AudioAnalysisData;
  position?: THREE.Vector3;
  intensity?: number;
}

export function AuroraParticles({ audioData, position, intensity = 1 }: AuroraParticlesProps) {
  return (
    <MusicParticleSystem
      audioData={audioData}
      position={position || new THREE.Vector3(0, 5, 0)}
      config={{
        maxParticles: 3000,
        emissionRate: 150,
        lifetime: 6.0,
        speed: 0.5 * intensity,
        size: 0.08,
        gravity: 0.05,
        turbulence: 1.2,
        colorVariation: 0.5
      }}
    />
  );
}

interface MeteorShowerProps {
  audioData?: AudioAnalysisData;
  active?: boolean;
}

export function MeteorShower({ audioData, active = false }: MeteorShowerProps) {
  const meteorEmitters = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 30;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        10 + Math.random() * 5,
        Math.sin(angle) * radius
      );
    });
  }, [fullConfig]);

  if (!active) return null;

  return (
    <group>
      {meteorEmitters.map((position, index) => (
        <MusicParticleSystem
          key={index}
          audioData={audioData}
          position={position}
          config={{
            maxParticles: 500,
            emissionRate: 20,
            lifetime: 3.0,
            speed: 8.0,
            size: 0.12,
            gravity: -0.5,
            turbulence: 0.2,
          }}
        />
      ))}
    </group>
  );
}

interface StarFormationProps {
  audioData?: AudioAnalysisData;
  regions?: THREE.Vector3[];
}

export function StarFormation({ audioData, regions }: StarFormationProps) {
  const formationRegions = useMemo(() => {
    return regions || [
      new THREE.Vector3(15, 3, 10),
      new THREE.Vector3(-12, 2, 15),
      new THREE.Vector3(8, -2, -18),
      new THREE.Vector3(-20, 4, -8)
    ];
  }, [regions]);

  // Only active when audio energy is high
  const isActive = audioData && audioData.energy > 0.6;

  return (
    <group>
      {isActive && formationRegions.map((position, index) => (
        <MusicParticleSystem
          key={index}
          audioData={audioData}
          position={position}
          config={{
            maxParticles: 1000,
            emissionRate: 80,
            lifetime: 10.0,
            speed: 0.3,
            size: 0.15,
            gravity: 0.02, // Slight inward pull
            turbulence: 0.6,
          }}
        />
      ))}
    </group>
  );
}

// Main coordinator component for all particle effects
interface CosmicParticleEffectsProps {
  audioData?: AudioAnalysisData;
  activeEffects?: {
    cosmicWind: boolean;
    aurora: boolean;
    meteorShower: boolean;
    starFormation: boolean;
  };
}

export function CosmicParticleEffects({ 
  audioData, 
  activeEffects = {
    cosmicWind: true,
    aurora: true,
    meteorShower: false,
    starFormation: false
  }
}: CosmicParticleEffectsProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Determine which effects should be active based on audio
  const shouldShowMeteorShower = audioData && 
    audioData.energy > 0.8 && 
    audioData.attack > 0.7;
    
  const shouldShowStarFormation = audioData && 
    audioData.energy > 0.6 && 
    audioData.valence > 0.7;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Subtle rotation for the entire particle field
    groupRef.current.rotation.y += delta * 0.002;
  });

  return (
    <group ref={groupRef}>
      {activeEffects.cosmicWind && (
        <CosmicWind 
          audioData={audioData} 
          intensity={audioData?.energy || 0.5}
        />
      )}
      
      {activeEffects.aurora && (
        <AuroraParticles 
          audioData={audioData}
          intensity={audioData?.valence || 0.5}
        />
      )}
      
      {(activeEffects.meteorShower || shouldShowMeteorShower) && (
        <MeteorShower 
          audioData={audioData}
          active={true}
        />
      )}
      
      {(activeEffects.starFormation || shouldShowStarFormation) && (
        <StarFormation 
          audioData={audioData}
        />
      )}
    </group>
  );
}