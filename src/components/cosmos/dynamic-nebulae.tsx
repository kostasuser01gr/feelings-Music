"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NebulaData } from '../../lib/cosmic-data-manager';
import { AudioAnalysisData } from '../../lib/enhanced-audio-analyzer';

interface NebulaProps {
  data: NebulaData;
  audioData?: AudioAnalysisData;
  index: number;
}

function Nebula({ data, audioData, index }: NebulaProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Procedural nebula geometry based on type and music
  const geometry = useMemo(() => {
    const particleCount = Math.min(data.particleCount, 5000); // Performance limit
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color(data.color);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Different distribution patterns based on nebula type
      let x, y, z;
      
      switch (data.type) {
        case 'emission':
          // Spherical with central density
          const radius = Math.random() * data.size;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          // Central concentration
          const centralFactor = 1 - (radius / data.size);
          if (Math.random() > centralFactor * 0.7) {
            x *= 0.3;
            y *= 0.3;
            z *= 0.3;
          }
          break;
          
        case 'reflection':
          // Disc-like structure
          const discRadius = Math.sqrt(Math.random()) * data.size;
          const discAngle = Math.random() * Math.PI * 2;
          x = discRadius * Math.cos(discAngle);
          y = (Math.random() - 0.5) * data.size * 0.1;
          z = discRadius * Math.sin(discAngle);
          break;
          
        case 'dark':
          // Irregular, clumpy structure
          x = (Math.random() - 0.5) * data.size;
          y = (Math.random() - 0.5) * data.size;
          z = (Math.random() - 0.5) * data.size;
          // Create clumps using noise
          const clumpFactor = (Math.sin(x * 0.1) + Math.cos(y * 0.1) + Math.sin(z * 0.1)) / 3;
          if (Math.abs(clumpFactor) < 0.3) {
            x *= 0.1;
            y *= 0.1;
            z *= 0.1;
          }
          break;
          
        case 'planetary':
          // Ring structure around center
          const ringRadius = (0.5 + Math.random() * 0.5) * data.size;
          const ringAngle = Math.random() * Math.PI * 2;
          const ringHeight = (Math.random() - 0.5) * data.size * 0.2;
          x = ringRadius * Math.cos(ringAngle);
          y = ringHeight;
          z = ringRadius * Math.sin(ringAngle);
          break;
          
        default:
          x = (Math.random() - 0.5) * data.size;
          y = (Math.random() - 0.5) * data.size;
          z = (Math.random() - 0.5) * data.size;
      }
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Color variation within nebula
      const variation = 0.3;
      colors[i3] = color.r + (Math.random() - 0.5) * variation;
      colors[i3 + 1] = color.g + (Math.random() - 0.5) * variation;
      colors[i3 + 2] = color.b + (Math.random() - 0.5) * variation;
      
      // Particle sizes based on density and distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);
      const densityFactor = 1 - (distance / data.size);
      sizes[i] = (0.02 + Math.random() * 0.08) * data.density * densityFactor;
      
      // Initial velocities for particle movement
      velocities[i3] = (Math.random() - 0.5) * 0.001;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.001;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    return geometry;
  }, [data]);
  
  // Advanced nebula material with music responsiveness
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioEnergy: { value: 0 },
        audioBass: { value: 0 },
        audioTreble: { value: 0 },
        nebulaColor: { value: new THREE.Color(data.color) },
        opacity: { value: data.density },
        glowIntensity: { value: 1.0 },
        turbulence: { value: 0.5 },
        scale: { value: 1.0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 velocity;
        
        uniform float time;
        uniform float audioEnergy;
        uniform float audioBass;
        uniform float audioTreble;
        uniform float turbulence;
        uniform float scale;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        // Noise function for organic movement
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x * 34.0) + 1.0) * x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Add organic movement based on noise and audio
          float noise1 = snoise(pos * 0.01 + time * 0.1);
          float noise2 = snoise(pos * 0.02 + time * 0.05);
          float noise3 = snoise(pos * 0.005 + time * 0.2);
          
          vec3 noiseMovement = vec3(noise1, noise2, noise3) * turbulence;
          
          // Audio-reactive movement
          vec3 audioMovement = velocity * audioEnergy * 100.0;
          audioMovement += vec3(
            sin(time + pos.x * 0.1) * audioBass * 0.5,
            cos(time + pos.y * 0.1) * audioTreble * 0.3,
            sin(time + pos.z * 0.1) * audioEnergy * 0.4
          );
          
          pos += noiseMovement + audioMovement;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          
          // Audio-reactive particle size
          float audioScale = 1.0 + audioEnergy * 0.5 + audioBass * 0.3;
          gl_PointSize = size * audioScale * scale * (300.0 / -mvPosition.z);
          
          // Distance-based alpha for depth
          float distance = length(mvPosition.xyz);
          vAlpha = 1.0 / (1.0 + distance * 0.01);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 nebulaColor;
        uniform float opacity;
        uniform float glowIntensity;
        uniform float time;
        uniform float audioEnergy;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Circular particle shape with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float distance = length(center);
          
          if (distance > 0.5) discard;
          
          // Soft falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
          alpha = pow(alpha, 2.0);
          
          // Glow effect
          float glow = 1.0 - distance * 2.0;
          glow = pow(max(0.0, glow), 3.0) * glowIntensity;
          
          // Audio-reactive flickering
          float flicker = 1.0 + sin(time * 10.0 + gl_FragCoord.x * 0.1) * audioEnergy * 0.2;
          
          // Combine colors
          vec3 finalColor = mix(vColor, nebulaColor, 0.5);
          finalColor += vec3(glow) * 0.5;
          
          gl_FragColor = vec4(finalColor * flicker, alpha * opacity * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
  }, [data.color, data.density]);

  // Update material uniforms with audio data
  useFrame((_, delta) => {
    if (!material) return;
    
    material.uniforms.time.value = Date.now() * 0.001;
    
    if (audioData) {
      material.uniforms.audioEnergy.value = audioData.energy;
      material.uniforms.audioBass.value = audioData.bass;
      material.uniforms.audioTreble.value = audioData.treble;
      material.uniforms.glowIntensity.value = 1.0 + audioData.energy * 2.0;
      material.uniforms.turbulence.value = 0.5 + audioData.arousal * 0.5;
      material.uniforms.scale.value = 1.0 + audioData.attack * 0.5;
    } else {
      // Default gentle movement when no audio
      material.uniforms.audioEnergy.value = 0.3 + Math.sin(Date.now() * 0.0005) * 0.2;
      material.uniforms.audioBass.value = 0.2;
      material.uniforms.audioTreble.value = 0.2;
      material.uniforms.glowIntensity.value = 1.0;
      material.uniforms.turbulence.value = 0.3;
      material.uniforms.scale.value = 1.0;
    }
  });

  return (
    <group position={[data.position.x, data.position.y, data.position.z]}>
      <points ref={particlesRef} geometry={geometry} material={material} />
    </group>
  );
}

