/**
 * Real-time cosmic data manager for astronomical events, planetary positions,
 * and space weather data integration with music visualization
 */

import { EventEmitter } from 'events';

export interface PlanetaryData {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  scale: number;
  color: string;
  rings?: boolean;
  moons?: MoonData[];
}

export interface MoonData {
  name: string;
  distance: number;
  angle: number;
  size: number;
}

export interface AstronomicalEvent {
  type: 'eclipse' | 'transit' | 'conjunction' | 'meteor_shower' | 'aurora';
  intensity: number;
  duration: number;
  timestamp: number;
  description: string;
}

export interface CosmicWeather {
  solarWindSpeed: number;
  magneticFieldStrength: number;
  auroralActivity: number;
  cosmicRadiation: number;
}

export interface NebulaData {
  type: 'emission' | 'reflection' | 'dark' | 'planetary';
  position: { x: number; y: number; z: number };
  size: number;
  density: number;
  color: string;
  particleCount: number;
}

export class CosmicDataManager extends EventEmitter {
  private updateInterval: number = 30000; // 30 seconds
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor() {
    super();
    this.setMaxListeners(50);
  }

  async start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.emit('status', { active: true, message: 'Cosmic data streams online' });
    
    // Initial data fetch
    await this.fetchAllData();
    
    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.fetchAllData().catch(error => {
        this.emit('error', { source: 'periodic_update', error });
      });
    }, this.updateInterval);
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emit('status', { active: false, message: 'Cosmic data streams offline' });
  }

  private async fetchAllData() {
    try {
      const [planetaryData, events, weather, nebulae] = await Promise.all([
        this.calculatePlanetaryPositions(),
        this.getAstronomicalEvents(),
        this.getCosmicWeather(),
        this.generateDynamicNebulae()
      ]);

      this.emit('planetary_update', planetaryData);
      this.emit('events_update', events);
      this.emit('weather_update', weather);
      this.emit('nebula_update', nebulae);
    } catch (error) {
      this.emit('error', { source: 'data_fetch', error });
    }
  }

  private async calculatePlanetaryPositions(): Promise<PlanetaryData[]> {
    const currentTime = Date.now();
    const timeInYears = (currentTime - Date.UTC(2000, 0, 1)) / (1000 * 60 * 60 * 24 * 365.25);
    
    return [
      {
        name: 'Mercury',
        position: this.calculateOrbitalPosition(0.39, 87.97, timeInYears * 4.15),
        rotation: (timeInYears * 4.15 * 360) % 360,
        scale: 0.038,
        color: '#8C7853'
      },
      {
        name: 'Venus',
        position: this.calculateOrbitalPosition(0.72, 224.7, timeInYears * 1.62),
        rotation: (timeInYears * 1.62 * 360) % 360,
        scale: 0.095,
        color: '#FFC649'
      },
      {
        name: 'Earth',
        position: this.calculateOrbitalPosition(1.0, 365.25, timeInYears),
        rotation: (timeInYears * 360) % 360,
        scale: 0.1,
        color: '#6B93D6',
        moons: [{
          name: 'Moon',
          distance: 0.15,
          angle: (timeInYears * 13.4 * 360) % 360,
          size: 0.027
        }]
      },
      {
        name: 'Mars',
        position: this.calculateOrbitalPosition(1.52, 686.98, timeInYears * 0.53),
        rotation: (timeInYears * 0.53 * 360) % 360,
        scale: 0.053,
        color: '#CD5C5C'
      },
      {
        name: 'Jupiter',
        position: this.calculateOrbitalPosition(5.2, 4332.6, timeInYears * 0.084),
        rotation: (timeInYears * 0.084 * 360) % 360,
        scale: 1.0,
        color: '#D8CA9D',
        moons: [
          { name: 'Io', distance: 0.3, angle: (timeInYears * 100 * 360) % 360, size: 0.036 },
          { name: 'Europa', distance: 0.4, angle: (timeInYears * 70 * 360) % 360, size: 0.031 },
          { name: 'Ganymede', distance: 0.5, angle: (timeInYears * 50 * 360) % 360, size: 0.052 },
          { name: 'Callisto', distance: 0.6, angle: (timeInYears * 30 * 360) % 360, size: 0.048 }
        ]
      },
      {
        name: 'Saturn',
        position: this.calculateOrbitalPosition(9.5, 10759.2, timeInYears * 0.034),
        rotation: (timeInYears * 0.034 * 360) % 360,
        scale: 0.84,
        color: '#FAD5A5',
        rings: true,
        moons: [
          { name: 'Titan', distance: 0.8, angle: (timeInYears * 23 * 360) % 360, size: 0.051 }
        ]
      },
      {
        name: 'Uranus',
        position: this.calculateOrbitalPosition(19.2, 30687.2, timeInYears * 0.012),
        rotation: (timeInYears * 0.012 * 360) % 360,
        scale: 0.4,
        color: '#4FD0E7',
        rings: true
      },
      {
        name: 'Neptune',
        position: this.calculateOrbitalPosition(30.1, 60190.0, timeInYears * 0.006),
        rotation: (timeInYears * 0.006 * 360) % 360,
        scale: 0.39,
        color: '#4B70DD'
      }
    ];
  }

  private calculateOrbitalPosition(distance: number, period: number, time: number) {
    const angle = (time * 2 * Math.PI) / period;
    return {
      x: Math.cos(angle) * distance,
      y: 0,
      z: Math.sin(angle) * distance
    };
  }

  private async getAstronomicalEvents(): Promise<AstronomicalEvent[]> {
    // Simulate real astronomical events
    const currentTime = Date.now();
    const events: AstronomicalEvent[] = [];
    
    // Generate aurora activity based on time and solar cycle
    const auroraIntensity = Math.sin(currentTime / 1000000) * 0.5 + 0.5;
    if (auroraIntensity > 0.3) {
      events.push({
        type: 'aurora',
        intensity: auroraIntensity,
        duration: 3600000, // 1 hour
        timestamp: currentTime,
        description: 'Aurora Borealis activity detected'
      });
    }

    // Simulate meteor shower events
    const meteorActivity = Math.random();
    if (meteorActivity > 0.7) {
      events.push({
        type: 'meteor_shower',
        intensity: meteorActivity,
        duration: 7200000, // 2 hours
        timestamp: currentTime,
        description: 'Meteor shower in progress'
      });
    }

    return events;
  }

  private async getCosmicWeather(): Promise<CosmicWeather> {
    // Simulate real-time space weather data
    const baseTime = Date.now() / 100000;
    
    return {
      solarWindSpeed: 400 + Math.sin(baseTime) * 200 + Math.random() * 100,
      magneticFieldStrength: 5 + Math.cos(baseTime * 1.5) * 3 + Math.random() * 2,
      auroralActivity: Math.max(0, Math.sin(baseTime * 0.8) * 0.7 + Math.random() * 0.3),
      cosmicRadiation: 2 + Math.sin(baseTime * 2.1) * 1.5 + Math.random() * 0.5
    };
  }

  private async generateDynamicNebulae(): Promise<NebulaData[]> {
    const nebulae: NebulaData[] = [];
    const nebulaCount = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < nebulaCount; i++) {
      const angle = (i / nebulaCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 20 + Math.random() * 50;
      
      nebulae.push({
        type: ['emission', 'reflection', 'dark', 'planetary'][Math.floor(Math.random() * 4)] as NebulaData['type'],
        position: {
          x: Math.cos(angle) * distance,
          y: (Math.random() - 0.5) * 20,
          z: Math.sin(angle) * distance
        },
        size: 5 + Math.random() * 15,
        density: 0.1 + Math.random() * 0.9,
        color: this.generateNebulaColor(),
        particleCount: 1000 + Math.floor(Math.random() * 4000)
      });
    }
    
    return nebulae;
  }

  private generateNebulaColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Music integration methods
  mapMusicToCosmicEvents(audioData: { bass: number; mid: number; treble: number }) {
    return {
      starIntensity: audioData.bass * 2,
      planetRotationSpeed: audioData.mid * 0.5,
      nebulaMovement: audioData.treble * 1.5,
      auroraIntensity: (audioData.bass + audioData.treble) * 0.8
    };
  }

  getCurrentPlanetaryAlignment(): number {
    // Calculate how aligned planets are (0-1)
    // This can affect visual elements based on cosmic harmony
    const time = Date.now() / 1000000;
    return Math.abs(Math.sin(time)) * Math.abs(Math.cos(time * 1.3));
  }
}

// Global instance
export const cosmicDataManager = new CosmicDataManager();