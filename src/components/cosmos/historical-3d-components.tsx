/**
 * 3D Historical Visualization Components
 * Render civilizations, artifacts, and architecture in 3D space
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { HistoricalEra, Artifact } from '@/lib/timeline-system';
import type { MagicSkill } from '@/lib/magic-skill-system';

interface CivilizationStructureProps {
  era: HistoricalEra;
  position: THREE.Vector3;
  scale?: number;
  onClick?: () => void;
}

export const CivilizationStructure: React.FC<CivilizationStructureProps> = ({
  era,
  position,
  scale = 1,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });
  
  const geometry = useMemo(() => {
    switch (era.visualTheme.architecture) {
      case 'pyramids':
        return new THREE.ConeGeometry(2 * scale, 4 * scale, 4);
      case 'ziggurats':
        return createZigguratGeometry(scale);
      case 'temples':
        return createTempleGeometry(scale);
      case 'gothic-cathedrals':
        return createCathedralGeometry(scale);
      case 'pagodas':
        return createPagodaGeometry(scale);
      default:
        return new THREE.BoxGeometry(2 * scale, 3 * scale, 2 * scale);
    }
  }, [era.visualTheme.architecture, scale]);
  
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={era.visualTheme.colorValues[0].getHex()}
          emissive={hovered ? era.visualTheme.colorValues[1].getHex() : 0x000000}
          emissiveIntensity={hovered ? 0.5 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {hovered && (
        <Text
          position={[0, 5 * scale, 0]}
          fontSize={0.5 * scale}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {era.name}
        </Text>
      )}
      
      <CivilizationParticles era={era} scale={scale} />
    </group>
  );
};

function createZigguratGeometry(scale: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const levels = 5;
  
  for (let level = 0; level < levels; level++) {
    const width = (2 - level * 0.3) * scale;
    const height = 0.6 * scale;
    const y = level * height;
    
    const box = new THREE.BoxGeometry(width, height, width);
    const translatedBox = box.clone();
    translatedBox.translate(0, y, 0);
    
    const posAttr = translatedBox.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      vertices.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    box.dispose();
    translatedBox.dispose();
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createTempleGeometry(scale: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  
  const base = new THREE.BoxGeometry(3 * scale, 0.3 * scale, 3 * scale);
  const posAttrBase = base.getAttribute('position');
  for (let i = 0; i < posAttrBase.count; i++) {
    vertices.push(posAttrBase.getX(i), posAttrBase.getY(i), posAttrBase.getZ(i));
  }
  base.dispose();
  
  const roof = new THREE.ConeGeometry(2 * scale, 1 * scale, 8);
  const translatedRoof = roof.clone();
  translatedRoof.translate(0, 3 * scale, 0);
  
  const posAttrRoof = translatedRoof.getAttribute('position');
  for (let i = 0; i < posAttrRoof.count; i++) {
    vertices.push(posAttrRoof.getX(i), posAttrRoof.getY(i), posAttrRoof.getZ(i));
  }
  roof.dispose();
  translatedRoof.dispose();
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createCathedralGeometry(scale: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  
  const nave = new THREE.BoxGeometry(2 * scale, 4 * scale, 3 * scale);
  const posAttrNave = nave.getAttribute('position');
  for (let i = 0; i < posAttrNave.count; i++) {
    vertices.push(posAttrNave.getX(i), posAttrNave.getY(i), posAttrNave.getZ(i));
  }
  nave.dispose();
  
  const spire = new THREE.ConeGeometry(0.5 * scale, 3 * scale, 8);
  const translatedSpire = spire.clone();
  translatedSpire.translate(0, 5.5 * scale, 0);
  
  const posAttrSpire = translatedSpire.getAttribute('position');
  for (let i = 0; i < posAttrSpire.count; i++) {
    vertices.push(posAttrSpire.getX(i), posAttrSpire.getY(i), posAttrSpire.getZ(i));
  }
  spire.dispose();
  translatedSpire.dispose();
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createPagodaGeometry(scale: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const tiers = 5;
  
  for (let tier = 0; tier < tiers; tier++) {
    const width = (1.5 - tier * 0.2) * scale;
    const y = tier * 1.2 * scale;
    
    const roof = new THREE.ConeGeometry(width, 0.5 * scale, 8);
    const translatedRoof = roof.clone();
    translatedRoof.translate(0, y + 0.25 * scale, 0);
    
    const posAttrRoof = translatedRoof.getAttribute('position');
    for (let i = 0; i < posAttrRoof.count; i++) {
      vertices.push(posAttrRoof.getX(i), posAttrRoof.getY(i), posAttrRoof.getZ(i));
    }
    roof.dispose();
    translatedRoof.dispose();
    
    const body = new THREE.CylinderGeometry(width * 0.6, width * 0.6, 1 * scale, 8);
    const translatedBody = body.clone();
    translatedBody.translate(0, y + 0.75 * scale, 0);
    
    const posAttrBody = translatedBody.getAttribute('position');
    for (let i = 0; i < posAttrBody.count; i++) {
      vertices.push(posAttrBody.getX(i), posAttrBody.getY(i), posAttrBody.getZ(i));
    }
    body.dispose();
    translatedBody.dispose();
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

interface CivilizationParticlesProps {
  era: HistoricalEra;
  scale: number;
}

const CivilizationParticles: React.FC<CivilizationParticlesProps> = ({ era, scale }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particleSystem = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5 * scale;
      positions[i * 3 + 1] = Math.random() * 6 * scale;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 * scale;
      
      const color = era.visualTheme.colorValues[Math.floor(Math.random() * era.visualTheme.colorValues.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.01;
        
        if (positions[i + 1] > 6 * scale) {
          positions[i + 1] = 0;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <points ref={particlesRef} geometry={particleSystem}>
      <pointsMaterial
        size={0.1 * scale}
        vertexColors={true}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

interface Artifact3DProps {
  artifact: Artifact;
  onClick?: () => void;
  playSound?: boolean;
}

export const Artifact3D: React.FC<Artifact3DProps> = ({ artifact, onClick, playSound = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  const synthRef = useRef<Tone.Synth | null>(null);
  
  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
    return () => {
      synthRef.current?.dispose();
    };
  }, []);
  
  const handleClick = () => {
    if (playSound && synthRef.current) {
      synthRef.current.triggerAttackRelease('C4', '8n');
    }
    onClick?.();
  };
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });
  
  const geometry = useMemo(() => {
    switch (artifact.type) {
      case 'instrument':
        return new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
      case 'music-notation':
        return new THREE.PlaneGeometry(1, 1.5);
      case 'art':
        return new THREE.PlaneGeometry(1.2, 0.8);
      case 'architecture':
        return new THREE.BoxGeometry(1, 1, 1);
      default:
        return new THREE.SphereGeometry(0.5, 32, 32);
    }
  }, [artifact.type]);
  
  return (
    <group position={artifact.position ? [artifact.position.x, artifact.position.y, artifact.position.z] : [0, 0, 0]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? 0xFFD700 : 0xFFFFFF}
          emissive={hovered ? 0xFFD700 : 0x000000}
          emissiveIntensity={hovered ? 0.5 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {hovered && (
        <group>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {artifact.name}
          </Text>
          <Text
            position={[0, 1.1, 0]}
            fontSize={0.15}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
          >
            {artifact.description}
          </Text>
        </group>
      )}
      
      {hovered && (
        <mesh scale={1.3}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial
            color={0xFFD700}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

interface SkillVisualizationProps {
  skill: MagicSkill;
  position: THREE.Vector3;
  active?: boolean;
}

export const SkillVisualization: React.FC<SkillVisualizationProps> = ({
  skill,
  position,
  active = false
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particleSystem = useMemo(() => {
    const count = skill.visualEffect.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const shape = skill.visualEffect.particleShape;
      let x, y, z;
      
      switch (shape) {
        case 'sphere':
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 2;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
          break;
        case 'spiral':
          const angle = i * 0.1;
          const radius = i * 0.01;
          x = Math.cos(angle) * radius;
          y = i * 0.01;
          z = Math.sin(angle) * radius;
          break;
        case 'wave':
          x = (i / count) * 4 - 2;
          y = Math.sin(x * 2) * 0.5;
          z = 0;
          break;
        default:
          x = (Math.random() - 0.5) * 3;
          y = (Math.random() - 0.5) * 3;
          z = (Math.random() - 0.5) * 3;
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      colors[i * 3] = skill.visualEffect.particleColor.r;
      colors[i * 3 + 1] = skill.visualEffect.particleColor.g;
      colors[i * 3 + 2] = skill.visualEffect.particleColor.b;
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        if (skill.visualEffect.particleShape === 'spiral') {
          const angle = state.clock.elapsedTime + i * 0.01;
          const radius = (i / 3) * 0.01;
          positions[i] = Math.cos(angle) * radius;
          positions[i + 2] = Math.sin(angle) * radius;
        } else if (skill.visualEffect.particleShape === 'wave') {
          positions[i + 1] = Math.sin(positions[i] * 2 + state.clock.elapsedTime) * 0.5;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.01;
    }
    
    if (meshRef.current && active) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });
  
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={skill.visualEffect.particleColor.getHex()}
          emissive={skill.visualEffect.particleColor.getHex()}
          emissiveIntensity={skill.visualEffect.glowIntensity}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {active && (
        <points ref={particlesRef} geometry={particleSystem}>
          <pointsMaterial
            vertexColors={true}
            transparent
            opacity={0.8}
            sizeAttenuation
            size={0.1}
          />
        </points>
      )}
      
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {skill.name}
      </Text>
      
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.12}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {skill.category} • {skill.rarity}
      </Text>
    </group>
  );
};

interface TimelineVisualizerProps {
  currentYear: number;
  eras: HistoricalEra[];
  onYearChange?: (year: number) => void;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  currentYear,
  eras,
  onYearChange
}) => {
  const lineRef = useRef<THREE.Line>(null);
  
  const timelineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    eras.forEach((era, index) => {
      const x = index * 10 - (eras.length * 5);
      points.push(new THREE.Vector3(x, 0, 0));
      points.push(new THREE.Vector3(x, 2, 0));
    });
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [eras]);
  
  return (
    <group position={[0, -10, 0]}>
      <mesh ref={lineRef}>
        <bufferGeometry attach="geometry" {...timelineGeometry} />
        <lineBasicMaterial color={0xFFFFFF} linewidth={2} />
      </mesh>
      
      {eras.map((era, index) => {
        const x = index * 10 - (eras.length * 5);
        const isCurrent = currentYear >= era.period.start && currentYear <= era.period.end;
        
        return (
          <group key={era.id} position={[x, 0, 0]}>
            <mesh
              onClick={() => onYearChange?.(era.period.start)}
              scale={isCurrent ? 1.5 : 1}
            >
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial
                color={era.visualTheme.colorValues[0].getHex()}
                emissive={isCurrent ? era.visualTheme.colorValues[1].getHex() : 0x000000}
                emissiveIntensity={isCurrent ? 1 : 0}
              />
            </mesh>
            
            <Text
              position={[0, -1, 0]}
              fontSize={0.3}
              color={isCurrent ? '#FFD700' : '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
            >
              {era.name}
            </Text>
            
            <Text
              position={[0, -1.5, 0]}
              fontSize={0.15}
              color="#AAAAAA"
              anchorX="center"
              anchorY="middle"
            >
              {era.period.start} - {era.period.end}
            </Text>
          </group>
        );
      })}
    </group>
  );
};
