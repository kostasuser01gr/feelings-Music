/**
 * Constellation Drawing System
 * Interactive tool for connecting stars and creating patterns
 */

import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface Star {
  id: string;
  position: THREE.Vector3;
  selected: boolean;
}

interface Constellation {
  id: string;
  name: string;
  stars: string[];
  connections: Array<[string, string]>;
  color: string;
}

interface ConstellationDrawerProps {
  stars: Star[];
  onConstellationCreated?: (constellation: Constellation) => void;
}

export function ConstellationDrawer({
  stars,
  onConstellationCreated
}: ConstellationDrawerProps) {
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [connections, setConnections] = useState<Array<[string, string]>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [constellationColor] = useState(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
  
  const handleStarClick = useCallback((starId: string) => {
    if (!isDrawing) {
      setIsDrawing(true);
      setSelectedStars([starId]);
      setConnections([]);
    } else {
      setSelectedStars(prev => {
        const newStars = [...prev, starId];
        
        // Create connection with previous star
        if (prev.length > 0) {
          const lastStar = prev[prev.length - 1];
          setConnections(conns => [...conns, [lastStar, starId]]);
        }
        
        return newStars;
      });
    }
  }, [isDrawing]);
  
  const finishConstellation = useCallback(() => {
    if (selectedStars.length >= 3) {
      const constellation: Constellation = {
        id: `constellation_${Date.now()}`,
        name: `Custom ${selectedStars.length}-Star`,
        stars: selectedStars,
        connections,
        color: constellationColor
      };
      
      onConstellationCreated?.(constellation);
    }
    
    setIsDrawing(false);
    setSelectedStars([]);
    setConnections([]);
  }, [selectedStars, connections, constellationColor, onConstellationCreated]);
  
  return (
    <group>
      {/* Render stars */}
      {stars.map(star => (
        <InteractiveStar
          key={star.id}
          star={star}
          isSelected={selectedStars.includes(star.id)}
          onClick={() => handleStarClick(star.id)}
        />
      ))}
      
      {/* Render connections */}
      {connections.map((connection, i) => {
        const star1 = stars.find(s => s.id === connection[0]);
        const star2 = stars.find(s => s.id === connection[1]);
        
        if (!star1 || !star2) return null;
        
        return (
          <ConstellationLine
            key={i}
            start={star1.position}
            end={star2.position}
            color={constellationColor}
          />
        );
      })}
      
      {/* Finish button (when drawing) */}
      {isDrawing && selectedStars.length >= 3 && (
        <mesh
          position={[0, -10, 0]}
          onClick={finishConstellation}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
    </group>
  );
}

// Interactive star component
function InteractiveStar({
  star,
  isSelected,
  onClick
}: {
  star: Star;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Pulse effect
    const scale = (isSelected ? 1.5 : 1) + (hovered ? 0.3 : 0) + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });
  
  return (
    <mesh
      ref={meshRef}
      position={star.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial
        color={isSelected ? '#ffff00' : '#ffffff'}
        transparent
        opacity={isSelected || hovered ? 1 : 0.7}
      />
      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ffff00' : '#ffffff'}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </mesh>
  );
}

// Line connecting stars
function ConstellationLine({
  start,
  end,
  color
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}) {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.8}
    />
  );
}

// Saved constellation renderer
export function SavedConstellations({
  constellations,
  stars
}: {
  constellations: Constellation[];
  stars: Star[];
}) {
  return (
    <group>
      {constellations.map(constellation => (
        <group key={constellation.id}>
          {constellation.connections.map((connection, i) => {
            const star1 = stars.find(s => s.id === connection[0]);
            const star2 = stars.find(s => s.id === connection[1]);
            
            if (!star1 || !star2) return null;
            
            return (
              <ConstellationLine
                key={i}
                start={star1.position}
                end={star2.position}
                color={constellation.color}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}

// Generate random stars for constellation drawing
export function generateStars(count: number = 100): Star[] {
  const stars: Star[] = [];
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 40 + Math.random() * 60;
    
    stars.push({
      id: `star_${i}`,
      position: new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ),
      selected: false
    });
  }
  
  return stars;
}
