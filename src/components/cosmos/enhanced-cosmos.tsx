/**
 * Enhanced Cosmic Experience
 * Master integration of all advanced features
 */

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Import all new systems
import { AdvancedMusicAnalyzer, MusicAnalysisData, getGlobalMusicAnalyzer } from '@/lib/advanced-music-analyzer';
import { ParticleSystem, ShootingStars } from '@/components/cosmos/particle-system';
import { PostProcessing, VolumetricLight, LensFlare } from '@/components/cosmos/post-processing';
import { InteractiveCamera, createPlanetTarget, type CameraTarget } from '@/components/cosmos/interactive-camera';
import { PlanetLanding } from '@/components/cosmos/planet-landing';
import { PortalSystem } from '@/components/cosmos/wormhole-portal';
import { ConstellationDrawer, SavedConstellations, generateStars, type Star } from '@/components/cosmos/constellation-drawer';
import { PhysicsEngine, usePhysics, createSolarSystemPhysics } from '@/lib/physics-engine';
import { useMediaCapture } from '@/lib/media-capture';
import { WeatherSystem } from '@/components/cosmos/weather-system';

// Import existing components
import { PlanetarySystem } from './planetary-system';
import type { Constellation } from './constellation-drawer';

interface EnhancedCosmosProps {
  enablePhysics?: boolean;
  enablePostProcessing?: boolean;
  enableParticles?: boolean;
  enableWeather?: boolean;
  enablePortals?: boolean;
  enableConstellations?: boolean;
}

