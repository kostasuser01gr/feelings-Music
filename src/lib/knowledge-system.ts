/**
 * Interactive Knowledge and Learning System
 * Educational experiences through music, history, and emotions
 */

import * as THREE from 'three';
import type { HistoricalEra, Artifact } from './timeline-system';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'music-theory' | 'history' | 'culture' | 'instrument' | 'emotion' | 'philosophy';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  estimatedTime: number;
  prerequisites: string[];
  rewards: {
    experience: number;
    unlockSkills?: string[];
    unlockArtifacts?: string[];
  };
  completed: boolean;
  progress: number;
}

export interface Quiz {
  id: string;
  question: string;
  type: 'multiple-choice' | 'audio-recognition' | 'visual-matching' | 'interactive';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  audioSample?: string;
  visualAid?: string;
}

export interface MusicalTour {
  id: string;
  title: string;
  civilization: string;
  description: string;
  stops: TourStop[];
  duration: number;
  soundtrack: string[];
}

export interface TourStop {
  position: THREE.Vector3;
  title: string;
  description: string;
  artifact?: Artifact;
  audioSample: string;
  interactivEvent?: string;
  quiz?: Quiz;
}

export interface ArtifactExperience {
  artifact: Artifact;
  unlocked: boolean;
  timesExamined: number;
  notesCollected: string[];
  relatedContent: string[];
}

export class InteractiveKnowledgeBase {
  private modules: Map<string, LearningModule> = new Map();
  private completedModules: Set<string> = new Set();
  private artifactExperiences: Map<string, ArtifactExperience> = new Map();
  private tours: Map<string, MusicalTour> = new Map();
  private totalExperience: number = 0;
  
  constructor() {
    this.initializeLearningModules();
    this.initializeMusicalTours();
  }
  
