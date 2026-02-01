"use client";

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AudioAnalysisData } from '../../lib/enhanced-audio-analyzer';

// Real constellation data (simplified)
const CONSTELLATIONS = {
  ursa_major: {
    name: "Ursa Major",
    stars: [
      { name: "Dubhe", position: [3, 2, 1], magnitude: 1.8 },
      { name: "Merak", position: [1, 1.5, 0.8], magnitude: 2.4 },
      { name: "Phecda", position: [0, 0.5, 1.2], magnitude: 2.4 },
      { name: "Megrez", position: [-1, 0, 1.5], magnitude: 3.3 },
      { name: "Alioth", position: [-2, -0.5, 1.8], magnitude: 1.8 },
      { name: "Mizar", position: [-3, -1, 2], magnitude: 2.1 },
      { name: "Alkaid", position: [-4, -1.5, 2.2], magnitude: 1.9 }
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], // Main dipper
      [0, 4], [1, 4] // Handle connections
    ],
    emotion: "stability",
    mythology: "The Great Bear, symbol of strength and endurance",
    season: "spring"
  },
  orion: {
    name: "Orion",
    stars: [
      { name: "Betelgeuse", position: [2, 4, 0], magnitude: 0.4 },
      { name: "Bellatrix", position: [1, 3.5, 0.2], magnitude: 1.6 },
      { name: "Alnitak", position: [0.5, 1, 0.5], magnitude: 2.0 },
      { name: "Alnilam", position: [0, 0.8, 0.8], magnitude: 1.7 },
      { name: "Mintaka", position: [-0.5, 0.6, 1], magnitude: 2.2 },
      { name: "Saiph", position: [-1, -1, 1.2], magnitude: 2.1 },
      { name: "Rigel", position: [-2, -1.5, 1.5], magnitude: 0.1 }
    ],
    connections: [
      [0, 1], [1, 3], [3, 6], [6, 5], [5, 2], [2, 3], // Main body
      [2, 3, 4] // Belt
    ],
    emotion: "power",
    mythology: "The Hunter, represents courage and adventure",
    season: "winter"
  },
  cassiopeia: {
    name: "Cassiopeia",
    stars: [
      { name: "Schedar", position: [4, 0, 0], magnitude: 2.2 },
      { name: "Caph", position: [2, 1, 0.5], magnitude: 2.3 },
      { name: "Gamma Cas", position: [0, 0, 1], magnitude: 2.2 },
      { name: "Ruchbah", position: [-2, -1, 1.5], magnitude: 2.7 },
      { name: "Segin", position: [-4, 0, 2], magnitude: 3.4 }
    ],
    connections: [
      [0, 1], [1, 2], [2, 3], [3, 4] // W shape
    ],
    emotion: "elegance",
    mythology: "The Vain Queen, symbol of beauty and pride",
    season: "autumn"
  },
  cygnus: {
    name: "Cygnus",
    stars: [
      { name: "Deneb", position: [0, 6, 0], magnitude: 1.3 },
      { name: "Gamma Cyg", position: [0, 3, 0.5], magnitude: 2.2 },
      { name: "Delta Cyg", position: [2, 2, 1], magnitude: 2.9 },
      { name: "Epsilon Cyg", position: [1.5, 1, 1.2], magnitude: 2.5 },
      { name: "Albireo", position: [0, 0, 1.5], magnitude: 3.1 }
    ],
    connections: [
      [0, 1], [1, 4], [1, 2], [1, 3] // Cross shape
    ],
    emotion: "freedom",
    mythology: "The Swan, represents grace and transformation",
    season: "summer"
  }
};

interface StarProps {
  data: {
    name: string;
    position: number[];
    magnitude: number;
  };
  constellationEmotion: string;
  audioData?: AudioAnalysisData;
  onClick?: () => void;
  isHighlighted?: boolean;
  emotionalIntensity: number;
}

