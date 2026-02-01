/**
 * Physics Simulation System
 * Realistic gravity, orbital mechanics, and collision detection
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface PhysicsBody {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  radius: number;
  fixed: boolean; // If true, object doesn't move (like the sun)
  type: 'planet' | 'asteroid' | 'spacecraft' | 'particle';
}

export class PhysicsEngine {
  private bodies: Map<string, PhysicsBody> = new Map();
  private G = 0.1; // Gravitational constant (adjusted for visualization)
  private collisions: Array<[string, string]> = [];
  
  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
  }
  
  removeBody(id: string): void {
    this.bodies.delete(id);
  }
  
  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }
  
  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }
  
  update(delta: number): void {
    const bodies = Array.from(this.bodies.values());
    this.collisions = [];
    
    // Calculate gravitational forces
    for (const body of bodies) {
      if (body.fixed) continue;
      
      const force = new THREE.Vector3();
      
      for (const other of bodies) {
        if (body.id === other.id) continue;
        
        // Calculate gravitational force
        const direction = new THREE.Vector3().subVectors(other.position, body.position);
        const distance = direction.length();
        
        if (distance < body.radius + other.radius) {
          // Collision detected
          this.collisions.push([body.id, other.id]);
          continue;
        }
        
        // F = G * (m1 * m2) / r^2
        const forceMagnitude = (this.G * body.mass * other.mass) / (distance * distance);
        direction.normalize().multiplyScalar(forceMagnitude);
        force.add(direction);
      }
      
      // Update velocity (F = ma, so a = F/m)
      const acceleration = force.divideScalar(body.mass);
      body.velocity.add(acceleration.multiplyScalar(delta));
      
      // Update position
      body.position.add(body.velocity.clone().multiplyScalar(delta));
    }
  }
  
  getCollisions(): Array<[string, string]> {
    return this.collisions;
  }
  
  // Set orbital velocity for a body around another
  setOrbitalVelocity(bodyId: string, centerBodyId: string): void {
    const body = this.bodies.get(bodyId);
    const centerBody = this.bodies.get(centerBodyId);
    
    if (!body || !centerBody) return;
    
    const direction = new THREE.Vector3().subVectors(body.position, centerBody.position);
    const distance = direction.length();
    
    // v = sqrt(G * M / r)
    const speed = Math.sqrt((this.G * centerBody.mass) / distance);
    
    // Velocity perpendicular to direction
    const velocity = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(speed);
    body.velocity.copy(velocity);
  }
  
  clear(): void {
    this.bodies.clear();
  }
}

// React hook for physics
export function usePhysics() {
  const engineRef = useRef(new PhysicsEngine());
  
  useFrame((state, delta) => {
    engineRef.current.update(delta);
  });
  
  return engineRef.current;
}

// Physics-enabled planet component
export function PhysicsPlanet({
  id,
  initialPosition,
  initialVelocity = new THREE.Vector3(),
  mass,
  radius,
  color,
  physics
}: {
  id: string;
  initialPosition: THREE.Vector3;
  initialVelocity?: THREE.Vector3;
  mass: number;
  radius: number;
  color: string;
  physics: PhysicsEngine;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<PhysicsBody>();
  
  useEffect(() => {
    const body: PhysicsBody = {
      id,
      position: initialPosition.clone(),
      velocity: initialVelocity.clone(),
      mass,
      radius,
      fixed: false,
      type: 'planet'
    };
    
    physics.addBody(body);
    bodyRef.current = body;
    
    return () => {
      physics.removeBody(id);
    };
  }, [id, physics]);
  
  useFrame(() => {
    if (!meshRef.current || !bodyRef.current) return;
    
    // Update mesh position from physics
    meshRef.current.position.copy(bodyRef.current.position);
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Orbital path visualizer
export function OrbitalPath({
  centerPosition,
  bodyPosition,
  segments = 64
}: {
  centerPosition: THREE.Vector3;
  bodyPosition: THREE.Vector3;
  segments?: number;
}) {
  const points = [];
  const radius = centerPosition.distanceTo(bodyPosition);
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = centerPosition.x + Math.cos(angle) * radius;
    const z = centerPosition.z + Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, centerPosition.y, z));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#444444" opacity={0.3} transparent />
    </line>
  );
}

// Collision effect component
export function CollisionEffect({
  position,
  onComplete
}: {
  position: THREE.Vector3;
  onComplete?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    progress.current += delta * 2;
    
    if (progress.current >= 1) {
      onComplete?.();
      return;
    }
    
    // Expand and fade
    groupRef.current.scale.setScalar(1 + progress.current * 5);
    groupRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        child.material.opacity = 1 - progress.current;
      }
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// N-body simulation example setup
export function createSolarSystemPhysics(physics: PhysicsEngine): void {
  // Sun (fixed)
  const sun: PhysicsBody = {
    id: 'sun',
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    mass: 1000,
    radius: 5,
    fixed: true,
    type: 'planet'
  };
  physics.addBody(sun);
  
  // Planets with realistic orbital mechanics
  const planets = [
    { id: 'mercury', distance: 10, mass: 1, radius: 0.5, speed: 0.8 },
    { id: 'venus', distance: 15, mass: 2, radius: 0.9, speed: 0.6 },
    { id: 'earth', distance: 20, mass: 2.5, radius: 1, speed: 0.5 },
    { id: 'mars', distance: 25, mass: 1.5, radius: 0.7, speed: 0.4 },
    { id: 'jupiter', distance: 40, mass: 20, radius: 3, speed: 0.2 },
    { id: 'saturn', distance: 50, mass: 15, radius: 2.5, speed: 0.15 },
    { id: 'uranus', distance: 60, mass: 8, radius: 1.8, speed: 0.1 },
    { id: 'neptune', distance: 70, mass: 7, radius: 1.7, speed: 0.08 }
  ];
  
  planets.forEach(planet => {
    const body: PhysicsBody = {
      id: planet.id,
      position: new THREE.Vector3(planet.distance, 0, 0),
      velocity: new THREE.Vector3(0, 0, planet.speed),
      mass: planet.mass,
      radius: planet.radius,
      fixed: false,
      type: 'planet'
    };
    
    physics.addBody(body);
    physics.setOrbitalVelocity(planet.id, 'sun');
  });
}