  private initializeLearningModules(): void {
    const modules: LearningModule[] = [
      {
        id: 'ancient-egypt-intro',
        title: 'Introduction to Ancient Egyptian Music',
        description: 'Discover the sacred sounds that echoed through temple halls',
        category: 'music-theory',
        difficulty: 'beginner',
        estimatedTime: 15,
        prerequisites: [],
        rewards: {
          experience: 500,
          unlockSkills: ['solar-invocation'],
          unlockArtifacts: ['hymn-to-hathor']
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'egyptian-hieroglyphics',
        title: 'Musical Hieroglyphics',
        description: 'Learn to read ancient Egyptian musical notation',
        category: 'music-theory',
        difficulty: 'intermediate',
        estimatedTime: 30,
        prerequisites: ['ancient-egypt-intro'],
        rewards: {
          experience: 1000,
          unlockSkills: ['hieroglyphic-channeling'],
          unlockArtifacts: ['sistrum-of-isis']
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'mesopotamian-mathematics',
        title: 'Mathematical Music of Mesopotamia',
        description: 'Understand the first mathematical approach to music',
        category: 'music-theory',
        difficulty: 'intermediate',
        estimatedTime: 25,
        prerequisites: [],
        rewards: {
          experience: 800,
          unlockSkills: ['cuneiform-summoning'],
          unlockArtifacts: ['hymn-to-nikkal', 'lyre-of-ur']
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'greek-modes',
        title: 'The Greek Musical Modes',
        description: 'Master the seven modes that became the foundation of Western music',
        category: 'music-theory',
        difficulty: 'intermediate',
        estimatedTime: 45,
        prerequisites: [],
        rewards: {
          experience: 1200,
          unlockSkills: ['harmonic-resonance'],
          unlockArtifacts: ['seikilos-epitaph', 'pythagoras-theory']
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'pythagorean-harmony',
        title: 'Pythagorean Music Theory',
        description: 'Discover the mathematical ratios that create perfect harmony',
        category: 'music-theory',
        difficulty: 'advanced',
        estimatedTime: 60,
        prerequisites: ['greek-modes', 'mesopotamian-mathematics'],
        rewards: {
          experience: 2000,
          unlockSkills: ['philosophical-insight'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'indian-raga-system',
        title: 'The Indian Raga System',
        description: 'Explore the complex emotional landscape of classical Indian music',
        category: 'music-theory',
        difficulty: 'advanced',
        estimatedTime: 90,
        prerequisites: [],
        rewards: {
          experience: 2500,
          unlockSkills: ['raga-manifestation'],
          unlockArtifacts: ['flowing-water-guqin']
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'chakra-frequencies',
        title: 'Chakra Frequencies and Sound Healing',
        description: 'Learn how specific frequencies activate energy centers',
        category: 'philosophy',
        difficulty: 'advanced',
        estimatedTime: 75,
        prerequisites: ['indian-raga-system'],
        rewards: {
          experience: 3000,
          unlockSkills: ['chakra-awakening'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'chinese-pentatonic',
        title: 'Chinese Pentatonic Philosophy',
        description: 'Understand the five-tone system and its cosmic significance',
        category: 'music-theory',
        difficulty: 'intermediate',
        estimatedTime: 40,
        prerequisites: [],
        rewards: {
          experience: 1500,
          unlockSkills: ['qi-channeling'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'five-elements-music',
        title: 'Five Elements in Music',
        description: 'Explore how wood, fire, earth, metal, and water manifest in sound',
        category: 'philosophy',
        difficulty: 'advanced',
        estimatedTime: 80,
        prerequisites: ['chinese-pentatonic'],
        rewards: {
          experience: 2800,
          unlockSkills: ['elemental-balance'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'medieval-polyphony',
        title: 'Medieval Polyphony',
        description: 'Master the art of combining multiple independent melodic lines',
        category: 'music-theory',
        difficulty: 'advanced',
        estimatedTime: 70,
        prerequisites: ['greek-modes'],
        rewards: {
          experience: 2200,
          unlockSkills: ['polyphonic-harmony'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'gregorian-chant',
        title: 'Gregorian Chant and Sacred Music',
        description: 'Experience the spiritual power of monophonic liturgical music',
        category: 'culture',
        difficulty: 'beginner',
        estimatedTime: 35,
        prerequisites: [],
        rewards: {
          experience: 900,
          unlockSkills: ['divine-light'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'renaissance-humanism',
        title: 'Renaissance Humanism in Music',
        description: 'Discover how human expression became central to musical composition',
        category: 'philosophy',
        difficulty: 'intermediate',
        estimatedTime: 50,
        prerequisites: ['medieval-polyphony'],
        rewards: {
          experience: 1800,
          unlockSkills: ['humanist-brilliance'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'golden-ratio-music',
        title: 'The Golden Ratio in Music',
        description: 'Apply Fibonacci sequences and phi to create perfect proportions',
        category: 'music-theory',
        difficulty: 'master',
        estimatedTime: 100,
        prerequisites: ['renaissance-humanism', 'pythagorean-harmony'],
        rewards: {
          experience: 5000,
          unlockSkills: ['golden-ratio'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'baroque-counterpoint',
        title: 'Baroque Counterpoint',
        description: 'Master the intricate art of Bach and fugue composition',
        category: 'music-theory',
        difficulty: 'master',
        estimatedTime: 120,
        prerequisites: ['medieval-polyphony'],
        rewards: {
          experience: 6000,
          unlockSkills: ['contrapuntal-weaving'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'romantic-expression',
        title: 'Romantic Expression and Emotion',
        description: 'Channel intense emotion through music like the great Romantics',
        category: 'emotion',
        difficulty: 'advanced',
        estimatedTime: 65,
        prerequisites: [],
        rewards: {
          experience: 2400,
          unlockSkills: ['emotional-surge'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'electronic-synthesis',
        title: 'Electronic Music Synthesis',
        description: 'Learn the fundamentals of sound synthesis and electronic music',
        category: 'instrument',
        difficulty: 'intermediate',
        estimatedTime: 55,
        prerequisites: [],
        rewards: {
          experience: 1600,
          unlockSkills: ['electric-surge'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'digital-audio-production',
        title: 'Digital Audio Production',
        description: 'Master modern DAW techniques and digital music creation',
        category: 'instrument',
        difficulty: 'advanced',
        estimatedTime: 90,
        prerequisites: ['electronic-synthesis'],
        rewards: {
          experience: 3500,
          unlockSkills: ['digital-synthesis'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'ai-music-generation',
        title: 'AI Music Generation',
        description: 'Harness artificial intelligence for creative music making',
        category: 'instrument',
        difficulty: 'master',
        estimatedTime: 150,
        prerequisites: ['digital-audio-production'],
        rewards: {
          experience: 8000,
          unlockSkills: ['ai-synthesis'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'neural-music-interfaces',
        title: 'Neural Music Interfaces',
        description: 'Explore the future of direct brain-to-music connections',
        category: 'instrument',
        difficulty: 'master',
        estimatedTime: 180,
        prerequisites: ['ai-music-generation', 'chakra-frequencies'],
        rewards: {
          experience: 15000,
          unlockSkills: ['neural-link'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      },
      
      {
        id: 'quantum-harmonics',
        title: 'Quantum Harmonics',
        description: 'Understand music that exists in superposition across timelines',
        category: 'philosophy',
        difficulty: 'master',
        estimatedTime: 200,
        prerequisites: ['neural-music-interfaces', 'golden-ratio-music'],
        rewards: {
          experience: 25000,
          unlockSkills: ['quantum-entanglement'],
          unlockArtifacts: []
        },
        completed: false,
        progress: 0
      }
    ];
    
    modules.forEach(module => {
      this.modules.set(module.id, module);
    });
  }
  
  private initializeMusicalTours(): void {
    // Ancient Egypt Tour
    this.tours.set('egypt-journey', {
      id: 'egypt-journey',
      title: 'Journey Through Ancient Egypt',
      civilization: 'ancient-egypt',
      description: 'Experience 3000 years of Egyptian musical tradition',
      duration: 600,
      soundtrack: ['sistrum-shake', 'harp-arpeggio', 'ritual-drums'],
      stops: [
        {
          position: new THREE.Vector3(0, 0, 0),
          title: 'Temple of Karnak',
          description: 'Hear the sacred hymns that honored the gods',
          audioSample: 'karnak-hymn',
          interactivEvent: 'play-sistrum',
          quiz: {
            id: 'egypt-q1',
            question: 'What instrument was sacred to the goddess Hathor?',
            type: 'multiple-choice',
            options: ['Sistrum', 'Harp', 'Flute', 'Drum'],
            correctAnswer: 0,
            explanation: 'The sistrum was a sacred rattle used in ceremonies honoring Hathor, goddess of music and joy'
          }
        },
        {
          position: new THREE.Vector3(20, 5, 0),
          title: 'Royal Palace',
          description: 'Listen to court musicians entertain pharaohs',
          audioSample: 'palace-music',
          interactivEvent: 'play-harp'
        },
        {
          position: new THREE.Vector3(40, 0, 20),
          title: 'Festival of Opet',
          description: 'Join the celebration with drums and dance',
          audioSample: 'festival-celebration',
          interactivEvent: 'play-drums'
        }
      ]
    });
    
    // Ancient Greece Tour
    this.tours.set('greece-odyssey', {
      id: 'greece-odyssey',
      title: 'The Greek Musical Odyssey',
      civilization: 'ancient-greece',
      description: 'Explore the birthplace of Western music theory',
      duration: 480,
      soundtrack: ['kithara-melody', 'aulos-harmony', 'theatrical-chorus'],
      stops: [
        {
          position: new THREE.Vector3(0, 0, 0),
          title: 'Theater of Dionysus',
          description: 'Experience the power of Greek tragedy and comedy',
          audioSample: 'greek-chorus',
          interactivEvent: 'perform-tragedy',
          quiz: {
            id: 'greece-q1',
            question: 'Which mode was associated with bravery and martial character?',
            type: 'multiple-choice',
            options: ['Dorian', 'Phrygian', 'Lydian', 'Mixolydian'],
            correctAnswer: 0,
            explanation: 'The Dorian mode was considered manly and courageous, often used in military contexts'
          }
        },
        {
          position: new THREE.Vector3(-15, 10, 15),
          title: 'School of Pythagoras',
          description: 'Discover the mathematical secrets of harmony',
          audioSample: 'pythagorean-intervals',
          interactivEvent: 'experiment-ratios'
        }
      ]
    });
    
    // More tours for other civilizations...
  }
  
  public startModule(moduleId: string): boolean {
    const learningModule = this.modules.get(moduleId);
    if (!learningModule) return false;
    
    // Check prerequisites
    for (const prereq of learningModule.prerequisites) {
      if (!this.completedModules.has(prereq)) {
        return false;
      }
    }
    
    return true;
  }
  
  public completeModule(moduleId: string): void {
    const learningModule = this.modules.get(moduleId);
    if (!learningModule) return;
    
    learningModule.completed = true;
    learningModule.progress = 100;
    this.completedModules.add(moduleId);
    this.totalExperience += learningModule.rewards.experience;
  }
  
  public updateModuleProgress(moduleId: string, progress: number): void {
    const learningModule = this.modules.get(moduleId);
    if (!learningModule) return;
    
    learningModule.progress = Math.min(100, progress);
  }
  
  public unlockArtifact(artifactId: string, artifact: Artifact): void {
    this.artifactExperiences.set(artifactId, {
      artifact,
      unlocked: true,
      timesExamined: 0,
      notesCollected: [],
      relatedContent: []
    });
  }
  
  public examineArtifact(artifactId: string): ArtifactExperience | null {
    const experience = this.artifactExperiences.get(artifactId);
    if (!experience || !experience.unlocked) return null;
    
    experience.timesExamined++;
    return experience;
  }
  
  public getTour(tourId: string): MusicalTour | undefined {
    return this.tours.get(tourId);
  }
  
  public getAllModules(): LearningModule[] {
    return Array.from(this.modules.values());
  }
  
  public getAvailableModules(): LearningModule[] {
    return Array.from(this.modules.values()).filter(module => {
      if (module.completed) return false;
      
      for (const prereq of module.prerequisites) {
        if (!this.completedModules.has(prereq)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  public getModulesByCategory(category: string): LearningModule[] {
    return Array.from(this.modules.values()).filter(m => m.category === category);
  }
  
  public getTotalExperience(): number {
    return this.totalExperience;
  }
  
  public getCompletionPercentage(): number {
    const total = this.modules.size;
    const completed = this.completedModules.size;
    return (completed / total) * 100;
  }
}

export class HistoricalQuizGenerator {
  public static generateQuiz(era: HistoricalEra): Quiz[] {
    const quizzes: Quiz[] = [];
    
    // Generate music theory questions
    quizzes.push({
      id: `${era.id}-music-theory`,
      question: `What musical scales were used in ${era.name}?`,
      type: 'multiple-choice',
      options: era.musicalStyle.scales,
      correctAnswer: 0,
      explanation: `${era.name} primarily used ${era.musicalStyle.scales[0]} scales`
    });
    
    // Generate instrument questions
    quizzes.push({
      id: `${era.id}-instruments`,
      question: `Which instruments were characteristic of ${era.civilization} music?`,
      type: 'multiple-choice',
      options: era.musicalStyle.instruments.slice(0, 4),
      correctAnswer: 0,
      explanation: `The ${era.musicalStyle.instruments[0]} was a primary instrument in ${era.civilization} music`
    });
    
    // Generate cultural questions
    quizzes.push({
      id: `${era.id}-culture`,
      question: `What was a major cultural achievement of ${era.civilization}?`,
      type: 'multiple-choice',
      options: era.culturalAchievements.slice(0, 4),
      correctAnswer: 0,
      explanation: era.culturalAchievements[0]
    });
    
    return quizzes;
  }
  
  public static generateAudioRecognitionQuiz(era: HistoricalEra): Quiz {
    return {
      id: `${era.id}-audio-recognition`,
      question: `Listen to this melody. Which civilization does it belong to?`,
      type: 'audio-recognition',
      audioSample: era.musicalStyle.audioSamples?.[0] || 'default-sample',
      correctAnswer: era.civilization,
      explanation: `This melody uses ${era.musicalStyle.characteristics[0]} characteristics typical of ${era.civilization} music`
    };
  }
}