function Star({ data, constellationEmotion, audioData, onClick, isHighlighted, emotionalIntensity }: StarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Star brightness based on magnitude (lower magnitude = brighter)
  const brightness = Math.max(0.3, 1 - (data.magnitude / 6));
  
  // Emotional color mapping
  const emotionalColors = {
    stability: '#4A90E2',
    power: '#E24A33',
    elegance: '#B19CD9',
    freedom: '#7ED321',
    joy: '#F5A623',
    melancholy: '#6C7B7F',
    passion: '#D0021B',
    serenity: '#50E3C2'
  };
  
  const baseColor = emotionalColors[constellationEmotion as keyof typeof emotionalColors] || '#FFFFFF';
  
  // Material that responds to audio
  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(baseColor) },
        brightness: { value: brightness },
        audioEnergy: { value: 0 },
        audioValence: { value: 0.5 },
        emotionalIntensity: { value: emotionalIntensity },
        isHighlighted: { value: isHighlighted ? 1.0 : 0.0 }
      },
      vertexShader: `
        uniform float time;
        uniform float audioEnergy;
        uniform float emotionalIntensity;
        uniform float isHighlighted;
        
        varying vec2 vUv;
        varying float vPulsation;
        
        void main() {
          vUv = uv;
          
          // Star pulsation based on audio and emotion
          float pulsation = 1.0 + sin(time * 3.0 + position.x + position.y) * 0.1;
          pulsation += audioEnergy * emotionalIntensity * 0.3;
          pulsation += isHighlighted * 0.5;
          
          vPulsation = pulsation;
          
          vec3 pos = position * pulsation;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform float brightness;
        uniform float audioValence;
        uniform float emotionalIntensity;
        uniform float time;
        uniform float isHighlighted;
        
        varying vec2 vUv;
        varying float vPulsation;
        
        void main() {
          vec2 center = vUv - vec2(0.5);
          float distance = length(center);
          
          // Star core
          float core = 1.0 - smoothstep(0.0, 0.3, distance);
          
          // Star rays/spikes
          float angle = atan(center.y, center.x);
          float rays = abs(sin(angle * 4.0)) * 0.5 + 0.5;
          float rayIntensity = (1.0 - smoothstep(0.0, 0.8, distance)) * rays;
          
          // Emotional color shifting
          vec3 emotionalColor = baseColor;
          emotionalColor.r += sin(time + emotionalIntensity * 3.14159) * 0.2 * audioValence;
          emotionalColor.g += cos(time * 0.7 + emotionalIntensity * 2.0) * 0.15;
          emotionalColor.b += sin(time * 1.3 + emotionalIntensity) * 0.25;
          
          // Highlight effect
          emotionalColor = mix(emotionalColor, vec3(1.0, 1.0, 0.8), isHighlighted * 0.4);
          
          float intensity = (core + rayIntensity) * brightness * vPulsation;
          
          gl_FragColor = vec4(emotionalColor * intensity, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, [baseColor, brightness, isHighlighted, emotionalIntensity]);

  // Glow effect material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(baseColor) },
        intensity: { value: brightness }
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
          gl_FragColor = vec4(color, fresnel * intensity * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
  }, [baseColor, brightness]);

  // Use state for time instead of modifying uniforms directly
  const [currentTime, setCurrentTime] = useState(0);

  useFrame((state) => {
    setCurrentTime(state.clock.elapsedTime);
    
    if (!meshRef.current || !starMaterial || !starMaterial.uniforms) return;
    
    // Update material with current time from state
    if ('time' in starMaterial.uniforms) {
      starMaterial.uniforms.time.value = currentTime;
    }
    if ('isHighlighted' in starMaterial.uniforms) {
      starMaterial.uniforms.isHighlighted.value = isHighlighted ? 1.0 : 0.0;
    }
    if ('emotionalIntensity' in starMaterial.uniforms) {
      starMaterial.uniforms.emotionalIntensity.value = emotionalIntensity;
    }
    
    if (audioData && starMaterial && starMaterial.uniforms) {
      if ('audioEnergy' in starMaterial.uniforms) {
        starMaterial.uniforms.audioEnergy.value = audioData.energy;
      }
      if ('audioValence' in starMaterial.uniforms) {
        starMaterial.uniforms.audioValence.value = audioData.valence;
      }
    }
    
    // Gentle rotation
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group position={data.position} onClick={onClick}>
      {/* Star glow */}
      <mesh ref={glowRef} material={glowMaterial} scale={[2, 2, 2]}>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>
      
      {/* Main star */}
      <mesh ref={meshRef} material={starMaterial}>
        <sphereGeometry args={[0.02, 16, 16]} />
      </mesh>
      
      {/* Star name label (when highlighted) */}
      {isHighlighted && (
        <Billboard position={[0, 0.3, 0]}>
          <Text
            fontSize={0.08}
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

// Type definitions
interface StarData {
  name: string;
  position: [number, number, number];
  magnitude: number;
}

interface ConstellationProps {
  data: {
    name: string;
    stars: StarData[];
    connections: number[][];
    emotion: string;
    mythology: string;
    season: string;
  };
  audioData?: AudioAnalysisData;
  isSelected?: boolean;
  onStarClick?: (starIndex: number) => void;
  onConstellationClick?: () => void;
  emotionalResonance: number;
}

function Constellation({ 
  data, 
  audioData, 
  isSelected, 
  onStarClick, 
  onConstellationClick,
  emotionalResonance 
}: ConstellationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [highlightedStar, setHighlightedStar] = useState<number | null>(null);
  
  // Define emotion-based colors
  const emotionalColors = {
    stability: '#88ccff',
    power: '#ff8844',
    mystery: '#aa88ff',
    wisdom: '#ffdd88',
    hope: '#88ffcc'
  };
  const baseColor = emotionalColors[data.emotion as keyof typeof emotionalColors] || '#FFFFFF';
  
  // Constellation lines
  const connectionLines = useMemo(() => {
    return data.connections.map((connection, index) => {
      const points = connection.map(starIndex => 
        new THREE.Vector3(...(data.stars[starIndex].position as [number, number, number]))
      );
      return { points, index };
    });
  }, [data]);

  // Line material that responds to emotions and audio
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(baseColor),
      opacity: isSelected ? 0.8 : 0.3,
      transparent: true
    });
  }, [isSelected, baseColor]);

  // Use state for time instead of modifying uniforms directly
  const [lineTime, setLineTime] = useState(0);

  useFrame((state) => {
    setLineTime(state.clock.elapsedTime);
    
    if (!groupRef.current || !lineMaterial) return;
    
    // Update line opacity based on selection
    lineMaterial.opacity = isSelected ? 0.8 : 0.3;
    
    // Gentle constellation movement based on emotion
    if (emotionalResonance > 0.5) {
      const movement = emotionalResonance * 0.02;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * movement;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * movement;
    }
  });

  return (
    <group ref={groupRef} onClick={onConstellationClick}>
      {/* Stars */}
      {data.stars.map((star, index) => (
        <Star
          key={star.name}
          data={star}
          constellationEmotion={data.emotion}
          audioData={audioData}
          onClick={() => {
            setHighlightedStar(index);
            onStarClick?.(index);
          }}
          isHighlighted={highlightedStar === index}
          emotionalIntensity={emotionalResonance}
        />
      ))}
      
      {/* Constellation lines */}
      {connectionLines.map(({ points, index }) => (
        <Line
          key={index}
          points={points}
          material={lineMaterial}
          lineWidth={2}
        />
      ))}
      
      {/* Constellation label */}
      {isSelected && (
        <Billboard position={[0, 5, 0]}>
          <Text
            fontSize={0.2}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            {data.name}
          </Text>
        </Billboard>
      )}
      
      {/* Mythology text */}
      {isSelected && (
        <Billboard position={[0, -5, 0]}>
          <Text
            fontSize={0.1}
            color="#CCCCCC"
            anchorX="center"
            anchorY="middle"
            maxWidth={10}
          >
            {data.mythology}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

interface InteractiveConstellationSystemProps {
  audioData?: AudioAnalysisData;
  visible?: boolean;
  onConstellationSelect?: (constellation: string) => void;
  selectedConstellation?: string;
}

export function InteractiveConstellationSystem({ 
  audioData, 
  visible = true,
  onConstellationSelect,
  selectedConstellation 
}: InteractiveConstellationSystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate emotional resonance for each constellation based on audio
  const calculateEmotionalResonance = (emotion: string) => {
    if (!audioData) return 0.3;
    
    const emotionMappings = {
      stability: audioData.valence * 0.5 + (1 - audioData.tension) * 0.5,
      power: audioData.energy * 0.7 + audioData.bass * 0.3,
      elegance: audioData.valence * 0.6 + audioData.mid * 0.4,
      freedom: audioData.arousal * 0.5 + audioData.energy * 0.5,
      joy: audioData.valence * 0.8 + audioData.treble * 0.2,
      melancholy: (1 - audioData.valence) * 0.6 + audioData.bass * 0.4,
      passion: audioData.arousal * 0.7 + audioData.energy * 0.3,
      serenity: (1 - audioData.tension) * 0.6 + audioData.mid * 0.4
    };
    
    return emotionMappings[emotion as keyof typeof emotionMappings] || 0.3;
  };

  // Rotate constellation field slowly
  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    
    // Create new rotation instead of mutating directly
    const currentRotation = groupRef.current.rotation.y;
    groupRef.current.rotation.set(
      groupRef.current.rotation.x,
      currentRotation + delta * 0.005,
      groupRef.current.rotation.z
    );
    
    // Audio-reactive field movement
    if (audioData && audioData.energy > 0.5) {
      const movement = audioData.energy * 0.05;
      const newY = Math.sin(state.clock.elapsedTime * 0.2) * movement;
      groupRef.current.position.set(
        groupRef.current.position.x,
        newY,
        groupRef.current.position.z
      );
    }
  });

  // Position constellations in 3D space around the observer
  const positionedConstellations = useMemo(() => {
    const constellationEntries = Object.entries(CONSTELLATIONS);
    return constellationEntries.map(([key, constellation], index) => {
      const angle = (index / constellationEntries.length) * Math.PI * 2;
      const radius = 30; // Distance from center
      // Use deterministic height based on index instead of Math.random
      const height = Math.sin(index * 2.3) * 5; // Deterministic variation
      
      return {
        key,
        constellation,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number]
      };
    });
  }, []);

  return (
    <group ref={groupRef} visible={visible}>
      {positionedConstellations.map(({ key, constellation, position }) => {
        const emotionalResonance = calculateEmotionalResonance(constellation.emotion);
        
        return (
          <group key={key} position={position}>
            <Constellation
              data={constellation}
              audioData={audioData}
              isSelected={selectedConstellation === key}
              onStarClick={(starIndex) => {
                console.log(`Star ${starIndex} clicked in ${constellation.name}`);
              }}
              onConstellationClick={() => {
                onConstellationSelect?.(key);
              }}
              emotionalResonance={emotionalResonance}
            />
          </group>
        );
      })}
      
      {/* Constellation guide lines to center */}
      {selectedConstellation && (
        <group>
          {positionedConstellations
            .filter(({ key }) => key === selectedConstellation)
            .map(({ position }) => (
              <Line
                key="guide"
                points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]}
                color="#FFD700"
                lineWidth={1}
                transparent
                opacity={0.3}
              />
            ))}
        </group>
      )}
    </group>
  );
}

// Utility function to get constellation information
export function getConstellationInfo(name: string) {
  const constellationKey = name as keyof typeof CONSTELLATIONS;
  return CONSTELLATIONS[constellationKey] || null;
}

// Seasonal constellation visibility
export function getVisibleConstellations(season: 'spring' | 'summer' | 'autumn' | 'winter') {
  return Object.entries(CONSTELLATIONS)
    .filter(([, constellation]) => constellation.season === season)
    .reduce((acc, [key, constellation]) => {
      acc[key] = constellation;
      return acc;
    }, {} as Record<string, typeof CONSTELLATIONS[keyof typeof CONSTELLATIONS]>);
}