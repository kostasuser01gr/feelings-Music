/**
 * Magic Skill System
 * Progressive skill tree with magical musical abilities
 */

import * as THREE from 'three';
import type { EmotionType } from './advanced-particle-engine';

export type SkillCategory = 
  | 'elemental' 
  | 'harmonic' 
  | 'temporal' 
  | 'cosmic' 
  | 'cultural' 
  | 'creative'
  | 'transcendent';

export type SkillRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface SkillVisualEffect {
  particleColor: THREE.Color;
  particleShape: 'sphere' | 'star' | 'spiral' | 'wave' | 'rune' | 'mandala';
  particleCount: number;
  glowIntensity: number;
  trailEffect: boolean;
  shaderEffect?: string;
  animationDuration: number;
}

export interface SkillAudioEffect {
  toneSynth: 'synth' | 'fm' | 'am' | 'membrane' | 'metal' | 'pluck';
  frequency: number;
  duration: number;
  effects: string[];
  volume: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface SkillRequirement {
  level: number;
  prerequisiteSkills: string[];
  civilization?: string;
  emotion?: EmotionType;
  achievementUnlocked?: string;
}

export interface MagicSkill {
  id: string;
  name: string;
  description: string;
  lore: string;
  category: SkillCategory;
  rarity: SkillRarity;
  tier: number;
  requirements: SkillRequirement;
  visualEffect: SkillVisualEffect;
  audioEffect: SkillAudioEffect;
  cooldown: number;
  manaCost: number;
  power: number;
  unlocked: boolean;
  experience: number;
  maxExperience: number;
  culturalOrigin?: string;
}

export class MagicSkillTree {
  private skills: Map<string, MagicSkill> = new Map();
  private unlockedSkills: Set<string> = new Set();
  private playerLevel: number = 1;
  private playerMana: number = 100;
  private maxMana: number = 100;
  private experience: number = 0;
  
  constructor() {
    this.initializeSkills();
  }
  
  private initializeSkills(): void {
    const skillsData: MagicSkill[] = [
      // ELEMENTAL SKILLS
      {
        id: 'solar-invocation',
        name: 'Solar Invocation',
        description: 'Channel the power of Ra to illuminate your path with golden light',
        lore: 'Ancient Egyptian priests called upon Ra at dawn, their hymns echoing through temple halls',
        category: 'elemental',
        rarity: 'rare',
        tier: 1,
        requirements: {
          level: 5,
          prerequisiteSkills: [],
          civilization: 'ancient-egypt'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFD700),
          particleShape: 'star',
          particleCount: 500,
          glowIntensity: 2.0,
          trailEffect: true,
          shaderEffect: 'sun-rays',
          animationDuration: 3.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 2.0,
          effects: ['reverb', 'chorus', 'golden-shimmer'],
          volume: -10,
          envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 1.5 }
        },
        cooldown: 30,
        manaCost: 25,
        power: 75,
        unlocked: false,
        experience: 0,
        maxExperience: 1000,
        culturalOrigin: 'Ancient Egypt'
      },
      
