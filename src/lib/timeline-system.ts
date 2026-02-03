/**
 * Timeline Navigation System
 * Navigate through history, present, and future with music and emotions
 */

import * as THREE from 'three';

export interface MusicStyle {
  instruments: string[];
  scales: string[];
  rhythmPatterns: number[];
  tempo: { min: number; max: number };
  characteristics: string[];
  audioSamples?: string[];
}

export interface EmotionProfile {
  primary: string;
  secondary: string[];
  intensity: number;
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
}

export interface VisualTheme {
  colors: string[];
  colorValues: THREE.Color[];
  architecture: string;
  patterns: string;
  lighting: string;
  ambientColor: THREE.Color;
  skyColor: THREE.Color;
  particleStyle: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'music-notation' | 'instrument' | 'art' | 'treatise' | 'architecture' | 'ceremony';
  year: number;
  description: string;
  culturalSignificance: string;
  position?: THREE.Vector3;
  model?: string;
}

export interface HistoricalEra {
  id: string;
  name: string;
  civilization: string;
  region: string;
  period: { start: number; end: number };
  musicalStyle: MusicStyle;
  emotions: EmotionProfile;
  visualTheme: VisualTheme;
  artifacts: Artifact[];
  knowledgeTopics: string[];
  culturalAchievements: string[];
  magicAbilities?: string[];
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  type: 'musical' | 'cultural' | 'technological' | 'artistic';
  importance: number;
  relatedArtifacts: string[];
}

export class TimelineNavigator {
  private eras: HistoricalEra[] = [];
  private currentYear: number = 0;
  private currentEra: HistoricalEra | null = null;
  private timelineEvents: TimelineEvent[] = [];
  
  constructor() {
    this.initializeEras();
    this.initializeTimelineEvents();
  }
  
