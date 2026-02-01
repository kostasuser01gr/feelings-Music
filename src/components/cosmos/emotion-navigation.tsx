"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { AudioAnalysisData } from '../../lib/enhanced-audio-analyzer';

export interface EmotionNavigationConfig {
  enabled: boolean;
  sensitivity: number;
  smoothing: number;
  boundaryRadius: number;
  autoReturn: boolean;
  returnSpeed: number;
}

export interface EmotionalState {
  energy: number;    // 0-1: Low energy = slow, calm movement; High energy = dynamic movement
  valence: number;   // 0-1: Negative = darker areas; Positive = brighter areas  
  arousal: number;   // 0-1: Low = stable position; High = active movement
  tension: number;   // 0-1: Low = smooth curves; High = sharp movements
}

interface EmotionDrivenCameraProps {
  audioData?: AudioAnalysisData;
  emotionalState?: EmotionalState;
  config?: Partial<EmotionNavigationConfig>;
  targetPosition?: THREE.Vector3;
  onPositionChange?: (position: THREE.Vector3, lookAt: THREE.Vector3) => void;
}

export function EmotionDrivenCamera({
  audioData,
  emotionalState,
  config = {},
  targetPosition,
  onPositionChange
}: EmotionDrivenCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera, gl } = useThree();
  
  // Default configuration
  const fullConfig: EmotionNavigationConfig = {
    enabled: true,
    sensitivity: 1.0,
    smoothing: 0.1,
    boundaryRadius: 50,
    autoReturn: true,
    returnSpeed: 0.02,
    ...config
  };

  // Movement state
  const movementState = useRef({
    currentPosition: new THREE.Vector3(0, 0, 5),
    targetPosition: new THREE.Vector3(0, 0, 5),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    basePosition: new THREE.Vector3(0, 0, 5),
    emotionAccumulator: { x: 0, y: 0, z: 0 },
    lastUpdateTime: 0
  });

  // Initialize camera position
  useEffect(() => {
    if (cameraRef.current) {
      movementState.current.currentPosition.copy(cameraRef.current.position);
      movementState.current.basePosition.copy(cameraRef.current.position);
    }
  }, []);

  // Function definitions (before useFrame to avoid hoisting issues)
  const deriveEmotionFromAudio = useCallback((audio?: AudioAnalysisData): EmotionalState => {
    if (!audio) {
      return { energy: 0.5, valence: 0.5, arousal: 0.3, tension: 0.2 };
    }

    return {
      energy: Math.min(1, (audio.bass + audio.treble + audio.volume + 30) / 60),
      valence: Math.min(1, Math.max(0, (audio.mid + audio.highMid) / (audio.bass + 0.1))),
      arousal: Math.min(1, (audio.attack + audio.peak) / 2),
      tension: Math.min(1, (audio.centroid / 1000 + audio.rolloff / 1000) / 2)
    };
  }, []);

  const updateEmotionalMovement = useCallback((emotion: EmotionalState, delta: number, time: number) => {
    const state = movementState.current;
    
    // Energy influences overall movement scale and speed
    const energyScale = 0.3 + emotion.energy * 1.5;
    const movementSpeed = 0.1 + emotion.energy * 0.4;
    
    // Arousal creates dynamic movement patterns
    const arousalInfluence = emotion.arousal * fullConfig.sensitivity;
    
    // Valence affects camera height and general "mood" of movement
    const valenceHeight = (emotion.valence - 0.5) * 8;
    
    // Tension creates jittery or smooth movements
    const tensionFactor = emotion.tension;
    const smoothnessFactor = 1 - tensionFactor;

    // Create movement vectors based on emotions
    const emotionalMovement = new THREE.Vector3();
    
    // Base oscillating movement patterns
    emotionalMovement.x = Math.sin(time * movementSpeed * (1 + arousalInfluence)) * energyScale;
    emotionalMovement.z = Math.cos(time * movementSpeed * 0.7 * (1 + arousalInfluence)) * energyScale;
    emotionalMovement.y = Math.sin(time * movementSpeed * 0.3) * energyScale * 0.5 + valenceHeight;

    // Add tension-based jitter or smoothing
    if (tensionFactor > 0.3) {
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * tensionFactor * 0.5,
        (Math.random() - 0.5) * tensionFactor * 0.3,
        (Math.random() - 0.5) * tensionFactor * 0.5
      );
      emotionalMovement.add(jitter);
    }

    // Apply smoothing based on emotion
    const smoothing = fullConfig.smoothing * smoothnessFactor + 0.02;
    
    // Update target position
    state.targetPosition.copy(state.basePosition);
    state.targetPosition.add(emotionalMovement);

    // Handle target position override
    if (targetPosition) {
      state.targetPosition.lerp(targetPosition, 0.1);
    }

    // Boundary enforcement
    const distanceFromCenter = state.targetPosition.length();
    if (distanceFromCenter > fullConfig.boundaryRadius) {
      state.targetPosition.normalize().multiplyScalar(fullConfig.boundaryRadius);
    }

    // Auto-return to base position when low energy
    if (fullConfig.autoReturn && emotion.energy < 0.2 && emotion.arousal < 0.2) {
      state.targetPosition.lerp(state.basePosition, fullConfig.returnSpeed);
    }

    // Update look-at target based on emotions
    updateLookAtTarget(emotion, time);
    
    // Apply smoothing to movement
    state.currentPosition.lerp(state.targetPosition, smoothing);
  }, [fullConfig, targetPosition]);

  const updateLookAtTarget = useCallback((emotion: EmotionalState, time: number) => {
    const state = movementState.current;
    
    // Base look-at point (usually center or slightly dynamic)
    const baseLookAt = new THREE.Vector3(0, 0, 0);
    
    // Energy affects how much the camera "searches" around
    const searchRadius = emotion.energy * 2;
    
    // Arousal creates more dynamic look-at behavior
    const arousalMovement = new THREE.Vector3(
      Math.sin(time * 0.8 + emotion.arousal * 3) * searchRadius,
      Math.sin(time * 0.4 + emotion.valence * 2) * searchRadius * 0.5,
      Math.cos(time * 0.6 + emotion.tension * 4) * searchRadius
    );

    // Valence affects the general direction of gaze
    if (emotion.valence > 0.6) {
      // Happy/positive - look slightly upward and outward
      arousalMovement.y += 1;
      arousalMovement.multiplyScalar(1.2);
    } else if (emotion.valence < 0.4) {
      // Sad/negative - look downward and inward
      arousalMovement.y -= 1;
      arousalMovement.multiplyScalar(0.8);
    }

    state.targetLookAt.copy(baseLookAt).add(arousalMovement);
    
    // Smooth look-at transitions
    state.currentLookAt.lerp(state.targetLookAt, fullConfig.smoothing * 2);
  }, [fullConfig]);

  const updateCameraTransform = useCallback((delta: number) => {
    if (!cameraRef.current) return;
    
    const state = movementState.current;
    
    // Apply position
    cameraRef.current.position.copy(state.currentPosition);
    
    // Apply look-at
    cameraRef.current.lookAt(state.currentLookAt);
    
    // Update camera's projection matrix
    cameraRef.current.updateProjectionMatrix();
  }, []);

  useFrame((state, delta) => {
    if (!cameraRef.current || !fullConfig.enabled) return;

    const time = state.clock.elapsedTime;
    const emotion = emotionalState || deriveEmotionFromAudio(audioData);
    
    updateEmotionalMovement(emotion, delta, time);
    updateCameraTransform(delta);
    
    // Notify position changes
    onPositionChange?.(
      movementState.current.currentPosition.clone(),
      movementState.current.currentLookAt.clone()
    );
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 5]}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}

