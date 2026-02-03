/**
 * Historical Universe - Complete Integration
 * Combines timeline navigation, magic skills, learning modules, and 3D visualization
 */

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';

// Import systems
import { TimelineNavigator, type HistoricalEra } from '@/lib/timeline-system';
import { MagicSkillTree, type MagicSkill } from '@/lib/magic-skill-system';
import { InteractiveKnowledgeBase } from '@/lib/knowledge-system';

// Import components
import {
  CivilizationStructure,
  Artifact3D,
  SkillVisualization,
  TimelineVisualizer
} from '@/components/cosmos/historical-3d-components';
import {
  HistoricalTimeline,
  MagicSkillPanel,
  LearningModulePanel,
  CivilizationSelector
} from './historical-ui';

interface HistoricalUniverseProps {
  initialYear?: number;
}

export const HistoricalUniverse: React.FC<HistoricalUniverseProps> = ({ initialYear = 0 }) => {
  // Core systems
  const [timelineNavigator] = useState(() => new TimelineNavigator());
  const [skillTree] = useState(() => new MagicSkillTree());
  const [knowledgeBase] = useState(() => new InteractiveKnowledgeBase());
  
  // State
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentEra, setCurrentEra] = useState<HistoricalEra | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [civilizationStructures, setCivilizationStructures] = useState<JSX.Element[]>([]);
  
  // Refs
  const audioContextRef = useRef<typeof Tone.Transport | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    timelineNavigator.setYear(currentYear);
    setCurrentEra(timelineNavigator.getCurrentEra(currentYear));
    
    // Initialize audio context
    if (!isAudioInitialized) {
      Tone.start().then(() => {
        setIsAudioInitialized(true);
        audioContextRef.current = Tone.Transport;
      });
    }
    
    // Generate civilization structures
    const eras = timelineNavigator.getAllEras();
    const structures = eras.map((era, index) => {
      const angle = (index / eras.length) * Math.PI * 2;
      const radius = 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      return (
        <CivilizationStructure
          key={era.id}
          era={era}
          position={new THREE.Vector3(x, 0, z)}
          scale={2}
          onClick={() => handleCivilizationClick(era)}
        />
      );
    });
    
    setCivilizationStructures(structures);
  // Note: Dependencies omitted intentionally for one-time initialization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle year change
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    timelineNavigator.setYear(year);
    const era = timelineNavigator.getCurrentEra(year);
    setCurrentEra(era);
    
    if (era && isAudioInitialized) {
      playEraMusic();
    }
  };
  
  // Handle civilization click
  const handleCivilizationClick = (era: HistoricalEra) => {
    setCurrentYear(era.period.start);
    handleYearChange(era.period.start);
  };
  
  // Handle civilization selection
  const handleCivilizationSelect = (eraId: string) => {
    const era = timelineNavigator.getEraById(eraId);
    if (era) {
      handleCivilizationClick(era);
    }
  };
  
  // Play era-specific music  
  const playEraMusic = () => {
    if (!isAudioInitialized) return;
    
    try {
      // Play simple tones based on era's primary emotion
      const synth = new Tone.Synth().toDestination();
      const notes = ['C4', 'E4', 'G4', 'C5'];
      
      let time = Tone.now();
      notes.forEach((note) => {
        synth.triggerAttackRelease(note, '8n', time);
        time += 0.5;
      });
      
      setTimeout(() => {
        synth.dispose();
      }, 3000);
    } catch (error) {
      console.error('Error playing music:', error);
    }
  };
  
  // Handle skill casting
  const handleSkillCast = (skillId: string) => {
    const skill = skillTree.getSkill(skillId);
    if (!skill || !skillTree.castSkill(skillId)) return;
    
    setActiveSkill(skillId);
    
    if (isAudioInitialized) {
      playSkillSound(skill);
    }
    
    // Reset after animation
    setTimeout(() => {
      setActiveSkill(null);
    }, skill.visualEffect.animationDuration * 1000);
    
    // Regenerate mana
    setTimeout(() => {
      skillTree.regenerateMana(skill.manaCost / 2);
    }, skill.cooldown * 1000);
  };
  
  // Play skill sound
  const playSkillSound = (skill: MagicSkill) => {
    try {
      const synth = new Tone.Synth({
        oscillator: {
          type: 'sine'
        },
        envelope: skill.audioEffect.envelope
      }).toDestination();
      
      synth.volume.value = skill.audioEffect.volume;
      synth.triggerAttackRelease(
        skill.audioEffect.frequency,
        skill.audioEffect.duration
      );
    } catch (error) {
      console.error('Error playing skill sound:', error);
    }
  };
  
  // Handle module start
  const handleModuleStart = (moduleId: string) => {
    if (knowledgeBase.startModule(moduleId)) {
      // Simulate module progression
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        knowledgeBase.updateModuleProgress(moduleId, progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          knowledgeBase.completeModule(moduleId);
          
          // Award experience to skill tree
          const learningModule = knowledgeBase.getAllModules().find(m => m.id === moduleId);
          if (learningModule) {
            skillTree.addExperience(learningModule.rewards.experience);
            
            // Unlock skills
            learningModule.rewards.unlockSkills?.forEach(skillId => {
              skillTree.unlockSkill(skillId);
            });
          }
        }
      }, 1000);
    }
  };
  
  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Canvas */}
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 20, 50]} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxDistance={100}
            minDistance={10}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4169E1" />
          
          {/* Background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
          />
          
          {/* Current Era Visual Theme */}
          {currentEra && (
            <color attach="background" args={[currentEra.visualTheme.skyColor]} />
          )}
          
          {/* Civilization Structures */}
          {civilizationStructures}
          
          {/* Artifacts */}
          {currentEra?.artifacts.map(artifact => (
            <Artifact3D
              key={artifact.id}
              artifact={artifact}
              onClick={() => knowledgeBase.examineArtifact(artifact.id)}
              playSound={isAudioInitialized}
            />
          ))}
          
          {/* Active Skill Visualization */}
          {activeSkill && (
            <SkillVisualization
              skill={skillTree.getSkill(activeSkill)!}
              position={new THREE.Vector3(0, 10, 0)}
              active={true}
            />
          )}
          
          {/* Timeline Visualizer */}
          <TimelineVisualizer
            currentYear={currentYear}
            eras={timelineNavigator.getAllEras()}
            onYearChange={handleYearChange}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlays */}
      <HistoricalTimeline
        navigator={timelineNavigator}
        onYearChange={handleYearChange}
      />
      
      <MagicSkillPanel
        skillTree={skillTree}
        onSkillCast={handleSkillCast}
      />
      
      <LearningModulePanel
        knowledgeBase={knowledgeBase}
        onModuleStart={handleModuleStart}
      />
      
      <CivilizationSelector
        navigator={timelineNavigator}
        onCivilizationSelect={handleCivilizationSelect}
      />
      
      {/* Current Era Display */}
      {currentEra && (
        <div className="fixed top-6 left-6 bg-black/80 backdrop-blur-lg rounded-lg p-6 border border-white/20 
          max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">{currentEra.name}</h1>
          <p className="text-purple-300 text-lg mb-4">{currentEra.civilization}</p>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Region:</span>
              <span className="text-white ml-2">{currentEra.region}</span>
            </div>
            
            <div>
              <span className="text-gray-400">Primary Emotion:</span>
              <span className="text-cyan-300 ml-2 capitalize">{currentEra.emotions.primary}</span>
            </div>
            
            <div>
              <span className="text-gray-400">Musical Character:</span>
              <span className="text-amber-300 ml-2">
                {currentEra.musicalStyle.characteristics.slice(0, 2).join(', ')}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Key Achievement:</span>
              <p className="text-white mt-1">{currentEra.culturalAchievements[0]}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Audio Initialization Prompt */}
      {!isAudioInitialized && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to the Historical Universe</h2>
            <p className="text-purple-200 mb-8 text-lg">
              Experience music, emotions, and magic across all civilizations
            </p>
            <button
              onClick={() => Tone.start().then(() => setIsAudioInitialized(true))}
              className="px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-xl 
                hover:bg-purple-100 transition-colors"
            >
              Begin Journey 🎵
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalUniverse;
