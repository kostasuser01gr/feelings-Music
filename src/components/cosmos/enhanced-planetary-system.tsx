/**
 * Enhanced Planetary System Component
 * Integrates all premium 3D features: particles, shaders, audio reactivity
 */
"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetaryData, MoonData } from '../../lib/cosmic-data-manager';
import { AdvancedParticleEngine, EmotionType } from '../../lib/advanced-particle-engine';
import { AudioReactiveUniverse } from '../../lib/audio-reactive-universe';
import { AdvancedShaderManager } from '../../lib/advanced-shaders';
import { QuantumWaveShader } from '../../lib/advanced-shaders';

interface EnhancedPlanetProps {
  data: PlanetaryData;
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
    bass: number;
    mid: number;
    treble: number;
  };
  onClick?: () => void;
  isSelected?: boolean;
  enableAdvancedShaders?: boolean;
}

function EnhancedPlanet({ 
  data, 
  musicInfluence, 
  onClick, 
  isSelected,
  enableAdvancedShaders = true 
}: EnhancedPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [particleTrail] = useState(() => new THREE.Group());
  
  // Quantum wave shader material for advanced planets
  const quantumMaterial = useMemo(() => {
    if (!enableAdvancedShaders) return null;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waveAmplitude: { value: 0.3 },
        waveFrequency: { value: 1.5 },
        audioInfluence: { value: 0 },
        color1: { value: new THREE.Color(data.color) },
        color2: { value: new THREE.Color(data.color).offsetHSL(0.1, 0, 0) },
        color3: { value: new THREE.Color(data.color).offsetHSL(0.2, 0, 0) },
      },
      vertexShader: QuantumWaveShader.vertexShader,
      fragmentShader: QuantumWaveShader.fragmentShader,
    });
  }, [data.color, enableAdvancedShaders]);

  // Enhanced planet material
  const planetMaterial = useMemo(() => {
    if (quantumMaterial) return quantumMaterial;
    
    return new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: data.name === 'Jupiter' || data.name === 'Saturn' ? 0.8 : 0.6,
      metalness: data.name === 'Mercury' ? 0.3 : 0.1,
      emissive: new THREE.Color(data.color).multiplyScalar(0.1),
      emissiveIntensity: musicInfluence.glowIntensity,
    });
  }, [data.color, data.name, musicInfluence.glowIntensity, quantumMaterial]);

  // Volumetric atmosphere shader
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        planetCenter: { value: new THREE.Vector3(data.position.x, data.position.y, data.position.z) },
        planetRadius: { value: data.scale },
        atmosphereRadius: { value: data.scale * 1.15 },
        rayleighColor: { value: new THREE.Color(data.color) },
        rayleighStrength: { value: 1.0 },
        mieStrength: { value: 0.5 },
        audioIntensity: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying float vHeight;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunPosition;
        uniform vec3 planetCenter;
        uniform float planetRadius;
        uniform float atmosphereRadius;
        uniform vec3 rayleighColor;
        uniform float rayleighStrength;
        uniform float mieStrength;
        uniform float audioIntensity;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        
        const float PI = 3.14159265359;
        
        void main() {
          vec3 viewDir = normalize(vWorldPosition - cameraPosition);
          vec3 sunDir = normalize(sunPosition - vWorldPosition);
          
          float cosTheta = dot(viewDir, sunDir);
          
          // Rayleigh scattering
          vec3 rayleighScatter = rayleighColor * rayleighStrength * (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);
          
          // Mie scattering
          float g = 0.76;
          float g2 = g * g;
          float mieScatter = mieStrength * (3.0 / (8.0 * PI)) * ((1.0 - g2) * (1.0 + cosTheta * cosTheta)) / ((2.0 + g2) * pow(abs(1.0 + g2 - 2.0 * g * cosTheta), 1.5));
          
          // Distance-based opacity
          float distToPlanet = length(vWorldPosition - planetCenter);
          float atmosphereDepth = (distToPlanet - planetRadius) / (atmosphereRadius - planetRadius);
          atmosphereDepth = clamp(atmosphereDepth, 0.0, 1.0);
          
          // Fresnel effect
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
          
          // Combine scattering
          vec3 scatter = rayleighScatter + vec3(mieScatter);
          scatter *= (1.0 - atmosphereDepth) * fresnel;
          scatter *= 1.0 + audioIntensity * 0.3;
          
          float alpha = fresnel * (1.0 - atmosphereDepth) * 0.6;
          
          gl_FragColor = vec4(scatter, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [data.color, data.scale, data.position]);

  // Glow effect with audio reactivity
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.color) },
        intensity: { value: musicInfluence.glowIntensity },
        audioBoost: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float audioBoost;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          float glowIntensity = intensity * (1.0 + audioBoost);
          gl_FragColor = vec4(color, fresnel * glowIntensity * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
  }, [data.color, musicInfluence.glowIntensity]);

  // Animation loop with enhanced effects
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += (data.rotation * 0.01 * musicInfluence.rotationMultiplier) * delta;
      
      // Multi-layered floating animation
      const time = state.clock.elapsedTime;
      const bassWave = Math.sin(time * 0.5 + data.position.x) * musicInfluence.bass * 0.1;
      const trebleWave = Math.sin(time * 2 + data.position.y) * musicInfluence.treble * 0.05;
      meshRef.current.position.y = bassWave + trebleWave;
      
      // Scale pulsing with music (bass-driven)
      const scale = data.scale * (1 + musicInfluence.bass * 0.2) * musicInfluence.scaleMultiplier;
      meshRef.current.scale.setScalar(scale);
      
      // Update quantum shader if present
      if (planetMaterial instanceof THREE.ShaderMaterial && quantumMaterial) {
        planetMaterial.uniforms.time.value = time;
        planetMaterial.uniforms.audioInfluence.value = musicInfluence.mid;
      }
    }

    // Update glow
    if (glowRef.current) {
      glowRef.current.rotation.copy(meshRef.current?.rotation || new THREE.Euler());
      const glowScale = data.scale * musicInfluence.scaleMultiplier * (1.2 + musicInfluence.treble * 0.3);
      glowRef.current.scale.setScalar(glowScale);
      
      if (glowRef.current.material instanceof THREE.ShaderMaterial) {
        glowRef.current.material.uniforms.audioBoost.value = musicInfluence.treble;
      }
    }

    // Update atmosphere
    if (atmosphereRef.current && atmosphereRef.current.material instanceof THREE.ShaderMaterial) {
      atmosphereRef.current.material.uniforms.audioIntensity.value = musicInfluence.mid;
    }

    // Update rings
    if (ringsRef.current && data.rings) {
      ringsRef.current.rotation.z += delta * (0.1 + musicInfluence.bass * 0.2) * musicInfluence.rotationMultiplier;
    }
  });

  return (
    <group position={[data.position.x, data.position.y, data.position.z]}>
      {/* Planet sphere with advanced materials */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        material={planetMaterial}
      >
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Atmospheric scattering layer */}
      <mesh ref={atmosphereRef} material={atmosphereMaterial}>
        <sphereGeometry args={[1.15, 32, 32]} />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Enhanced rings with multiple layers */}
      {data.rings && (
        <group ref={ringsRef}>
          {[
            { inner: 1.5, outer: 2.2, opacity: 0.8 },
            { inner: 2.3, outer: 2.8, opacity: 0.5 },
            { inner: 2.9, outer: 3.3, opacity: 0.3 }
          ].map((ring, idx) => (
            <Ring
              key={idx}
              args={[data.scale * ring.inner, data.scale * ring.outer, 128]}
              rotation={[Math.PI / 2, 0, idx * 0.1]}
            >
              <meshStandardMaterial 
                color={data.color} 
                transparent 
                opacity={ring.opacity * (1 + musicInfluence.glowIntensity * 0.3)}
                side={THREE.DoubleSide}
                emissive={data.color}
                emissiveIntensity={musicInfluence.treble * 0.5}
              />
            </Ring>
          ))}
        </group>
      )}

      {/* Moons */}
      {data.moons?.map((moon) => (
        <EnhancedMoon
          key={moon.name}
          data={moon}
          parentScale={data.scale}
          musicInfluence={musicInfluence}
        />
      ))}

      {/* Planet label with enhanced styling */}
      {isSelected && (
        <Billboard position={[0, data.scale * 1.8, 0]}>
          <Text
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

interface EnhancedMoonProps {
  data: MoonData;
  parentScale: number;
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
    bass: number;
    mid: number;
    treble: number;
  };
}

function EnhancedMoon({ data, parentScale, musicInfluence }: EnhancedMoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const [trailPositions, setTrailPositions] = useState<THREE.Vector3[]>([]);
  
  useFrame((state, delta) => {
    if (moonRef.current) {
      const time = Date.now() * 0.001;
      const angle = (data.angle * Math.PI / 180) + time * 0.5 * musicInfluence.rotationMultiplier;
      
      const orbitRadius = data.distance * parentScale;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      const y = Math.sin(time * 1.5) * musicInfluence.bass * 0.05;
      
      moonRef.current.position.set(x, y, z);
      moonRef.current.rotation.y += delta * 2 * musicInfluence.rotationMultiplier;
      
      // Music-influenced scale
      const scale = data.size * (1 + musicInfluence.mid * 0.15) * musicInfluence.scaleMultiplier;
      moonRef.current.scale.setScalar(scale);
      
      // Update trail
      setTrailPositions(prev => {
        const newPos = [...prev, new THREE.Vector3(x, y, z)];
        return newPos.slice(-20); // Keep last 20 positions
      });
    }
  });

  return (
    <>
      <mesh ref={moonRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          roughness={0.9}
          emissive="#1a1a1a"
          emissiveIntensity={musicInfluence.glowIntensity * 0.2}
        />
      </mesh>
      
      {/* Orbital trail */}
      {trailPositions.length > 1 && (
        <line ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={trailPositions.length}
              array={new Float32Array(trailPositions.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#C0C0C0" 
            transparent 
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </line>
      )}
    </>
  );
}

interface EnhancedSolarSystemProps {
  planets: PlanetaryData[];
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
    bass: number;
    mid: number;
    treble: number;
  };
  onPlanetSelect?: (planet: PlanetaryData) => void;
  selectedPlanet?: string;
  currentEmotion?: EmotionType;
}

export function EnhancedSolarSystem({ 
  planets, 
  musicInfluence, 
  onPlanetSelect,
  selectedPlanet,
  currentEmotion = 'calm'
}: EnhancedSolarSystemProps) {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  
  // Advanced systems
  const [particleEngine] = useState(() => new AdvancedParticleEngine({
    maxParticles: 50000,
    emissionRate: 500,
    particleLifetime: 6,
  }));
  
  const [shaderManager] = useState(() => new AdvancedShaderManager(scene));

  useEffect(() => {
    // Add particle system to scene
    scene.add(particleEngine.getParticleSystem());
    
    // Create volumetric light for sun
    shaderManager.createVolumetricLight(
      new THREE.Vector3(0, 0, 0),
      new THREE.Color(0xFFD700),
      1.5
    );
    
    return () => {
      particleEngine.dispose();
      shaderManager.dispose();
    };
  }, [scene, particleEngine, shaderManager]);

  // Update emotion
  useEffect(() => {
    particleEngine.setEmotion(currentEmotion);
  }, [currentEmotion, particleEngine]);

  // Enhanced sun shader
  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1 },
        audioReactivity: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float audioReactivity;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        // Simplex noise function (simplified)
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Animated solar surface
          float surface = noise(vec3(vUv * 10.0, time * 0.5));
          surface = sin(surface * 10.0 + time * 2.0) * 0.1 + 0.9;
          
          // Corona effect
          float corona = 1.0 - smoothstep(0.3, 0.5, dist);
          
          // Flares based on audio
          float flare = sin(time * 3.0 + dist * 20.0) * audioReactivity * 0.3;
          
          vec3 sunColor = vec3(1.0, 0.8, 0.2) * surface;
          vec3 coronaColor = vec3(1.0, 0.6, 0.1) * corona;
          vec3 flareColor = vec3(1.0, 0.9, 0.5) * flare;
          
          vec3 finalColor = (sunColor + coronaColor + flareColor) * intensity;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Update particle engine
    particleEngine.update(delta);
    
    // Update shader manager
    shaderManager.update(delta, {
      bass: musicInfluence.bass,
      mid: musicInfluence.mid,
      treble: musicInfluence.treble,
      overall: musicInfluence.glowIntensity,
    });
    
    // Update sun
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.5 * musicInfluence.rotationMultiplier;
      
      const material = sunRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = time;
      material.uniforms.intensity.value = 0.8 + musicInfluence.glowIntensity * 0.4;
      material.uniforms.audioReactivity.value = musicInfluence.bass;
      
      const scale = (0.3 + musicInfluence.bass * 0.1) * musicInfluence.scaleMultiplier;
      sunRef.current.scale.setScalar(scale);
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.01 * musicInfluence.rotationMultiplier;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Enhanced sun */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={sunMaterial} />
      </mesh>

      {/* Sun corona layers */}
      {[1.3, 1.5, 1.7].map((scale, idx) => (
        <mesh key={idx} position={[0, 0, 0]}>
          <sphereGeometry args={[scale, 32, 32]} />
          <meshBasicMaterial 
            color={idx === 0 ? "#FFA500" : idx === 1 ? "#FF6347" : "#FFD700"} 
            transparent 
            opacity={(0.3 - idx * 0.08) * musicInfluence.glowIntensity}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      ))}

      {/* Enhanced planets */}
      {planets.map((planet) => (
        <EnhancedPlanet
          key={planet.name}
          data={planet}
          musicInfluence={musicInfluence}
          onClick={() => onPlanetSelect?.(planet)}
          isSelected={selectedPlanet === planet.name}
          enableAdvancedShaders={true}
        />
      ))}

      {/* Enhanced orbital paths with gradient */}
      {planets.map((planet) => {
        const orbitRadius = Math.sqrt(
          planet.position.x * planet.position.x + 
          planet.position.z * planet.position.z
        );
        
        return (
          <mesh key={`orbit-${planet.name}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 128]} />
            <meshBasicMaterial 
              color={planet.color} 
              transparent 
              opacity={0.2 + musicInfluence.glowIntensity * 0.1}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* Enhanced asteroid belt */}
      <EnhancedAsteroidBelt musicInfluence={musicInfluence} />
    </group>
  );
}

function EnhancedAsteroidBelt({ musicInfluence }: { 
  musicInfluence: { 
    rotationMultiplier: number; 
    scaleMultiplier: number; 
    glowIntensity: number;
    bass: number;
    mid: number;
    treble: number;
  } 
}) {
  const asteroidCount = 500;
  const instancedMesh = useRef<THREE.InstancedMesh>(null);
  
  const asteroidData = useMemo(() => {
    const data = [];
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2 + (i * 0.1 % 1);
      const distance = 2.8 + (i * 0.8 % 0.8);
      const y = ((i * 0.2) % 1 - 0.5) * 0.3;
      
      data.push({
        position: new THREE.Vector3(
          Math.cos(angle) * distance,
          y,
          Math.sin(angle) * distance
        ),
        rotation: new THREE.Euler(
          (i * 3.14) % 3.14, 
          ((i + 1) * 3.14) % 3.14, 
          ((i + 2) * 3.14) % 3.14
        ),
        scale: 0.015 + (i * 0.02) % 0.025,
        orbitSpeed: 0.1 + (i % 10) * 0.01
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (instancedMesh.current) {
      const time = state.clock.elapsedTime;
      const matrix = new THREE.Matrix4();
      
      for (let i = 0; i < asteroidCount; i++) {
        const asteroid = asteroidData[i];
        
        // Calculate orbital position
        const angle = time * asteroid.orbitSpeed * musicInfluence.rotationMultiplier;
        const distance = asteroid.position.length();
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = asteroid.position.y + Math.sin(time * 2 + i) * musicInfluence.bass * 0.05;
        
        // Rotation with audio influence
        const rotation = new THREE.Euler(
          asteroid.rotation.x + time * 0.1,
          asteroid.rotation.y + time * 0.05 * musicInfluence.rotationMultiplier,
          asteroid.rotation.z
        );
        
        // Scale with audio
        const scale = asteroid.scale * (1 + musicInfluence.mid * 0.3) * musicInfluence.scaleMultiplier;
        
        matrix.compose(
          new THREE.Vector3(x, y, z),
          new THREE.Quaternion().setFromEuler(rotation),
          new THREE.Vector3().setScalar(scale)
        );
        
        instancedMesh.current.setMatrixAt(i, matrix);
      }
      instancedMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={instancedMesh} args={[undefined, undefined, asteroidCount]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#8B4513" 
        roughness={0.9}
        metalness={0.1}
        emissive="#4B2513"
        emissiveIntensity={musicInfluence.glowIntensity * 0.2}
      />
    </instancedMesh>
  );
}
