"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetaryData, MoonData } from '../../lib/cosmic-data-manager';

interface PlanetProps {
  data: PlanetaryData;
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
  };
  onClick?: () => void;
  isSelected?: boolean;
}

function Planet({ data, musicInfluence, onClick, isSelected }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  // Enhanced planet material with music-responsive properties
  const planetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: data.name === 'Jupiter' || data.name === 'Saturn' ? 0.8 : 0.6,
      metalness: data.name === 'Mercury' ? 0.3 : 0.1,
      emissive: new THREE.Color(data.color).multiplyScalar(0.1),
    });
  }, [data.color, data.name]);

  // Atmospheric glow effect
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(data.color) },
        intensity: { value: musicInfluence.glowIntensity }
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
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(color, fresnel * intensity * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
  }, [data.color, musicInfluence.glowIntensity]);

  // Planet rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += (data.rotation * 0.01 * musicInfluence.rotationMultiplier) * delta;
      
      // Subtle floating animation based on music
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = Math.sin(time * 0.5 + data.position.x) * 0.02 * musicInfluence.glowIntensity;
      
      // Scale pulsing with music
      const scale = data.scale * musicInfluence.scaleMultiplier;
      meshRef.current.scale.setScalar(scale);
    }

    if (glowRef.current) {
      glowRef.current.rotation.copy(meshRef.current?.rotation || new THREE.Euler());
      const glowScale = data.scale * musicInfluence.scaleMultiplier * 1.2;
      glowRef.current.scale.setScalar(glowScale);
    }

    if (ringsRef.current && data.rings) {
      ringsRef.current.rotation.z += delta * 0.1 * musicInfluence.rotationMultiplier;
    }
  });

  return (
    <group position={[data.position.x, data.position.y, data.position.z]}>
      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        material={planetMaterial}
      >
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>

      {/* Atmospheric glow */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Planet rings (Saturn, Uranus) */}
      {data.rings && (
        <group ref={ringsRef}>
          <Ring
            args={[data.scale * 1.5, data.scale * 2.2, 64]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial 
              color={data.color} 
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
          <Ring
            args={[data.scale * 2.3, data.scale * 2.8, 64]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial 
              color={data.color} 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </Ring>
        </group>
      )}

      {/* Moons */}
      {data.moons?.map((moon) => (
        <Moon
          key={moon.name}
          data={moon}
          parentScale={data.scale}
          musicInfluence={musicInfluence}
        />
      ))}

      {/* Planet label */}
      {isSelected && (
        <Billboard position={[0, data.scale * 1.5, 0]}>
          <Text
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {data.name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

interface MoonProps {
  data: MoonData;
  parentScale: number;
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
  };
}

function Moon({ data, parentScale, musicInfluence }: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (moonRef.current) {
      const time = state.clock.elapsedTime;
      const angle = (data.angle * Math.PI / 180) + time * 0.5 * musicInfluence.rotationMultiplier;
      
      moonRef.current.position.x = Math.cos(angle) * data.distance * parentScale;
      moonRef.current.position.z = Math.sin(angle) * data.distance * parentScale;
      
      moonRef.current.rotation.y += delta * 2 * musicInfluence.rotationMultiplier;
      
      // Music-influenced scale
      const scale = data.size * musicInfluence.scaleMultiplier;
      moonRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#C0C0C0" 
        roughness={0.9}
        emissive="#1a1a1a"
        emissiveIntensity={musicInfluence.glowIntensity * 0.1}
      />
    </mesh>
  );
}

interface SolarSystemProps {
  planets: PlanetaryData[];
  musicInfluence: {
    rotationMultiplier: number;
    scaleMultiplier: number;
    glowIntensity: number;
  };
  onPlanetSelect?: (planet: PlanetaryData) => void;
  selectedPlanet?: string;
}

export function SolarSystem({ 
  planets, 
  musicInfluence, 
  onPlanetSelect,
  selectedPlanet 
}: SolarSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Sun component
  const sunRef = useRef<THREE.Mesh>(null);
  
  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Solar surface animation
          float surface = sin(time * 2.0 + dist * 10.0) * 0.1 + 0.9;
          
          // Corona effect
          float corona = 1.0 - smoothstep(0.3, 0.5, dist);
          
          vec3 sunColor = vec3(1.0, 0.8, 0.2) * surface;
          vec3 coronaColor = vec3(1.0, 0.6, 0.1) * corona;
          
          gl_FragColor = vec4((sunColor + coronaColor) * intensity, 1.0);
        }
      `
    });
  }, []);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.5 * musicInfluence.rotationMultiplier;
      
      // Update sun shader uniforms
      (sunRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
      (sunRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value = 
        0.8 + musicInfluence.glowIntensity * 0.4;
      
      // Scale sun with music
      const scale = 0.3 * musicInfluence.scaleMultiplier;
      sunRef.current.scale.setScalar(scale);
    }
    
    if (groupRef.current) {
      // Slow rotation of entire solar system
      groupRef.current.rotation.y += delta * 0.01 * musicInfluence.rotationMultiplier;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sun */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={sunMaterial} />
      </mesh>

      {/* Sun glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial 
          color="#FFA500" 
          transparent 
          opacity={0.2 * musicInfluence.glowIntensity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Planets */}
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          musicInfluence={musicInfluence}
          onClick={() => onPlanetSelect?.(planet)}
          isSelected={selectedPlanet === planet.name}
        />
      ))}

      {/* Orbital paths */}
      {planets.map((planet) => (
        <mesh key={`orbit-${planet.name}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            Math.sqrt(planet.position.x * planet.position.x + planet.position.z * planet.position.z) - 0.01,
            Math.sqrt(planet.position.x * planet.position.x + planet.position.z * planet.position.z) + 0.01,
            64
          ]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Asteroid belt */}
      <AsteroidBelt musicInfluence={musicInfluence} />
    </group>
  );
}

function AsteroidBelt({ musicInfluence }: { 
  musicInfluence: { rotationMultiplier: number; scaleMultiplier: number; glowIntensity: number } 
}) {
  const asteroidCount = 200;
  const instancedMesh = useRef<THREE.InstancedMesh>(null);
  
  const asteroidPositions = useMemo(() => {
    const temp = [];
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2 + (i * 0.1 % 1);
      const distance = 2.8 + (i * 0.8 % 0.8);
      const y = ((i * 0.2) % 1 - 0.5) * 0.2;
      
      temp.push({
        position: [
          Math.cos(angle) * distance,
          y,
          Math.sin(angle) * distance
        ],
        rotation: [(i * 3.14) % 3.14, ((i + 1) * 3.14) % 3.14, ((i + 2) * 3.14) % 3.14],
        scale: 0.01 + (i * 0.02) % 0.02
      });
    }
    return temp;
  }, [asteroidCount]);

  useFrame((state) => {
    if (instancedMesh.current) {
      for (let i = 0; i < asteroidCount; i++) {
        const asteroid = asteroidPositions[i];
        const matrix = new THREE.Matrix4();
        
        // Create new rotation values without mutating original array
        const rotX = asteroid.rotation[0] + state.clock.elapsedTime * 0.1 * musicInfluence.rotationMultiplier;
        const rotY = asteroid.rotation[1] + state.clock.elapsedTime * 0.05 * musicInfluence.rotationMultiplier;
        const rotZ = asteroid.rotation[2];
        
        matrix.compose(
          new THREE.Vector3(...asteroid.position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ)),
          new THREE.Vector3().setScalar(asteroid.scale * musicInfluence.scaleMultiplier)
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
        emissiveIntensity={musicInfluence.glowIntensity * 0.1}
      />
    </instancedMesh>
  );
}