export function EnhancedCosmos({
  enablePhysics = true,
  enablePostProcessing = true,
  enableParticles = true,
  enableWeather = true,
  enablePortals = true,
  enableConstellations = false
}: EnhancedCosmosProps) {
  // State management
  const [musicData, setMusicData] = useState<MusicAnalysisData | undefined>();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | undefined>();
  const [isLanded, setIsLanded] = useState(false);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [stars] = useState<Star[]>(() => generateStars(150));
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AdvancedMusicAnalyzer>(getGlobalMusicAnalyzer());
  const physics = usePhysics();
  
  // Media capture controls
  const { takeScreenshot, takeHiResScreenshot, startRecording, stopRecording, isRecording } =
    useMediaCapture(canvasRef.current, null);
  
  // Initialize physics
  useEffect(() => {
    if (enablePhysics) {
      createSolarSystemPhysics(physics);
    }
  }, [enablePhysics, physics]);
  
  // Setup music analyzer
  useEffect(() => {
    // Simulated music data for testing
    const interval = setInterval(() => {
      const analysis = analyzerRef.current.getAnalysis();
      setMusicData(analysis);
    }, 1000 / 60); // 60 FPS
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle planet selection
  const handlePlanetClick = (planetName: string, position: THREE.Vector3, radius: number) => {
    setSelectedPlanet(planetName);
    const target = createPlanetTarget(position, radius);
    setCameraTarget(target);
  };
  
  // Handle planet landing
  const handleLanding = () => {
    if (selectedPlanet) {
      setIsLanded(true);
    }
  };
  
  // Exit landing
  const handleExitLanding = () => {
    setIsLanded(false);
    setCameraTarget(undefined);
  };
  
  // Portal teleportation
  const handlePortalTeleport = (destination: string) => {
    setSelectedPlanet(destination);
    // Find planet and set camera target
    // ... implementation
  };
  
  // Constellation creation
  const handleConstellationCreated = (constellation: Constellation) => {
    setConstellations(prev => [...prev, constellation]);
  };
  
  // Define portals between planets
  const portals = [
    {
      id: 'portal-earth-mars',
      position: [15, 0, 15] as [number, number, number],
      destination: 'Mars',
      color: '#ff6600'
    },
    {
      id: 'portal-jupiter-saturn',
      position: [-30, 0, 30] as [number, number, number],
      destination: 'Saturn',
      color: '#ffaa00'
    }
  ];
  
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Controls UI */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <ControlPanel
          onScreenshot={takeScreenshot}
          onHiResScreenshot={takeHiResScreenshot}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isRecording={isRecording}
          selectedPlanet={selectedPlanet}
          onLand={handleLanding}
          isLanded={isLanded}
        />
      </div>
      
      {/* Music Info Display */}
      <MusicInfoDisplay musicData={musicData} />
      
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 20, 50], fov: 60 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
          
          {/* Sky */}
          <Sky sunPosition={[100, 100, 100]} />
          
          {/* Camera Controller */}
          <InteractiveCamera
            target={cameraTarget}
            enableControls={!isLanded}
            autoRotate={!selectedPlanet && !isLanded}
          />
          
          {/* Main Scene */}
          {!isLanded ? (
            <>
              {/* Planetary System */}
              <PlanetarySystem
                musicInfluence={{
                  rotationMultiplier: 1 + (musicData?.bass || 0),
                  scaleMultiplier: 1 + (musicData?.volume || 0) * 0.1,
                  glowIntensity: 0.5 + (musicData?.volume || 0)
                }}
              />
              
              {/* Particle Effects */}
              {enableParticles && (
                <>
                  <ParticleSystem
                    count={2000}
                    musicData={musicData}
                    type="stars"
                    color="#ffffff"
                    size={0.05}
                  />
                  <ParticleSystem
                    count={500}
                    musicData={musicData}
                    type="nebula"
                    color="#ff00ff"
                    size={0.1}
                  />
                  <ShootingStars musicData={musicData} />
                </>
              )}
              
              {/* Volumetric Lights */}
              <VolumetricLight
                position={[0, 0, 0]}
                color="#ffaa00"
                intensity={2}
                musicData={musicData}
              />
              <LensFlare position={[0, 0, 0]} color="#ffffff" musicData={musicData} />
              
              {/* Wormhole Portals */}
              {enablePortals && (
                <PortalSystem
                  portals={portals}
                  musicData={musicData}
                  onTeleport={handlePortalTeleport}
                />
              )}
              
              {/* Constellation Drawing */}
              {enableConstellations && (
                <>
                  <ConstellationDrawer
                    stars={stars}
                    onConstellationCreated={handleConstellationCreated}
                  />
                  <SavedConstellations constellations={constellations} stars={stars} />
                </>
              )}
            </>
          ) : (
            /* Planet Landing Experience */
            selectedPlanet && (
              <PlanetLanding
                planetName={selectedPlanet}
                musicData={musicData}
                onExit={handleExitLanding}
              />
            )
          )}
          
          {/* Post Processing */}
          {enablePostProcessing && (
            <PostProcessing
              musicData={musicData}
              enableBloom
              enableChromaticAberration
              enableFilmGrain
              enableVignette
            />
          )}
          
          {/* Performance Stats */}
          <Stats />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Control Panel Component
function ControlPanel({
  onScreenshot,
  onHiResScreenshot,
  onStartRecording,
  onStopRecording,
  isRecording,
  selectedPlanet,
  onLand,
  isLanded
}: {
  onScreenshot: () => void;
  onHiResScreenshot: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  selectedPlanet: string | null;
  onLand: () => void;
  isLanded: boolean;
}) {
  return (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg space-y-2 text-white">
      <h3 className="font-bold text-lg">Cosmic Controls</h3>
      
      {/* Capture Controls */}
      <div className="space-y-1">
        <button
          onClick={onScreenshot}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          📸 Screenshot
        </button>
        <button
          onClick={onHiResScreenshot}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          🖼️ 4K Screenshot
        </button>
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`w-full px-3 py-2 rounded text-sm ${
            isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRecording ? '⏹️ Stop Recording' : '🎥 Start Recording'}
        </button>
      </div>
      
      {/* Planet Controls */}
      {selectedPlanet && !isLanded && (
        <button
          onClick={onLand}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
        >
          🚀 Land on {selectedPlanet}
        </button>
      )}
      
      {/* Info */}
      <div className="text-xs text-gray-400 mt-2 space-y-1">
        <p>• Click planets to focus</p>
        <p>• Drag to rotate view</p>
        <p>• Scroll to zoom</p>
        <p>• Enter portals to teleport</p>
      </div>
    </div>
  );
}

// Music Info Display
function MusicInfoDisplay({ musicData }: { musicData?: MusicAnalysisData }) {
  if (!musicData) return null;
  
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
      <h3 className="font-bold mb-2">Music Analysis</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span>Bass:</span>
          <div className="w-24 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-4 bg-red-500"
              style={{ width: `${musicData.bass * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <span>Mid:</span>
          <div className="w-24 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-4 bg-yellow-500"
              style={{ width: `${musicData.mid * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <span>Treble:</span>
          <div className="w-24 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-4 bg-blue-500"
              style={{ width: `${musicData.treble * 100}%` }}
            />
          </div>
        </div>
        {musicData.tempo > 0 && (
          <div className="flex justify-between gap-4 mt-2">
            <span>BPM:</span>
            <span className="font-mono">{musicData.tempo}</span>
          </div>
        )}
        {musicData.beat && (
          <div className="text-green-400 font-bold animate-pulse">
            🎵 BEAT
          </div>
        )}
      </div>
    </div>
  );
}
