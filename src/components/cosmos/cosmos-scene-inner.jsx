"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";

// Import our enhanced cosmic components
import { SolarSystem } from "./planetary-system";
import { DynamicNebulaField } from "./dynamic-nebulae";
import { InteractiveConstellationSystem } from "./interactive-constellations";
import { CosmicParticleEffects } from "./music-particles";
import { EmotionDrivenCamera, GestureNavigation } from "./emotion-navigation";

// Import data managers
import { cosmicDataManager } from "../../lib/cosmic-data-manager";
import { audioAnalyzer } from "../../lib/enhanced-audio-analyzer";
import { useCosmicPerformance } from "../../lib/performance-system";

function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    const color = new THREE.Color("#000011");
    const prev = scene.background;
    /* eslint-disable react-hooks/immutability -- R3F scene.background is intentionally set */
    scene.background = color;
    return () => {
      scene.background = prev;
    };
    /* eslint-enable react-hooks/immutability */
  }, [scene]);
  return null;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </mesh>
  );
}

export function SceneContent({ 
  reducedMotion = false, 
  audioEnabled = false, 
  initialQuality = 1.0,
  viewMode = 'explore' 
}) {
  const groupRef = useRef();
  
  // State management
  const [audioData, setAudioData] = useState(null);
  const [cosmicMapping, setCosmicMapping] = useState(null);
  const [planetaryData, setPlanetaryData] = useState([]);
  const [nebulaData, setNebulaData] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Performance monitoring
  const { 
    metrics, 
    quality, 
    lodManager, 
    frustumCuller,
    setQuality 
  } = useCosmicPerformance({
    targetFPS: reducedMotion ? 30 : 60,
    adaptiveQuality: !reducedMotion,
    enableLOD: !reducedMotion
  });

  // Initialize cosmic systems
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        // Initialize audio analyzer
        await audioAnalyzer.initialize();
        
        // Start audio analysis
        audioAnalyzer.start(
          (analysis) => setAudioData(analysis),
          (mapping) => setCosmicMapping(mapping)
        );
        
        // Start cosmic data manager
        await cosmicDataManager.start();
        
        // Subscribe to cosmic data updates
        cosmicDataManager.on('planetary_update', setPlanetaryData);
        cosmicDataManager.on('nebula_update', setNebulaData);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize cosmic systems:', error);
      }
    };

    initializeSystems();

    return () => {
      audioAnalyzer.stop();
      audioAnalyzer.dispose();
      cosmicDataManager.stop();
    };
  }, []);

  // Music influence calculations
  const musicInfluence = {
    rotationMultiplier: cosmicMapping ? 1 + cosmicMapping.planetRotation : 1,
    scaleMultiplier: cosmicMapping ? 1 + cosmicMapping.starIntensity * 0.1 : 1,
    glowIntensity: cosmicMapping ? cosmicMapping.auroraActivity : 0.5
  };

  // Handle planet selection
  const handlePlanetSelect = (planet) => {
    setSelectedPlanet(planet.name);
    console.log('Selected planet:', planet.name);
  };

  // Handle constellation selection
  const handleConstellationSelect = (constellation) => {
    setSelectedConstellation(constellation);
    console.log('Selected constellation:', constellation);
  };

  // Handle gesture navigation
  const handleGesture = (gesture, data) => {
    if (gesture === 'pan') {
      // Convert pan gesture to camera movement
      console.log('Gesture navigation:', gesture, data);
    }
  };

  // Performance quality adjustment
  const adjustedSegments = reducedMotion ? 16 : Math.floor(32 * quality);
  const particleCount = Math.floor(2000 * quality);

  if (!isInitialized) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SceneBackground />
        <ambientLight intensity={0.2} />
        <LoadingFallback />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SceneBackground />
      
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.3 + (audioData?.energy || 0) * 0.2} color="#4a5568" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1 + (audioData?.energy || 0) * 0.5}
        color="#ffd700"
        castShadow
        shadow-mapSize-width={1024 * quality}
        shadow-mapSize-height={1024 * quality}
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2 + (audioData?.bass || 0) * 3}
        color="#ff6b35"
        distance={100}
        decay={2}
      />
      
      {/* Enhanced Starfield */}
      <Stars 
        radius={300} 
        depth={50} 
        count={Math.floor(5000 * quality)} 
        factor={4} 
        saturation={0} 
        fade 
        speed={reducedMotion ? 0.1 : 0.5 + (audioData?.arousal || 0) * 0.5}
      />
      
      {/* Emotion-driven Camera */}
      <EmotionDrivenCamera
        audioData={audioData}
        config={{
          enabled: !reducedMotion,
          sensitivity: 0.8,
          smoothing: 0.1,
          boundaryRadius: 100
        }}
        onPositionChange={(position, lookAt) => {
          // Camera position change callback
        }}
      />
      
      {/* Gesture Navigation */}
      <GestureNavigation
        enabled={true}
        onGesture={handleGesture}
      />
      
      {/* Main Cosmic Group */}
      <group ref={groupRef}>
        {/* Real-time Solar System */}
        <SolarSystem
          planets={planetaryData}
          musicInfluence={musicInfluence}
          onPlanetSelect={handlePlanetSelect}
          selectedPlanet={selectedPlanet}
        />
        
        {/* Dynamic Nebulae Field */}
        <DynamicNebulaField
          nebulae={nebulaData}
          audioData={audioData}
          visible={quality > 0.5} // Hide on low quality
        />
        
        {/* Interactive Constellation System */}
        <InteractiveConstellationSystem
          audioData={audioData}
          visible={true}
          onConstellationSelect={handleConstellationSelect}
          selectedConstellation={selectedConstellation}
        />
        
        {/* Music-synchronized Particle Effects */}
        <CosmicParticleEffects
          audioData={audioData}
          activeEffects={{
            cosmicWind: quality > 0.3,
            aurora: quality > 0.5,
            meteorShower: false, // Auto-activated by audio
            starFormation: false // Auto-activated by audio
          }}
        />
      </group>
      
      {/* Fallback Controls for manual navigation */}
      <OrbitControls 
        enabled={reducedMotion} // Only enabled in reduced motion mode
        enableZoom 
        enablePan 
        minDistance={1.2} 
        maxDistance={200}
        autoRotate={!reducedMotion && (audioData?.arousal || 0) > 0.3}
        autoRotateSpeed={0.5 + (audioData?.energy || 0) * 2}
      />
      
      {/* Environment and atmosphere */}
      <Environment preset="night" />
      
      {/* Performance Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <group position={[-10, 8, 0]}>
          <mesh>
            <planeGeometry args={[4, 2]} />
            <meshBasicMaterial color="black" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[3.8, 1.8]} />
            <meshBasicMaterial color="green" transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </Suspense>
  );
}
