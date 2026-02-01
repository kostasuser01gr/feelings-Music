"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/stores/ui-store";
import { initAudio, getTempo, setTempo } from "@/lib/audio-engine";
import { cosmicDataManager } from "@/lib/cosmic-data-manager";
import { audioAnalyzer, type AudioAnalysisData } from "@/lib/enhanced-audio-analyzer";

interface CosmosControlsProps {
  onAudioToggle?: (enabled: boolean) => void;
  onQualityChange?: (quality: number) => void;
  onViewModeChange?: (mode: string) => void;
}

export function CosmosControls({ 
  onAudioToggle, 
  onQualityChange,
  onViewModeChange 
}: CosmosControlsProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioData, setAudioData] = useState<AudioAnalysisData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentTempo, setCurrentTempo] = useState(120);
  const [cosmicStatus, setCosmicStatus] = useState({ active: false, message: 'Offline' });
  const [performanceMode, setPerformanceMode] = useState('auto');
  const [selectedView, setSelectedView] = useState('explore');

  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  // Initialize audio system
  const handleAudioToggle = useCallback(async () => {
    if (audioEnabled) {
      // Stop audio
      audioAnalyzer.stop();
      setAudioEnabled(false);
      setAudioData(null);
      onAudioToggle?.(false);
    } else {
      // Start audio
      setIsInitializing(true);
      try {
        await initAudio();
        await audioAnalyzer.initialize();
        
        audioAnalyzer.start(
          (analysis) => setAudioData(analysis),
          (cosmicMapping) => {
            // Handle cosmic mapping if needed
          }
        );
        
        setAudioEnabled(true);
        onAudioToggle?.(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        alert('Failed to initialize audio. Please check microphone permissions.');
      } finally {
        setIsInitializing(false);
      }
    }
  }, [audioEnabled, onAudioToggle]);

  // Monitor cosmic data manager status
  useEffect(() => {
    const handleStatus = (status: { active: boolean; message: string }) => {
      setCosmicStatus(status);
    };

    cosmicDataManager.on('status', handleStatus);
    
    return () => {
      cosmicDataManager.off('status', handleStatus);
    };
  }, []);

  // Handle tempo changes
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    setCurrentTempo(newTempo);
  };

  // Handle performance mode changes
  const handlePerformanceModeChange = (mode: string) => {
    setPerformanceMode(mode);
    
    const qualityMap = {
      'low': 0.3,
      'medium': 0.6,
      'high': 1.0,
      'auto': 1.0
    };
    
    onQualityChange?.(qualityMap[mode as keyof typeof qualityMap] || 1.0);
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: string) => {
    setSelectedView(mode);
    onViewModeChange?.(mode);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cosmic Experience</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              cosmicStatus.active ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-muted-foreground">
              {cosmicStatus.message}
            </span>
          </div>
        </div>
        
        <Tabs value={selectedView} onValueChange={handleViewModeChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="meditate">Meditate</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Navigate through the cosmos with real-time astronomical data
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Find Planets
              </Button>
              <Button variant="outline" size="sm">
                Constellations
              </Button>
              <Button variant="outline" size="sm">
                Nebulae
              </Button>
              <Button variant="outline" size="sm">
                Deep Space
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="meditate" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Peaceful cosmic journey synchronized with ambient sounds
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm">
                Guided Meditation
              </Button>
              <Button variant="outline" size="sm">
                Free Float
              </Button>
              <Button variant="outline" size="sm">
                Breathing Space
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate and shape cosmic phenomena with music
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm">
                Music Visualizer
              </Button>
              <Button variant="outline" size="sm">
                Particle Sculptor
              </Button>
              <Button variant="outline" size="sm">
                Nebula Designer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Audio Controls */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="text-sm font-medium">Audio Reactivity</h4>
        
        <div className="space-y-3">
          <Button 
            onClick={handleAudioToggle}
            disabled={isInitializing}
            className="w-full"
            variant={audioEnabled ? "default" : "outline"}
          >
            {isInitializing ? 'Initializing...' : 
             audioEnabled ? 'Stop Audio Analysis' : 'Start Audio Analysis'}
          </Button>
          
          {audioData && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Energy:</span>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all"
                      style={{ width: `${audioData.energy * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valence:</span>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{ width: `${audioData.valence * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Bass:</span>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all"
                      style={{ width: `${audioData.bass * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Treble:</span>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full transition-all"
                      style={{ width: `${audioData.treble * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">
                  BPM: {Math.round(audioData.bpm)} | 
                  Pitch: {Math.round(audioData.pitch)}Hz
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Tempo: {currentTempo} BPM</label>
            <input
              type="range"
              min="60"
              max="180"
              value={currentTempo}
              onChange={(e) => handleTempoChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Performance Controls */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="text-sm font-medium">Performance</h4>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {['low', 'medium', 'high', 'auto'].map((mode) => (
              <Button
                key={mode}
                variant={performanceMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => handlePerformanceModeChange(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reduced-motion"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="reduced-motion" className="text-xs text-muted-foreground">
              Reduce motion for accessibility
            </label>
          </div>
        </div>
      </div>

      {/* Cosmic Information */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="text-sm font-medium">Real-time Data</h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Planetary Positions:</span>
            <span>Live</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Astronomical Events:</span>
            <span>Monitoring</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Space Weather:</span>
            <span>Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Constellation Data:</span>
            <span>Loaded</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="w-full text-xs">
          View Detailed Metrics
        </Button>
      </div>
    </div>
  );
}