  private initializeEras(): void {
    this.eras = [
      // ANCIENT CIVILIZATIONS
      {
        id: 'ancient-egypt',
        name: 'Ancient Egypt',
        civilization: 'Egyptian',
        region: 'North Africa',
        period: { start: -3100, end: -30 },
        musicalStyle: {
          instruments: ['sistrum', 'harp', 'lute', 'menat', 'double-flute', 'drums'],
          scales: ['pentatonic', 'heptatonic'],
          rhythmPatterns: [4, 6, 8, 12],
          tempo: { min: 60, max: 100 },
          characteristics: ['ceremonial', 'mystical', 'rhythmic', 'divine'],
          audioSamples: ['sistrum-shake', 'harp-arpeggio', 'ritual-drums']
        },
        emotions: {
          primary: 'reverence',
          secondary: ['wonder', 'solemnity', 'devotion', 'cosmic-connection'],
          intensity: 0.8,
          valence: 0.6,
          arousal: 0.5
        },
        visualTheme: {
          colors: ['gold', 'lapis-lazuli', 'sandstone', 'turquoise', 'papyrus-green'],
          colorValues: [
            new THREE.Color(0xFFD700),
            new THREE.Color(0x1560BD),
            new THREE.Color(0xC2B280),
            new THREE.Color(0x40E0D0),
            new THREE.Color(0x2D5016)
          ],
          architecture: 'pyramids',
          patterns: 'hieroglyphics',
          lighting: 'warm-desert-sun',
          ambientColor: new THREE.Color(0xFFA500),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'golden-sand-particles'
        },
        artifacts: [
          {
            id: 'hymn-to-hathor',
            name: 'Hymn to Hathor',
            type: 'music-notation',
            year: -2000,
            description: 'Ancient Egyptian musical notation found in temple inscriptions',
            culturalSignificance: 'Shows advanced understanding of musical theory and religious devotion',
            position: new THREE.Vector3(10, 5, 0)
          },
          {
            id: 'sistrum-of-isis',
            name: 'Sistrum of Isis',
            type: 'instrument',
            year: -1500,
            description: 'Sacred rattle used in religious ceremonies',
            culturalSignificance: 'Central to worship of Isis and Hathor',
            position: new THREE.Vector3(5, 3, 5)
          }
        ],
        knowledgeTopics: [
          'Mathematics and Architecture',
          'Hieroglyphic Writing System',
          'Religious Beliefs and Afterlife',
          'Musical Instruments and Scales',
          'Astronomy and Calendar Systems'
        ],
        culturalAchievements: [
          'Construction of the Great Pyramids',
          'Development of advanced mathematics',
          'Creation of the 365-day calendar',
          'Sophisticated embalming techniques',
          'Monumental architecture and art'
        ],
        magicAbilities: ['solar-invocation', 'pyramid-resonance', 'hieroglyphic-channeling']
      },
      
      {
        id: 'mesopotamia',
        name: 'Mesopotamia',
        civilization: 'Sumerian/Babylonian/Assyrian',
        region: 'Middle East',
        period: { start: -4500, end: -539 },
        musicalStyle: {
          instruments: ['lyre', 'silver-flute', 'tambourine', 'cymbals', 'lute', 'harp'],
          scales: ['pythagorean', 'mesopotamian-heptatonic', 'diatonic'],
          rhythmPatterns: [3, 4, 7, 9],
          tempo: { min: 70, max: 110 },
          characteristics: ['mathematical', 'sacred', 'ceremonial', 'harmonic'],
          audioSamples: ['lyre-strumming', 'silver-flute-melody', 'ritual-cymbals']
        },
        emotions: {
          primary: 'wisdom',
          secondary: ['contemplation', 'cosmic-wonder', 'intellectual-curiosity', 'divine-order'],
          intensity: 0.7,
          valence: 0.5,
          arousal: 0.4
        },
        visualTheme: {
          colors: ['clay-brown', 'blue-glaze', 'bronze', 'reed-green', 'brick-red'],
          colorValues: [
            new THREE.Color(0x8B4513),
            new THREE.Color(0x4169E1),
            new THREE.Color(0xCD7F32),
            new THREE.Color(0x4A7C4E),
            new THREE.Color(0xB22222)
          ],
          architecture: 'ziggurats',
          patterns: 'cuneiform',
          lighting: 'river-dawn',
          ambientColor: new THREE.Color(0xDEB887),
          skyColor: new THREE.Color(0x6495ED),
          particleStyle: 'cuneiform-tablets'
        },
        artifacts: [
          {
            id: 'hymn-to-nikkal',
            name: 'Hymn to Nikkal',
            type: 'music-notation',
            year: -1400,
            description: 'Oldest known complete musical composition with notation',
            culturalSignificance: 'Demonstrates advanced musical theory and notation system',
            position: new THREE.Vector3(-10, 5, 0)
          },
          {
            id: 'lyre-of-ur',
            name: 'Lyre of Ur',
            type: 'instrument',
            year: -2600,
            description: 'Ornate golden lyre from the Royal Cemetery of Ur',
            culturalSignificance: 'Shows high craftsmanship and importance of music in royal courts',
            position: new THREE.Vector3(-5, 3, -5)
          }
        ],
        knowledgeTopics: [
          'Cuneiform Writing System',
          'Mathematics and Astronomy',
          'Code of Hammurabi',
          'Epic of Gilgamesh',
          'Agricultural Innovation'
        ],
        culturalAchievements: [
          'Invention of writing (cuneiform)',
          'Development of the wheel',
          'Creation of the first legal code',
          'Advanced irrigation systems',
          'Earliest known musical notation'
        ],
        magicAbilities: ['cuneiform-summoning', 'ziggurat-amplification', 'star-reading']
      },
      
      {
        id: 'ancient-greece',
        name: 'Ancient Greece',
        civilization: 'Hellenic',
        region: 'Mediterranean',
        period: { start: -800, end: -146 },
        musicalStyle: {
          instruments: ['kithara', 'aulos', 'pan-flute', 'lyre', 'hydraulis'],
          scales: ['dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'ionian', 'locrian'],
          rhythmPatterns: [3, 4, 5, 6, 7],
          tempo: { min: 80, max: 140 },
          characteristics: ['harmonic', 'theatrical', 'philosophical', 'modal', 'poetic'],
          audioSamples: ['kithara-melody', 'aulos-harmony', 'theatrical-chorus']
        },
        emotions: {
          primary: 'harmony',
          secondary: ['intellectual-joy', 'dramatic-passion', 'philosophical-calm', 'competitive-spirit'],
          intensity: 0.75,
          valence: 0.7,
          arousal: 0.6
        },
        visualTheme: {
          colors: ['marble-white', 'aegean-blue', 'olive-green', 'wine-red', 'bronze'],
          colorValues: [
            new THREE.Color(0xF5F5DC),
            new THREE.Color(0x1E90FF),
            new THREE.Color(0x556B2F),
            new THREE.Color(0x722F37),
            new THREE.Color(0xCD7F32)
          ],
          architecture: 'temples',
          patterns: 'greek-key',
          lighting: 'mediterranean-sun',
          ambientColor: new THREE.Color(0xFFE4B5),
          skyColor: new THREE.Color(0x00BFFF),
          particleStyle: 'laurel-leaves'
        },
        artifacts: [
          {
            id: 'seikilos-epitaph',
            name: 'Seikilos Epitaph',
            type: 'music-notation',
            year: -200,
            description: 'Oldest complete surviving musical composition',
            culturalSignificance: 'Provides insight into ancient Greek musical notation',
            position: new THREE.Vector3(0, 5, 10)
          },
          {
            id: 'pythagoras-theory',
            name: 'Pythagorean Music Theory',
            type: 'treatise',
            year: -500,
            description: 'Mathematical foundation of musical harmony',
            culturalSignificance: 'Revolutionized understanding of music and mathematics',
            position: new THREE.Vector3(0, 7, 5)
          }
        ],
        knowledgeTopics: [
          'Philosophy and Logic',
          'Democracy and Governance',
          'Olympic Games and Athletics',
          'Greek Mythology',
          'Mathematics and Geometry',
          'Theater and Drama'
        ],
        culturalAchievements: [
          'Birth of Western philosophy',
          'Development of democracy',
          'Foundation of Western theater',
          'Advances in mathematics and science',
          'Olympic Games tradition',
          'Epic poetry (Homer)'
        ],
        magicAbilities: ['harmonic-resonance', 'philosophical-insight', 'olympic-vigor']
      },
      
      {
        id: 'ancient-rome',
        name: 'Ancient Rome',
        civilization: 'Roman',
        region: 'Mediterranean/Europe',
        period: { start: -753, end: 476 },
        musicalStyle: {
          instruments: ['tuba', 'cornu', 'tibia', 'lyre', 'hydraulis', 'cymbals'],
          scales: ['greek-modes', 'roman-adaptations'],
          rhythmPatterns: [2, 4, 6, 8],
          tempo: { min: 90, max: 130 },
          characteristics: ['martial', 'grandiose', 'theatrical', 'ceremonial'],
          audioSamples: ['brass-fanfare', 'gladiator-drums', 'theater-organ']
        },
        emotions: {
          primary: 'power',
          secondary: ['triumph', 'discipline', 'grandeur', 'civic-pride'],
          intensity: 0.85,
          valence: 0.6,
          arousal: 0.75
        },
        visualTheme: {
          colors: ['imperial-purple', 'roman-red', 'marble-white', 'gold', 'bronze'],
          colorValues: [
            new THREE.Color(0x800080),
            new THREE.Color(0xDC143C),
            new THREE.Color(0xFFF8DC),
            new THREE.Color(0xFFD700),
            new THREE.Color(0xCD7F32)
          ],
          architecture: 'colosseum',
          patterns: 'roman-mosaic',
          lighting: 'imperial-glory',
          ambientColor: new THREE.Color(0xFFDAB9),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'marble-dust'
        },
        artifacts: [],
        knowledgeTopics: [
          'Roman Law',
          'Engineering and Architecture',
          'Latin Language',
          'Military Strategy',
          'Republic and Empire'
        ],
        culturalAchievements: [
          'Construction of the Colosseum',
          'Development of Roman law',
          'Aqueduct engineering',
          'Road network spanning empire',
          'Latin language and literature'
        ],
        magicAbilities: ['legion-might', 'architectural-mastery', 'imperial-authority']
      },
      
      {
        id: 'ancient-china',
        name: 'Ancient China',
        civilization: 'Chinese',
        region: 'East Asia',
        period: { start: -2070, end: 1912 },
        musicalStyle: {
          instruments: ['guqin', 'pipa', 'erhu', 'dizi', 'zheng', 'sheng', 'xiao'],
          scales: ['pentatonic', 'heptatonic', 'chinese-modes'],
          rhythmPatterns: [4, 8, 12, 16],
          tempo: { min: 50, max: 100 },
          characteristics: ['meditative', 'nature-inspired', 'philosophical', 'refined'],
          audioSamples: ['guqin-contemplation', 'bamboo-flute', 'silk-strings']
        },
        emotions: {
          primary: 'balance',
          secondary: ['tranquility', 'harmony-with-nature', 'wisdom', 'inner-peace'],
          intensity: 0.6,
          valence: 0.7,
          arousal: 0.3
        },
        visualTheme: {
          colors: ['imperial-yellow', 'jade-green', 'vermillion', 'ink-black', 'porcelain-white'],
          colorValues: [
            new THREE.Color(0xFFD700),
            new THREE.Color(0x00A86B),
            new THREE.Color(0xE34234),
            new THREE.Color(0x0A0A0A),
            new THREE.Color(0xFFFAFA)
          ],
          architecture: 'pagodas',
          patterns: 'chinese-calligraphy',
          lighting: 'lantern-glow',
          ambientColor: new THREE.Color(0xFFE4B5),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'cherry-blossoms'
        },
        artifacts: [
          {
            id: 'flowing-water-guqin',
            name: 'Flowing Water (Guqin piece)',
            type: 'music-notation',
            year: -300,
            description: 'Classical guqin composition embodying Taoist philosophy',
            culturalSignificance: 'Represents harmony between humanity and nature',
            position: new THREE.Vector3(15, 5, 0)
          }
        ],
        knowledgeTopics: [
          'Confucianism and Taoism',
          'Chinese Calligraphy',
          'Traditional Chinese Medicine',
          'Silk Road Trade',
          'Invention of Paper and Printing',
          'Great Wall of China'
        ],
        culturalAchievements: [
          'Invention of paper',
          'Development of gunpowder',
          'Creation of the compass',
          'Silk production techniques',
          'Construction of the Great Wall',
          'Confucian philosophy'
        ],
        magicAbilities: ['qi-channeling', 'elemental-balance', 'calligraphy-manifestation']
      },
      
      {
        id: 'ancient-india',
        name: 'Ancient India',
        civilization: 'Vedic/Classical',
        region: 'South Asia',
        period: { start: -1500, end: 1200 },
        musicalStyle: {
          instruments: ['veena', 'tabla', 'sitar', 'bansuri', 'sarangi', 'tanpura'],
          scales: ['ragas', 'vedic-chants'],
          rhythmPatterns: [7, 9, 11, 13, 16],
          tempo: { min: 40, max: 180 },
          characteristics: ['spiritual', 'complex-rhythms', 'improvisational', 'devotional'],
          audioSamples: ['veena-raga', 'tabla-patterns', 'vedic-chanting']
        },
        emotions: {
          primary: 'enlightenment',
          secondary: ['devotion', 'spiritual-bliss', 'cosmic-unity', 'transcendence'],
          intensity: 0.9,
          valence: 0.8,
          arousal: 0.5
        },
        visualTheme: {
          colors: ['saffron', 'turmeric-yellow', 'henna-red', 'peacock-blue', 'sandalwood'],
          colorValues: [
            new THREE.Color(0xFF9933),
            new THREE.Color(0xFFC800),
            new THREE.Color(0xE25822),
            new THREE.Color(0x33A1C9),
            new THREE.Color(0xF4C2C2)
          ],
          architecture: 'temples',
          patterns: 'mandalas',
          lighting: 'incense-haze',
          ambientColor: new THREE.Color(0xFFDAB9),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'lotus-petals'
        },
        artifacts: [],
        knowledgeTopics: [
          'Vedas and Sanskrit',
          'Yoga and Meditation',
          'Mathematics (Zero concept)',
          'Ayurveda Medicine',
          'Buddhist and Hindu Philosophy'
        ],
        culturalAchievements: [
          'Concept of zero in mathematics',
          'Development of yoga',
          'Sanskrit literature (Vedas, Upanishads)',
          'Ayurvedic medical system',
          'Buddhist and Hindu philosophy',
          'Decimal number system'
        ],
        magicAbilities: ['chakra-awakening', 'raga-manifestation', 'mantra-power']
      },
      
      {
        id: 'medieval-europe',
        name: 'Medieval Europe',
        civilization: 'European',
        region: 'Europe',
        period: { start: 500, end: 1400 },
        musicalStyle: {
          instruments: ['organ', 'vielle', 'harp', 'lute', 'recorder', 'psaltery', 'hurdy-gurdy'],
          scales: ['gregorian-modes', 'church-modes'],
          rhythmPatterns: [3, 6, 9, 12],
          tempo: { min: 50, max: 90 },
          characteristics: ['sacred', 'polyphonic', 'modal', 'liturgical'],
          audioSamples: ['gregorian-chant', 'cathedral-organ', 'troubadour-lute']
        },
        emotions: {
          primary: 'devotion',
          secondary: ['mysticism', 'solemnity', 'spiritual-ecstasy', 'reverence'],
          intensity: 0.8,
          valence: 0.5,
          arousal: 0.4
        },
        visualTheme: {
          colors: ['stone-grey', 'stained-glass-colors', 'gold-leaf', 'deep-blue', 'crimson'],
          colorValues: [
            new THREE.Color(0x808080),
            new THREE.Color(0x9966CC),
            new THREE.Color(0xFFD700),
            new THREE.Color(0x00008B),
            new THREE.Color(0xDC143C)
          ],
          architecture: 'gothic-cathedrals',
          patterns: 'illuminated-manuscripts',
          lighting: 'candlelight',
          ambientColor: new THREE.Color(0x696969),
          skyColor: new THREE.Color(0x708090),
          particleStyle: 'cathedral-light-rays'
        },
        artifacts: [],
        knowledgeTopics: [
          'Feudalism',
          'Gothic Architecture',
          'Chivalry and Knights',
          'Monastic Life',
          'Illuminated Manuscripts'
        ],
        culturalAchievements: [
          'Gothic cathedral construction',
          'Development of polyphonic music',
          'Universities founded',
          'Illuminated manuscript art',
          'Chivalric code and literature'
        ],
        magicAbilities: ['divine-light', 'polyphonic-harmony', 'manuscript-enchantment']
      },
      
      {
        id: 'renaissance',
        name: 'Renaissance',
        civilization: 'European',
        region: 'Europe',
        period: { start: 1400, end: 1600 },
        musicalStyle: {
          instruments: ['lute', 'viol', 'harpsichord', 'recorder', 'cornetto', 'sackbut'],
          scales: ['major', 'minor', 'modal'],
          rhythmPatterns: [2, 3, 4, 6],
          tempo: { min: 60, max: 120 },
          characteristics: ['humanistic', 'polyphonic', 'expressive', 'balanced'],
          audioSamples: ['lute-madrigal', 'harpsichord-dance', 'vocal-polyphony']
        },
        emotions: {
          primary: 'enlightenment',
          secondary: ['intellectual-curiosity', 'artistic-passion', 'human-dignity', 'innovation'],
          intensity: 0.7,
          valence: 0.8,
          arousal: 0.6
        },
        visualTheme: {
          colors: ['renaissance-gold', 'venetian-red', 'ultramarine', 'emerald', 'ivory'],
          colorValues: [
            new THREE.Color(0xFFD700),
            new THREE.Color(0xC04000),
            new THREE.Color(0x120A8F),
            new THREE.Color(0x50C878),
            new THREE.Color(0xFFFFF0)
          ],
          architecture: 'domes',
          patterns: 'geometric-perspective',
          lighting: 'natural-realism',
          ambientColor: new THREE.Color(0xFFE4B5),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'golden-ratio-spirals'
        },
        artifacts: [],
        knowledgeTopics: [
          'Humanism',
          'Scientific Method',
          'Perspective in Art',
          'Classical Revival',
          'Printing Press Revolution'
        ],
        culturalAchievements: [
          'Artistic masterpieces (da Vinci, Michelangelo)',
          'Scientific revolution beginnings',
          'Printing press invention',
          'Humanism philosophy',
          'Architectural innovations',
          'Musical notation advances'
        ],
        magicAbilities: ['golden-ratio', 'perspective-mastery', 'humanist-brilliance']
      },
      
      {
        id: 'baroque',
        name: 'Baroque Era',
        civilization: 'European',
        region: 'Europe',
        period: { start: 1600, end: 1750 },
        musicalStyle: {
          instruments: ['violin', 'harpsichord', 'organ', 'oboe', 'bassoon', 'trumpet'],
          scales: ['major', 'minor', 'baroque-ornamentation'],
          rhythmPatterns: [3, 4, 6, 12],
          tempo: { min: 60, max: 144 },
          characteristics: ['ornate', 'dramatic', 'contrapuntal', 'emotional'],
          audioSamples: ['bach-fugue', 'vivaldi-concerto', 'handel-chorus']
        },
        emotions: {
          primary: 'grandeur',
          secondary: ['emotional-depth', 'dramatic-tension', 'divine-glory', 'ornate-beauty'],
          intensity: 0.85,
          valence: 0.7,
          arousal: 0.7
        },
        visualTheme: {
          colors: ['royal-purple', 'gold', 'deep-red', 'cream', 'dark-brown'],
          colorValues: [
            new THREE.Color(0x7851A9),
            new THREE.Color(0xFFD700),
            new THREE.Color(0x8B0000),
            new THREE.Color(0xFFFDD0),
            new THREE.Color(0x654321)
          ],
          architecture: 'ornate-palaces',
          patterns: 'rococo-flourishes',
          lighting: 'dramatic-chiaroscuro',
          ambientColor: new THREE.Color(0xFFE4B5),
          skyColor: new THREE.Color(0x191970),
          particleStyle: 'ornamental-scrollwork'
        },
        artifacts: [],
        knowledgeTopics: [
          'Counterpoint and Fugue',
          'Scientific Revolution',
          'Absolutism',
          'Baroque Art and Architecture',
          'Opera Development'
        ],
        culturalAchievements: [
          'J.S. Bach and Baroque music mastery',
          'Opera as art form',
          'Scientific advances (Newton)',
          'Ornate architecture and art',
          'Development of the orchestra'
        ],
        magicAbilities: ['contrapuntal-weaving', 'dramatic-crescendo', 'ornate-flourish']
      },
      
      {
        id: 'classical',
        name: 'Classical Era',
        civilization: 'European',
        region: 'Europe',
        period: { start: 1750, end: 1820 },
        musicalStyle: {
          instruments: ['piano', 'violin', 'clarinet', 'flute', 'horn', 'cello'],
          scales: ['major', 'minor', 'chromatic'],
          rhythmPatterns: [2, 3, 4, 6],
          tempo: { min: 60, max: 132 },
          characteristics: ['balanced', 'clear', 'elegant', 'structured'],
          audioSamples: ['mozart-symphony', 'haydn-quartet', 'beethoven-sonata']
        },
        emotions: {
          primary: 'elegance',
          secondary: ['intellectual-clarity', 'refined-emotion', 'balanced-expression', 'formal-beauty'],
          intensity: 0.7,
          valence: 0.75,
          arousal: 0.5
        },
        visualTheme: {
          colors: ['powder-blue', 'cream', 'gold', 'rose', 'sage-green'],
          colorValues: [
            new THREE.Color(0xB0E0E6),
            new THREE.Color(0xFFFDD0),
            new THREE.Color(0xFFD700),
            new THREE.Color(0xFFE4E1),
            new THREE.Color(0xBCB88A)
          ],
          architecture: 'neoclassical',
          patterns: 'symmetrical-forms',
          lighting: 'enlightenment-clarity',
          ambientColor: new THREE.Color(0xF5F5DC),
          skyColor: new THREE.Color(0x87CEEB),
          particleStyle: 'crystalline-structures'
        },
        artifacts: [],
        knowledgeTopics: [
          'Sonata Form',
          'Enlightenment Philosophy',
          'Symphony Development',
          'Classical Architecture',
          'Age of Reason'
        ],
        culturalAchievements: [
          'Mozart and Haydn symphonies',
          'Beethoven early works',
          'Sonata form perfection',
          'Enlightenment philosophy',
          'Neoclassical architecture'
        ],
        magicAbilities: ['sonata-structure', 'enlightened-clarity', 'symphonic-balance']
      },
      
      {
        id: 'romantic',
        name: 'Romantic Era',
        civilization: 'European/American',
        region: 'Global',
        period: { start: 1820, end: 1900 },
        musicalStyle: {
          instruments: ['piano', 'full-orchestra', 'saxophone', 'tuba', 'harp'],
          scales: ['all-scales', 'whole-tone', 'chromatic'],
          rhythmPatterns: [3, 4, 5, 6, 7, 9],
          tempo: { min: 40, max: 208 },
          characteristics: ['emotional', 'expressive', 'programmatic', 'virtuosic'],
          audioSamples: ['chopin-nocturne', 'wagner-opera', 'tchaikovsky-symphony']
        },
        emotions: {
          primary: 'passion',
          secondary: ['intense-emotion', 'nature-worship', 'individual-expression', 'sublime-awe'],
          intensity: 0.95,
          valence: 0.6,
          arousal: 0.85
        },
        visualTheme: {
          colors: ['deep-purple', 'crimson', 'forest-green', 'midnight-blue', 'gold'],
          colorValues: [
            new THREE.Color(0x4B0082),
            new THREE.Color(0xDC143C),
            new THREE.Color(0x228B22),
            new THREE.Color(0x191970),
            new THREE.Color(0xFFD700)
          ],
          architecture: 'gothic-revival',
          patterns: 'nature-motifs',
          lighting: 'moonlight-drama',
          ambientColor: new THREE.Color(0x2F4F4F),
          skyColor: new THREE.Color(0x191970),
          particleStyle: 'swirling-emotions'
        },
        artifacts: [],
        knowledgeTopics: [
          'Nationalism in Music',
          'Program Music',
          'Virtuoso Performance',
          'Romantic Poetry and Literature',
          'Industrial Revolution'
        ],
        culturalAchievements: [
          'Beethoven late period',
          'Wagner opera reforms',
          'Chopin piano works',
          'Symphonic poem development',
          'Romantic poetry and literature'
        ],
        magicAbilities: ['emotional-surge', 'nature-communion', 'virtuosic-transcendence']
      },
      
      {
        id: 'modern-20th',
        name: '20th Century Modern',
        civilization: 'Global',
        region: 'Worldwide',
        period: { start: 1900, end: 2000 },
        musicalStyle: {
          instruments: ['electric-guitar', 'synthesizer', 'drum-kit', 'saxophone', 'electronic'],
          scales: ['twelve-tone', 'modal', 'blues', 'all-scales'],
          rhythmPatterns: [4, 5, 7, 11, 13],
          tempo: { min: 40, max: 220 },
          characteristics: ['experimental', 'diverse', 'electronic', 'global-fusion'],
          audioSamples: ['jazz-improvisation', 'electronic-synthesis', 'rock-energy']
        },
        emotions: {
          primary: 'innovation',
          secondary: ['rebellion', 'experimentation', 'cultural-fusion', 'technological-wonder'],
          intensity: 0.8,
          valence: 0.6,
          arousal: 0.8
        },
        visualTheme: {
          colors: ['electric-blue', 'neon-pink', 'chrome', 'black', 'white'],
          colorValues: [
            new THREE.Color(0x7DF9FF),
            new THREE.Color(0xFF10F0),
            new THREE.Color(0xE5E4E2),
            new THREE.Color(0x000000),
            new THREE.Color(0xFFFFFF)
          ],
          architecture: 'modernist',
          patterns: 'abstract-expressionism',
          lighting: 'neon-glow',
          ambientColor: new THREE.Color(0x1C1C1C),
          skyColor: new THREE.Color(0x000033),
          particleStyle: 'digital-bits'
        },
        artifacts: [],
        knowledgeTopics: [
          'Jazz and Blues',
          'Electronic Music',
          'Rock and Pop',
          'World Music Fusion',
          'Digital Recording'
        ],
        culturalAchievements: [
          'Jazz revolution',
          'Electronic music synthesis',
          'Rock and roll birth',
          'Hip hop creation',
          'World music fusion',
          'Digital recording technology'
        ],
        magicAbilities: ['electric-surge', 'digital-synthesis', 'cultural-fusion']
      },
      
      {
        id: 'contemporary-2000s',
        name: 'Contemporary Era',
        civilization: 'Global Digital',
        region: 'Worldwide Connected',
        period: { start: 2000, end: 2025 },
        musicalStyle: {
          instruments: ['digital-audio-workstation', 'AI-synthesis', 'virtual-instruments', 'smartphone'],
          scales: ['all-possible-scales', 'microtonal', 'algorithmic'],
          rhythmPatterns: [4, 8, 16, 32],
          tempo: { min: 20, max: 300 },
          characteristics: ['algorithmic', 'globalized', 'instant', 'collaborative'],
          audioSamples: ['edm-drop', 'lo-fi-beats', 'ai-composition']
        },
        emotions: {
          primary: 'connection',
          secondary: ['digital-intimacy', 'global-unity', 'instant-gratification', 'creative-freedom'],
          intensity: 0.75,
          valence: 0.7,
          arousal: 0.75
        },
        visualTheme: {
          colors: ['cyber-blue', 'holographic', 'rgb-spectrum', 'dark-mode', 'gradient'],
          colorValues: [
            new THREE.Color(0x00FFFF),
            new THREE.Color(0xE0BBE4),
            new THREE.Color(0xFF00FF),
            new THREE.Color(0x0D0D0D),
            new THREE.Color(0x667eea)
          ],
          architecture: 'digital-spaces',
          patterns: 'generative-art',
          lighting: 'screen-glow',
          ambientColor: new THREE.Color(0x1a1a2e),
          skyColor: new THREE.Color(0x0f3460),
          particleStyle: 'data-streams'
        },
        artifacts: [],
        knowledgeTopics: [
          'AI and Machine Learning',
          'Streaming Culture',
          'Social Media',
          'Virtual Reality',
          'Blockchain and NFTs'
        ],
        culturalAchievements: [
          'AI music generation',
          'Global streaming platforms',
          'Social media revolution',
          'VR/AR experiences',
          'Bedroom producer era',
          'Genre-blending normalization'
        ],
        magicAbilities: ['ai-synthesis', 'viral-spread', 'blockchain-permanence']
      },
      
      {
        id: 'future-2050',
        name: 'Future Vision 2050',
        civilization: 'Post-Digital Humanity',
        region: 'Earth and Beyond',
        period: { start: 2025, end: 2100 },
        musicalStyle: {
          instruments: ['neural-interface', 'quantum-synthesizer', 'thought-instruments', 'bio-acoustic'],
          scales: ['multidimensional', 'quantum-harmonics', 'synesthetic'],
          rhythmPatterns: [1, 2, 3, 5, 8, 13, 21],
          tempo: { min: 1, max: 1000 },
          characteristics: ['neural', 'holographic', 'telepathic', 'multisensory'],
          audioSamples: ['neural-symphony', 'quantum-meditation', 'thought-melody']
        },
        emotions: {
          primary: 'transcendence',
          secondary: ['cosmic-consciousness', 'digital-enlightenment', 'unified-awareness', 'creative-infinity'],
          intensity: 1.0,
          valence: 0.9,
          arousal: 0.5
        },
        visualTheme: {
          colors: ['quantum-shimmer', 'neural-purple', 'bio-luminescent', 'void-black', 'pure-light'],
          colorValues: [
            new THREE.Color(0xE0FFFF),
            new THREE.Color(0x9370DB),
            new THREE.Color(0x7FFF00),
            new THREE.Color(0x000000),
            new THREE.Color(0xFFFFFF)
          ],
          architecture: 'morphing-structures',
          patterns: 'living-geometry',
          lighting: 'bio-luminescence',
          ambientColor: new THREE.Color(0x0a0e27),
          skyColor: new THREE.Color(0x1a1a40),
          particleStyle: 'quantum-particles'
        },
        artifacts: [],
        knowledgeTopics: [
          'Neural Music Interfaces',
          'Quantum Computing',
          'Consciousness Studies',
          'Interplanetary Culture',
          'Bio-Digital Integration'
        ],
        culturalAchievements: [
          'Direct brain-to-music interfaces',
          'Quantum harmonic synthesis',
          'Interplanetary collaboration',
          'Emotion-to-sound translation',
          'Universal creative language',
          'Consciousness-based art'
        ],
        magicAbilities: ['neural-link', 'quantum-entanglement', 'thought-manifestation']
      }
    ];
  }
  
  private initializeTimelineEvents(): void {
    // Major musical and cultural milestones throughout history
    this.timelineEvents = [
      {
        year: -1400,
        title: 'Hymn to Nikkal Composed',
        description: 'Oldest known complete musical notation',
        type: 'musical',
        importance: 10,
        relatedArtifacts: ['hymn-to-nikkal']
      },
      {
        year: -500,
        title: 'Pythagoras Discovers Musical Ratios',
        description: 'Mathematical foundation of Western music theory',
        type: 'musical',
        importance: 10,
        relatedArtifacts: ['pythagoras-theory']
      },
      // Add hundreds more events...
    ];
  }
  
  public setYear(year: number): void {
    this.currentYear = year;
    this.currentEra = this.getCurrentEra(year);
  }
  
  public getCurrentEra(year: number): HistoricalEra {
    const era = this.eras.find(e => year >= e.period.start && year <= e.period.end);
    return era || this.eras[0];
  }
  
  public getAllEras(): HistoricalEra[] {
    return this.eras;
  }
  
  public getEraById(id: string): HistoricalEra | undefined {
    return this.eras.find(e => e.id === id);
  }
  
  public getTimelineEvents(startYear: number, endYear: number): TimelineEvent[] {
    return this.timelineEvents.filter(e => e.year >= startYear && e.year <= endYear);
  }
  
  public getYear(): number {
    return this.currentYear;
  }
  
  public getCurrentEraDirect(): HistoricalEra | null {
    return this.currentEra;
  }
}