      {
        id: 'pyramid-resonance',
        name: 'Pyramid Resonance',
        description: 'Harness the geometric power of pyramids to amplify all emotions',
        lore: 'The Great Pyramid channels cosmic energy through its perfect proportions',
        category: 'elemental',
        rarity: 'epic',
        tier: 2,
        requirements: {
          level: 10,
          prerequisiteSkills: ['solar-invocation'],
          civilization: 'ancient-egypt'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xC2B280),
          particleShape: 'rune',
          particleCount: 1000,
          glowIntensity: 1.5,
          trailEffect: true,
          shaderEffect: 'pyramid-geometry',
          animationDuration: 4.0
        },
        audioEffect: {
          toneSynth: 'membrane',
          frequency: 111,
          duration: 3.0,
          effects: ['reverb', 'delay', 'resonance-boost'],
          volume: -8,
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.9, release: 2.0 }
        },
        cooldown: 60,
        manaCost: 40,
        power: 120,
        unlocked: false,
        experience: 0,
        maxExperience: 2500,
        culturalOrigin: 'Ancient Egypt'
      },
      
      {
        id: 'cuneiform-summoning',
        name: 'Cuneiform Summoning',
        description: 'Inscribe ancient words of power that materialize as glowing symbols',
        lore: 'Mesopotamian scribes discovered that certain combinations held magical properties',
        category: 'cultural',
        rarity: 'uncommon',
        tier: 1,
        requirements: {
          level: 3,
          prerequisiteSkills: [],
          civilization: 'mesopotamia'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x8B4513),
          particleShape: 'rune',
          particleCount: 300,
          glowIntensity: 1.8,
          trailEffect: false,
          shaderEffect: 'cuneiform-glow',
          animationDuration: 2.5
        },
        audioEffect: {
          toneSynth: 'pluck',
          frequency: 256,
          duration: 1.5,
          effects: ['echo', 'ancient-whispers'],
          volume: -12,
          envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 1.0 }
        },
        cooldown: 20,
        manaCost: 15,
        power: 50,
        unlocked: false,
        experience: 0,
        maxExperience: 500,
        culturalOrigin: 'Mesopotamia'
      },
      
      {
        id: 'ziggurat-amplification',
        name: 'Ziggurat Amplification',
        description: 'Build a towering structure of sound that reaches the heavens',
        lore: 'The ziggurats were built to bridge earth and sky, amplifying prayers to the gods',
        category: 'elemental',
        rarity: 'rare',
        tier: 2,
        requirements: {
          level: 8,
          prerequisiteSkills: ['cuneiform-summoning'],
          civilization: 'mesopotamia'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x4169E1),
          particleShape: 'spiral',
          particleCount: 800,
          glowIntensity: 2.2,
          trailEffect: true,
          shaderEffect: 'ziggurat-layers',
          animationDuration: 5.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 528,
          duration: 4.0,
          effects: ['reverb', 'octave-up', 'heavenly-chorus'],
          volume: -6,
          envelope: { attack: 0.8, decay: 0.4, sustain: 0.85, release: 2.5 }
        },
        cooldown: 45,
        manaCost: 35,
        power: 100,
        unlocked: false,
        experience: 0,
        maxExperience: 2000,
        culturalOrigin: 'Mesopotamia'
      },
      
      // HARMONIC SKILLS
      {
        id: 'harmonic-resonance',
        name: 'Harmonic Resonance',
        description: 'Create perfect mathematical harmonies that align the cosmos',
        lore: 'Pythagoras taught that music and mathematics are the language of the universe',
        category: 'harmonic',
        rarity: 'epic',
        tier: 1,
        requirements: {
          level: 7,
          prerequisiteSkills: [],
          civilization: 'ancient-greece'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x1E90FF),
          particleShape: 'wave',
          particleCount: 600,
          glowIntensity: 1.7,
          trailEffect: true,
          shaderEffect: 'harmonic-waves',
          animationDuration: 3.5
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 3.0,
          effects: ['harmonic-series', 'golden-ratio-tuning', 'reverb'],
          volume: -9,
          envelope: { attack: 0.3, decay: 0.2, sustain: 0.9, release: 1.8 }
        },
        cooldown: 35,
        manaCost: 30,
        power: 110,
        unlocked: false,
        experience: 0,
        maxExperience: 1800,
        culturalOrigin: 'Ancient Greece'
      },
      
      {
        id: 'philosophical-insight',
        name: 'Philosophical Insight',
        description: 'Gain clarity and wisdom through contemplative melodies',
        lore: 'Greek philosophers used music to elevate the mind to higher understanding',
        category: 'transcendent',
        rarity: 'rare',
        tier: 2,
        requirements: {
          level: 12,
          prerequisiteSkills: ['harmonic-resonance'],
          civilization: 'ancient-greece'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xF5F5DC),
          particleShape: 'mandala',
          particleCount: 400,
          glowIntensity: 1.5,
          trailEffect: false,
          shaderEffect: 'wisdom-aura',
          animationDuration: 6.0
        },
        audioEffect: {
          toneSynth: 'synth',
          frequency: 396,
          duration: 5.0,
          effects: ['binaural-beats', 'theta-wave', 'clarity-enhancement'],
          volume: -15,
          envelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0 }
        },
        cooldown: 90,
        manaCost: 50,
        power: 80,
        unlocked: false,
        experience: 0,
        maxExperience: 3000,
        culturalOrigin: 'Ancient Greece'
      },
      
      {
        id: 'olympic-vigor',
        name: 'Olympic Vigor',
        description: 'Channel athletic excellence through rhythmic power',
        lore: 'Athletes trained to the rhythm of the aulos, building strength and endurance',
        category: 'elemental',
        rarity: 'uncommon',
        tier: 1,
        requirements: {
          level: 4,
          prerequisiteSkills: [],
          civilization: 'ancient-greece'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFD700),
          particleShape: 'star',
          particleCount: 350,
          glowIntensity: 2.0,
          trailEffect: true,
          shaderEffect: 'victory-flames',
          animationDuration: 2.0
        },
        audioEffect: {
          toneSynth: 'membrane',
          frequency: 480,
          duration: 1.5,
          effects: ['rhythmic-drive', 'energy-boost'],
          volume: -8,
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 }
        },
        cooldown: 25,
        manaCost: 20,
        power: 70,
        unlocked: false,
        experience: 0,
        maxExperience: 800,
        culturalOrigin: 'Ancient Greece'
      },
      
      // COSMIC/ELEMENTAL SKILLS
      {
        id: 'qi-channeling',
        name: 'Qi Channeling',
        description: 'Flow with the universal life force through meditative tones',
        lore: 'Chinese masters discovered how to harmonize inner energy with cosmic rhythms',
        category: 'cosmic',
        rarity: 'legendary',
        tier: 1,
        requirements: {
          level: 15,
          prerequisiteSkills: [],
          civilization: 'ancient-china'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x00A86B),
          particleShape: 'spiral',
          particleCount: 1200,
          glowIntensity: 1.4,
          trailEffect: true,
          shaderEffect: 'energy-flow',
          animationDuration: 7.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 6.0,
          effects: ['binaural-beats', 'energy-circulation', 'reverb'],
          volume: -12,
          envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 3.0 }
        },
        cooldown: 60,
        manaCost: 45,
        power: 150,
        unlocked: false,
        experience: 0,
        maxExperience: 5000,
        culturalOrigin: 'Ancient China'
      },
      
      {
        id: 'elemental-balance',
        name: 'Five Elements Balance',
        description: 'Harmonize wood, fire, earth, metal, and water in perfect equilibrium',
        lore: 'The five elements form the foundation of all existence in Chinese cosmology',
        category: 'elemental',
        rarity: 'epic',
        tier: 2,
        requirements: {
          level: 18,
          prerequisiteSkills: ['qi-channeling'],
          civilization: 'ancient-china'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFD700),
          particleShape: 'mandala',
          particleCount: 1500,
          glowIntensity: 1.8,
          trailEffect: true,
          shaderEffect: 'five-elements',
          animationDuration: 8.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 528,
          duration: 7.0,
          effects: ['pentatonic-harmony', 'elemental-chorus', 'reverb'],
          volume: -7,
          envelope: { attack: 1.0, decay: 0.8, sustain: 0.95, release: 4.0 }
        },
        cooldown: 120,
        manaCost: 60,
        power: 180,
        unlocked: false,
        experience: 0,
        maxExperience: 7000,
        culturalOrigin: 'Ancient China'
      },
      
      {
        id: 'calligraphy-manifestation',
        name: 'Calligraphy Manifestation',
        description: 'Paint living characters that dance and sing in the air',
        lore: 'Master calligraphers could bring their brushstrokes to life through perfect form',
        category: 'creative',
        rarity: 'rare',
        tier: 1,
        requirements: {
          level: 10,
          prerequisiteSkills: [],
          civilization: 'ancient-china'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x0A0A0A),
          particleShape: 'rune',
          particleCount: 500,
          glowIntensity: 1.2,
          trailEffect: true,
          shaderEffect: 'ink-flow',
          animationDuration: 4.0
        },
        audioEffect: {
          toneSynth: 'pluck',
          frequency: 396,
          duration: 3.0,
          effects: ['brush-strokes', 'zen-ambiance'],
          volume: -14,
          envelope: { attack: 0.02, decay: 0.5, sustain: 0.4, release: 1.5 }
        },
        cooldown: 40,
        manaCost: 30,
        power: 90,
        unlocked: false,
        experience: 0,
        maxExperience: 2200,
        culturalOrigin: 'Ancient China'
      },
      
      // TRANSCENDENT SKILLS
      {
        id: 'chakra-awakening',
        name: 'Chakra Awakening',
        description: 'Open the seven energy centers through sacred sound',
        lore: 'Indian yogis discovered the connection between sound frequencies and consciousness',
        category: 'transcendent',
        rarity: 'legendary',
        tier: 3,
        requirements: {
          level: 20,
          prerequisiteSkills: ['qi-channeling'],
          civilization: 'ancient-india'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFF9933),
          particleShape: 'mandala',
          particleCount: 2000,
          glowIntensity: 2.5,
          trailEffect: true,
          shaderEffect: 'chakra-rainbow',
          animationDuration: 10.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 9.0,
          effects: ['chakra-frequencies', 'harmonic-overtones', 'reverb'],
          volume: -10,
          envelope: { attack: 2.0, decay: 1.0, sustain: 0.9, release: 5.0 }
        },
        cooldown: 180,
        manaCost: 75,
        power: 200,
        unlocked: false,
        experience: 0,
        maxExperience: 10000,
        culturalOrigin: 'Ancient India'
      },
      
      {
        id: 'raga-manifestation',
        name: 'Raga Manifestation',
        description: 'Summon the emotional essence of classical Indian ragas',
        lore: 'Each raga has the power to evoke specific emotions and natural phenomena',
        category: 'harmonic',
        rarity: 'epic',
        tier: 2,
        requirements: {
          level: 14,
          prerequisiteSkills: [],
          civilization: 'ancient-india'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x33A1C9),
          particleShape: 'wave',
          particleCount: 900,
          glowIntensity: 1.6,
          trailEffect: true,
          shaderEffect: 'raga-flow',
          animationDuration: 6.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 396,
          duration: 5.0,
          effects: ['raga-ornamentation', 'tanpura-drone', 'reverb'],
          volume: -11,
          envelope: { attack: 1.0, decay: 0.6, sustain: 0.85, release: 3.5 }
        },
        cooldown: 70,
        manaCost: 40,
        power: 130,
        unlocked: false,
        experience: 0,
        maxExperience: 4000,
        culturalOrigin: 'Ancient India'
      },
      
      {
        id: 'mantra-power',
        name: 'Mantra Power',
        description: 'Chant sacred syllables that reshape reality',
        lore: 'The vibration of "Om" contains the entire universe within a single sound',
        category: 'cosmic',
        rarity: 'mythic',
        tier: 4,
        requirements: {
          level: 25,
          prerequisiteSkills: ['chakra-awakening', 'raga-manifestation'],
          civilization: 'ancient-india'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFFFFF),
          particleShape: 'mandala',
          particleCount: 3000,
          glowIntensity: 3.0,
          trailEffect: true,
          shaderEffect: 'cosmic-om',
          animationDuration: 12.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 136.1,
          duration: 10.0,
          effects: ['om-resonance', 'cosmic-reverb', 'reality-warp'],
          volume: -5,
          envelope: { attack: 3.0, decay: 2.0, sustain: 0.95, release: 6.0 }
        },
        cooldown: 300,
        manaCost: 100,
        power: 250,
        unlocked: false,
        experience: 0,
        maxExperience: 15000,
        culturalOrigin: 'Ancient India'
      },
      
      // MEDIEVAL/RENAISSANCE SKILLS
      {
        id: 'divine-light',
        name: 'Divine Light',
        description: 'Summon cathedral rays of holy illumination',
        lore: 'Medieval monks discovered the connection between sacred music and divine presence',
        category: 'elemental',
        rarity: 'rare',
        tier: 1,
        requirements: {
          level: 6,
          prerequisiteSkills: [],
          civilization: 'medieval-europe'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFD700),
          particleShape: 'star',
          particleCount: 700,
          glowIntensity: 2.3,
          trailEffect: true,
          shaderEffect: 'god-rays',
          animationDuration: 4.5
        },
        audioEffect: {
          toneSynth: 'synth',
          frequency: 528,
          duration: 4.0,
          effects: ['cathedral-reverb', 'angelic-chorus', 'heavenly-light'],
          volume: -8,
          envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 3.0 }
        },
        cooldown: 50,
        manaCost: 35,
        power: 95,
        unlocked: false,
        experience: 0,
        maxExperience: 1500,
        culturalOrigin: 'Medieval Europe'
      },
      
      {
        id: 'polyphonic-harmony',
        name: 'Polyphonic Harmony',
        description: 'Weave multiple independent melodic voices into perfect unity',
        lore: 'Medieval composers unlocked the secret of combining multiple sacred voices',
        category: 'harmonic',
        rarity: 'epic',
        tier: 2,
        requirements: {
          level: 13,
          prerequisiteSkills: ['divine-light'],
          civilization: 'medieval-europe'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x9966CC),
          particleShape: 'wave',
          particleCount: 1100,
          glowIntensity: 1.5,
          trailEffect: true,
          shaderEffect: 'interwoven-voices',
          animationDuration: 5.5
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 5.0,
          effects: ['multi-voice', 'sacred-harmony', 'reverb'],
          volume: -9,
          envelope: { attack: 0.8, decay: 0.4, sustain: 0.9, release: 2.5 }
        },
        cooldown: 65,
        manaCost: 45,
        power: 125,
        unlocked: false,
        experience: 0,
        maxExperience: 3500,
        culturalOrigin: 'Medieval Europe'
      },
      
      {
        id: 'golden-ratio',
        name: 'Golden Ratio',
        description: 'Apply divine proportion to create perfect mathematical beauty',
        lore: 'Renaissance artists discovered the golden ratio in both art and music',
        category: 'harmonic',
        rarity: 'legendary',
        tier: 2,
        requirements: {
          level: 16,
          prerequisiteSkills: [],
          civilization: 'renaissance'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFD700),
          particleShape: 'spiral',
          particleCount: 1618,
          glowIntensity: 2.0,
          trailEffect: true,
          shaderEffect: 'fibonacci-spiral',
          animationDuration: 6.18
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 5.0,
          effects: ['golden-tuning', 'fibonacci-sequence', 'reverb'],
          volume: -7,
          envelope: { attack: 0.618, decay: 0.382, sustain: 0.9, release: 2.618 }
        },
        cooldown: 75,
        manaCost: 50,
        power: 160,
        unlocked: false,
        experience: 0,
        maxExperience: 6180,
        culturalOrigin: 'Renaissance'
      },
      
      // MODERN/FUTURE SKILLS
      {
        id: 'electric-surge',
        name: 'Electric Surge',
        description: 'Channel raw electricity through sound waves',
        lore: 'The birth of electric music created entirely new sonic possibilities',
        category: 'elemental',
        rarity: 'rare',
        tier: 1,
        requirements: {
          level: 11,
          prerequisiteSkills: [],
          civilization: 'modern-20th'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x7DF9FF),
          particleShape: 'wave',
          particleCount: 800,
          glowIntensity: 2.5,
          trailEffect: true,
          shaderEffect: 'electric-arcs',
          animationDuration: 2.5
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 440,
          duration: 2.0,
          effects: ['distortion', 'electric-buzz', 'reverb'],
          volume: -6,
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.8 }
        },
        cooldown: 30,
        manaCost: 25,
        power: 105,
        unlocked: false,
        experience: 0,
        maxExperience: 2000,
        culturalOrigin: '20th Century'
      },
      
      {
        id: 'digital-synthesis',
        name: 'Digital Synthesis',
        description: 'Generate any imaginable sound through algorithmic magic',
        lore: 'Digital synthesis broke the limitations of acoustic instruments',
        category: 'creative',
        rarity: 'epic',
        tier: 2,
        requirements: {
          level: 17,
          prerequisiteSkills: ['electric-surge'],
          civilization: 'modern-20th'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFF00FF),
          particleShape: 'sphere',
          particleCount: 1000,
          glowIntensity: 1.8,
          trailEffect: false,
          shaderEffect: 'digital-matrix',
          animationDuration: 3.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 880,
          duration: 3.0,
          effects: ['bit-crush', 'frequency-modulation', 'reverb'],
          volume: -8,
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.0 }
        },
        cooldown: 45,
        manaCost: 35,
        power: 140,
        unlocked: false,
        experience: 0,
        maxExperience: 4500,
        culturalOrigin: '20th Century'
      },
      
      {
        id: 'ai-synthesis',
        name: 'AI Synthesis',
        description: 'Command artificial intelligence to generate infinite musical possibilities',
        lore: 'The fusion of human creativity and machine intelligence creates unprecedented art',
        category: 'creative',
        rarity: 'legendary',
        tier: 2,
        requirements: {
          level: 19,
          prerequisiteSkills: ['digital-synthesis'],
          civilization: 'contemporary-2000s'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x00FFFF),
          particleShape: 'sphere',
          particleCount: 1500,
          glowIntensity: 2.0,
          trailEffect: true,
          shaderEffect: 'neural-network',
          animationDuration: 4.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 4.0,
          effects: ['ai-generation', 'neural-processing', 'reverb'],
          volume: -9,
          envelope: { attack: 0.5, decay: 0.3, sustain: 0.85, release: 2.0 }
        },
        cooldown: 60,
        manaCost: 40,
        power: 170,
        unlocked: false,
        experience: 0,
        maxExperience: 8000,
        culturalOrigin: 'Contemporary'
      },
      
      {
        id: 'neural-link',
        name: 'Neural Link',
        description: 'Connect directly to the music through thought alone',
        lore: 'The future allows direct brain-to-music interfaces, bypassing all instruments',
        category: 'transcendent',
        rarity: 'mythic',
        tier: 5,
        requirements: {
          level: 30,
          prerequisiteSkills: ['ai-synthesis', 'mantra-power'],
          civilization: 'future-2050'
        },
        visualEffect: {
          particleColor: new THREE.Color(0x9370DB),
          particleShape: 'mandala',
          particleCount: 5000,
          glowIntensity: 3.5,
          trailEffect: true,
          shaderEffect: 'neural-synapses',
          animationDuration: 15.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 12.0,
          effects: ['brain-wave-sync', 'thought-to-sound', 'cosmic-reverb'],
          volume: -5,
          envelope: { attack: 4.0, decay: 2.0, sustain: 0.95, release: 8.0 }
        },
        cooldown: 600,
        manaCost: 150,
        power: 300,
        unlocked: false,
        experience: 0,
        maxExperience: 25000,
        culturalOrigin: 'Future 2050'
      },
      
      {
        id: 'quantum-entanglement',
        name: 'Quantum Entanglement',
        description: 'Create music that exists in superposition across all timelines',
        lore: 'Quantum music exists simultaneously in all possible states until observed',
        category: 'cosmic',
        rarity: 'mythic',
        tier: 5,
        requirements: {
          level: 35,
          prerequisiteSkills: ['neural-link'],
          civilization: 'future-2050'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xE0FFFF),
          particleShape: 'sphere',
          particleCount: 10000,
          glowIntensity: 4.0,
          trailEffect: true,
          shaderEffect: 'quantum-field',
          animationDuration: 20.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 15.0,
          effects: ['quantum-superposition', 'timeline-harmonics', 'infinite-reverb'],
          volume: -3,
          envelope: { attack: 5.0, decay: 3.0, sustain: 0.98, release: 10.0 }
        },
        cooldown: 900,
        manaCost: 200,
        power: 500,
        unlocked: false,
        experience: 0,
        maxExperience: 50000,
        culturalOrigin: 'Future 2050'
      },
      
      {
        id: 'thought-manifestation',
        name: 'Thought Manifestation',
        description: 'Materialize pure thought into sound, light, and emotion',
        lore: 'The ultimate skill: transform consciousness itself into reality',
        category: 'transcendent',
        rarity: 'mythic',
        tier: 6,
        requirements: {
          level: 50,
          prerequisiteSkills: ['quantum-entanglement', 'chakra-awakening', 'golden-ratio'],
          civilization: 'future-2050'
        },
        visualEffect: {
          particleColor: new THREE.Color(0xFFFFFF),
          particleShape: 'mandala',
          particleCount: 20000,
          glowIntensity: 5.0,
          trailEffect: true,
          shaderEffect: 'reality-creation',
          animationDuration: 30.0
        },
        audioEffect: {
          toneSynth: 'fm',
          frequency: 432,
          duration: 20.0,
          effects: ['consciousness-to-sound', 'reality-warp', 'infinite-harmony'],
          volume: 0,
          envelope: { attack: 8.0, decay: 4.0, sustain: 1.0, release: 15.0 }
        },
        cooldown: 1800,
        manaCost: 300,
        power: 1000,
        unlocked: false,
        experience: 0,
        maxExperience: 100000,
        culturalOrigin: 'Future 2050'
      }
    ];
    
    skillsData.forEach(skill => {
      this.skills.set(skill.id, skill);
    });
  }
  
  public unlockSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    
    // Check requirements
    if (this.playerLevel < skill.requirements.level) return false;
    
    for (const prereq of skill.requirements.prerequisiteSkills) {
      if (!this.unlockedSkills.has(prereq)) return false;
    }
    
    skill.unlocked = true;
    this.unlockedSkills.add(skillId);
    return true;
  }
  
  public castSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || !skill.unlocked) return false;
    if (this.playerMana < skill.manaCost) return false;
    
    this.playerMana -= skill.manaCost;
    skill.experience += 100;
    
    if (skill.experience >= skill.maxExperience) {
      skill.experience = 0;
      skill.power += 10;
    }
    
    return true;
  }
  
  public getSkill(skillId: string): MagicSkill | undefined {
    return this.skills.get(skillId);
  }
  
  public getAllSkills(): MagicSkill[] {
    return Array.from(this.skills.values());
  }
  
  public getSkillsByCategory(category: SkillCategory): MagicSkill[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }
  
  public getUnlockedSkills(): MagicSkill[] {
    return Array.from(this.unlockedSkills).map(id => this.skills.get(id)!).filter(Boolean);
  }
  
  public addExperience(amount: number): void {
    this.experience += amount;
    
    while (this.experience >= this.playerLevel * 1000) {
      this.experience -= this.playerLevel * 1000;
      this.playerLevel++;
      this.maxMana += 10;
      this.playerMana = this.maxMana;
    }
  }
  
  public regenerateMana(amount: number): void {
    this.playerMana = Math.min(this.maxMana, this.playerMana + amount);
  }
  
  public getPlayerLevel(): number {
    return this.playerLevel;
  }
  
  public getPlayerMana(): number {
    return this.playerMana;
  }
  
  public getMaxMana(): number {
    return this.maxMana;
  }
}
