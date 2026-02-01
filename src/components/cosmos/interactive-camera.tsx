/**
 * Interactive Camera Controller
 * Smooth camera transitions, planet focusing, and orbital controls
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  distance: number;
}

interface InteractiveCameraProps {
  target?: CameraTarget;
  enableControls?: boolean;
  smoothness?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export function InteractiveCamera({
  target,
  enableControls = true,
  smoothness = 0.05,
  autoRotate = false,
  autoRotateSpeed = 0.5
}: InteractiveCameraProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>();
  const targetPositionRef = useRef(new THREE.Vector3(0, 20, 50));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  
  // Initialize orbit controls
  useEffect(() => {
    if (!enableControls) return;
    
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    
    controlsRef.current = controls;
    
    return () => {
      controls.dispose();
    };
  }, [camera, gl, enableControls, autoRotate, autoRotateSpeed]);
  
  // Update target when prop changes
  useEffect(() => {
    if (target) {
      targetPositionRef.current.copy(target.position);
      targetLookAtRef.current.copy(target.lookAt);
      
      // Calculate camera position based on target and distance
      const direction = new THREE.Vector3()
        .subVectors(target.position, target.lookAt)
        .normalize()
        .multiplyScalar(target.distance);
      
      targetPositionRef.current.copy(target.lookAt).add(direction);
    }
  }, [target]);
  
  // Smooth camera movement
  useFrame(() => {
    if (target && !enableControls) {
      // Smooth interpolation to target
      camera.position.lerp(targetPositionRef.current, smoothness);
      
      // Look at target
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(-1).add(camera.position);
      currentLookAt.lerp(targetLookAtRef.current, smoothness);
      camera.lookAt(currentLookAt);
    }
    
    // Update orbit controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  
  return null;
}

// Helper function to create camera targets for planets
export function createPlanetTarget(
  planetPosition: THREE.Vector3,
  planetRadius: number,
  offset: THREE.Vector3 = new THREE.Vector3(3, 2, 3)
): CameraTarget {
  const distance = planetRadius * 5 + 10;
  const cameraPosition = planetPosition.clone().add(
    offset.normalize().multiplyScalar(distance)
  );
  
  return {
    position: cameraPosition,
    lookAt: planetPosition,
    distance
  };
}

// Cinematic camera path
export function useCinematicPath(waypoints: CameraTarget[], duration: number = 10) {
  const progressRef = useRef(0);
  const currentIndexRef = useRef(0);
  
  useFrame((state, delta) => {
    progressRef.current += delta / duration;
    
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      currentIndexRef.current = (currentIndexRef.current + 1) % waypoints.length;
    }
  });
  
  const currentWaypoint = waypoints[currentIndexRef.current];
  const nextWaypoint = waypoints[(currentIndexRef.current + 1) % waypoints.length];
  
  const position = new THREE.Vector3().lerpVectors(
    currentWaypoint.position,
    nextWaypoint.position,
    progressRef.current
  );
  
  const lookAt = new THREE.Vector3().lerpVectors(
    currentWaypoint.lookAt,
    nextWaypoint.lookAt,
    progressRef.current
  );
  
  return {
    position,
    lookAt,
    distance: THREE.MathUtils.lerp(
      currentWaypoint.distance,
      nextWaypoint.distance,
      progressRef.current
    )
  };
}