// Emotion-driven orbit controls alternative
interface EmotionOrbitControlsProps {
  audioData?: AudioAnalysisData;
  emotionalState?: EmotionalState;
  config?: Partial<EmotionNavigationConfig>;
  target?: THREE.Vector3;
}

export function EmotionOrbitControls({
  audioData,
  emotionalState,
  config = {},
  target = new THREE.Vector3(0, 0, 0)
}: EmotionOrbitControlsProps) {
  const controlsRef = useRef<any>(null);
  
  const fullConfig: EmotionNavigationConfig = {
    enabled: true,
    sensitivity: 1.0,
    smoothing: 0.1,
    boundaryRadius: 50,
    autoReturn: true,
    returnSpeed: 0.02,
    ...config
  };

  useFrame((state, delta) => {
    if (!controlsRef.current || !fullConfig.enabled) return;
    
    const emotion = emotionalState || deriveEmotionFromAudio(audioData);
    
    // Automatic rotation based on emotion
    const rotationSpeed = emotion.arousal * 0.2 + emotion.energy * 0.1;
    
    // Energy affects zoom level
    const targetDistance = 5 + (1 - emotion.energy) * 10;
    
    // Valence affects vertical angle
    const targetPolarAngle = Math.PI / 2 + (emotion.valence - 0.5) * 0.5;
    
    // Apply emotional influences to controls
    if (controlsRef.current.autoRotate !== undefined) {
      controlsRef.current.autoRotateSpeed = rotationSpeed * 2;
      controlsRef.current.autoRotate = emotion.arousal > 0.3;
    }
  });

  function deriveEmotionFromAudio(audio?: AudioAnalysisData): EmotionalState {
    if (!audio) {
      return { energy: 0.5, valence: 0.5, arousal: 0.3, tension: 0.2 };
    }

    return {
      energy: Math.min(1, (audio.bass + audio.treble + audio.volume + 30) / 60),
      valence: Math.min(1, Math.max(0, (audio.mid + audio.highMid) / (audio.bass + 0.1))),
      arousal: Math.min(1, (audio.attack + audio.peak) / 2),
      tension: Math.min(1, (audio.centroid / 1000 + audio.rolloff / 1000) / 2)
    };
  }

  return null; // This would integrate with OrbitControls when available
}

// Gesture-based navigation for enhanced interaction
export interface GestureNavigationProps {
  enabled?: boolean;
  onGesture?: (gesture: string, data: any) => void;
}

export function GestureNavigation({ enabled = true, onGesture }: GestureNavigationProps) {
  const gestureState = useRef({
    isTracking: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    gestureType: 'none' as 'none' | 'pan' | 'pinch' | 'rotate'
  });

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (e: PointerEvent) => {
      gestureState.current.isTracking = true;
      gestureState.current.startPosition = { x: e.clientX, y: e.clientY };
      gestureState.current.currentPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!gestureState.current.isTracking) return;
      
      gestureState.current.currentPosition = { x: e.clientX, y: e.clientY };
      
      const deltaX = e.clientX - gestureState.current.startPosition.x;
      const deltaY = e.clientY - gestureState.current.startPosition.y;
      
      onGesture?.('pan', { deltaX, deltaY, position: { x: e.clientX, y: e.clientY } });
    };

    const handlePointerUp = () => {
      gestureState.current.isTracking = false;
      gestureState.current.gestureType = 'none';
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [enabled, onGesture]);

  return null;
}