interface DynamicNebulaFieldProps {
  nebulae: NebulaData[];
  audioData?: AudioAnalysisData;
  visible?: boolean;
}

export function DynamicNebulaField({ nebulae, audioData, visible = true }: DynamicNebulaFieldProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Global nebula field rotation and movement
  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    
    const time = state.clock.elapsedTime;
    
    // Gentle overall rotation
    groupRef.current.rotation.y += delta * 0.01;
    
    // Audio-reactive field movement
    if (audioData) {
      const movement = audioData.energy * 0.1;
      groupRef.current.position.x = Math.sin(time * 0.3) * movement;
      groupRef.current.position.z = Math.cos(time * 0.2) * movement;
      groupRef.current.position.y = Math.sin(time * 0.1) * movement * 0.5;
    }
  });

  return (
    <group ref={groupRef} visible={visible}>
      {nebulae.map((nebula, index) => (
        <Nebula
          key={`${nebula.type}-${index}`}
          data={nebula}
          audioData={audioData}
          index={index}
        />
      ))}
    </group>
  );
}

// Procedural nebula generator for creating new nebulae based on music
export function generateMusicBasedNebula(audioData: AudioAnalysisData, position: THREE.Vector3): NebulaData {
  // Determine nebula type based on audio characteristics
  let type: NebulaData['type'] = 'emission';
  
  if (audioData.energy > 0.7 && audioData.arousal > 0.6) {
    type = 'emission'; // High energy = bright emission nebula
  } else if (audioData.valence > 0.6 && audioData.mid > audioData.bass) {
    type = 'reflection'; // Pleasant, balanced = reflection nebula
  } else if (audioData.tension > 0.5 || audioData.valence < 0.3) {
    type = 'dark'; // Tense or negative = dark nebula
  } else if (audioData.arousal < 0.3 && audioData.energy < 0.4) {
    type = 'planetary'; // Calm, low energy = planetary nebula
  }

  // Size based on energy and volume
  const size = 5 + (audioData.energy + audioData.volume + 30) / 60 * 15;
  
  // Density based on frequency content
  const density = Math.min(1, (audioData.mid + audioData.highMid + audioData.bass) / 3);
  
  // Color based on audio characteristics
  const color = generateColorFromAudio(audioData);
  
  // Particle count based on complexity and energy
  const particleCount = Math.floor(1000 + (audioData.tension + audioData.energy) * 2000);

  return {
    type,
    position: { x: position.x, y: position.y, z: position.z },
    size,
    density,
    color,
    particleCount
  };
}

function generateColorFromAudio(audioData: AudioAnalysisData): string {
  // Map audio characteristics to HSL color space
  const hue = (audioData.centroid / 1000 * 360 + audioData.valence * 60) % 360;
  const saturation = Math.min(100, (audioData.energy + audioData.arousal) * 50 + 30);
  const lightness = Math.min(80, audioData.energy * 40 + 20);
  
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness / 100 - c / 2;
  
  let r, g, b;
  
  if (hue >= 0 && hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}