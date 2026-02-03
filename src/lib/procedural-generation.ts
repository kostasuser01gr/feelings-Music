/**
 * Procedural Galaxy & Soundscape Generation
 * Dynamically generates galaxies, constellations, and audio landscapes
 */

import * as THREE from 'three';
import * as Tone from 'tone';

export interface GalaxyConfig {
  armCount: number;
  armSpread: number;
  starCount: number;
  coreRadius: number;
  diskRadius: number;
  height: number;
  rotationSpeed: number;
  colors: THREE.Color[];
}

export interface SoundscapeLayer {
  id: string;
  type: 'ambient' | 'melody' | 'rhythm' | 'texture';
  synth: Tone.Synth | Tone.NoiseSynth;
  volume: number;
  panning: number;
}

export class ProceduralGalaxyGenerator {
  private scene: THREE.Scene;
  private galaxies: Map<string, THREE.Points> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Generate a procedural galaxy
   */
  public generateGalaxy(id: string, config: Partial<GalaxyConfig> = {}): THREE.Points {
    const fullConfig: GalaxyConfig = {
      armCount: config.armCount || 4,
      armSpread: config.armSpread || 0.3,
      starCount: config.starCount || 50000,
      coreRadius: config.coreRadius || 2,
      diskRadius: config.diskRadius || 30,
      height: config.height || 3,
      rotationSpeed: config.rotationSpeed || 0.5,
      colors: config.colors || [
        new THREE.Color(0x1E90FF), // Blue
        new THREE.Color(0xFFFFFF), // White
        new THREE.Color(0xFFD700), // Gold
        new THREE.Color(0xFF69B4), // Pink
      ],
    };
    
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    
    for (let i = 0; i < fullConfig.starCount; i++) {
      // Determine which arm this star belongs to
      const armIndex = Math.floor(Math.random() * fullConfig.armCount);
      const armAngle = (armIndex / fullConfig.armCount) * Math.PI * 2;
      
      // Distance from center (exponential distribution for realistic galaxy)
      const radius = Math.pow(Math.random(), 2) * fullConfig.diskRadius;
      
      // Spiral angle
      const spiralAngle = radius * 0.3;
      const totalAngle = armAngle + spiralAngle;
      
      // Add random spread
      const spread = (Math.random() - 0.5) * fullConfig.armSpread * radius;
      
      // Calculate position
      const x = Math.cos(totalAngle) * radius + spread;
      const z = Math.sin(totalAngle) * radius + spread;
      
      // Height with gaussian distribution
      const y = (Math.random() - 0.5) * fullConfig.height * Math.exp(-radius / fullConfig.diskRadius);
      
      positions.push(x, y, z);
      
      // Color based on distance from center
      const distanceRatio = radius / fullConfig.diskRadius;
      const colorIndex = Math.min(
        Math.floor(distanceRatio * fullConfig.colors.length),
        fullConfig.colors.length - 1
      );
      const color = fullConfig.colors[colorIndex];
      
      // Add some variation
      const variation = 0.3;
      const r = Math.max(0, Math.min(1, color.r + (Math.random() - 0.5) * variation));
      const g = Math.max(0, Math.min(1, color.g + (Math.random() - 0.5) * variation));
      const b = Math.max(0, Math.min(1, color.b + (Math.random() - 0.5) * variation));
      
      colors.push(r, g, b);
      
      // Size based on distance (closer stars appear larger)
      const size = (1 - distanceRatio) * 3 + 0.5;
      sizes.push(size);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        rotationSpeed: { value: fullConfig.rotationSpeed },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float rotationSpeed;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Twinkle effect
          float twinkle = sin(time * 2.0 + position.x * 0.1) * 0.3 + 0.7;
          
          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });
    
    const galaxy = new THREE.Points(geometry, material);
    galaxy.name = id;
    
    this.galaxies.set(id, galaxy);
    this.scene.add(galaxy);
    
    return galaxy;
  }
  
  /**
   * Generate a constellation pattern
   */
  public generateConstellation(
    id: string,
    starPositions: THREE.Vector3[],
    connections: [number, number][]
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = id;
    
    // Create stars
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.9,
    });
    
    starPositions.forEach((position) => {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.copy(position);
      group.add(star);
    });
    
    // Create connections
    connections.forEach(([startIdx, endIdx]) => {
      const points = [starPositions[startIdx], starPositions[endIdx]];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x4169E1,
        transparent: true,
        opacity: 0.6,
      });
      
      const line = new THREE.Line(geometry, material);
      group.add(line);
    });
    
    this.scene.add(group);
    return group;
  }
  
  /**
   * Update galaxy animation
   */
  public update(deltaTime: number): void {
    for (const galaxy of this.galaxies.values()) {
      if (galaxy.material instanceof THREE.ShaderMaterial) {
        galaxy.material.uniforms.time.value += deltaTime;
        
        // Slowly rotate galaxy
        galaxy.rotation.y += deltaTime * galaxy.material.uniforms.rotationSpeed.value * 0.1;
      }
    }
  }
  
  public dispose(): void {
    for (const galaxy of this.galaxies.values()) {
      galaxy.geometry.dispose();
      (galaxy.material as THREE.Material).dispose();
      this.scene.remove(galaxy);
    }
    this.galaxies.clear();
  }
}

/**
 * Procedural Soundscape Generator
 */
export class ProceduralSoundscapeGenerator {
  private layers: Map<string, SoundscapeLayer> = new Map();
  private masterGain: Tone.Gain;
  
  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
  }
  
  /**
   * Generate ambient soundscape
   */
  public generateAmbientSoundscape(emotion: string): void {
    this.clearLayers();
    
    const emotionConfig = this.getEmotionSoundConfig(emotion);
    
    // Layer 1: Deep ambient pad
    const pad = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 4,
        decay: 2,
        sustain: 0.7,
        release: 8,
      },
    }).connect(this.masterGain);
    
    this.layers.set('ambient-pad', {
      id: 'ambient-pad',
      type: 'ambient',
      synth: pad,
      volume: -12,
      panning: 0,
    });
    
    // Layer 2: Atmospheric texture
    const texture = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.5,
        decay: 1,
        sustain: 0.3,
        release: 2,
      },
    }).connect(this.masterGain);
    
    this.layers.set('texture', {
      id: 'texture',
      type: 'texture',
      synth: texture,
      volume: -18,
      panning: 0,
    });
    
    // Layer 3: Melodic elements
    const melody = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 1.5,
      },
    }).connect(this.masterGain);
    
    this.layers.set('melody', {
      id: 'melody',
      type: 'melody',
      synth: melody,
      volume: -9,
      panning: 0,
    });
    
    // Play soundscape
    this.playSoundscape(emotionConfig);
  }
  
  private getEmotionSoundConfig(emotion: string): any {
    const configs = {
      calm: {
        baseNote: 'C2',
        scale: ['C', 'D', 'E', 'G', 'A'],
        tempo: 40,
        pattern: [0, 2, 4, 2],
      },
      joy: {
        baseNote: 'C3',
        scale: ['C', 'E', 'G', 'B'],
        tempo: 90,
        pattern: [0, 2, 1, 3, 2],
      },
      peace: {
        baseNote: 'F2',
        scale: ['F', 'G', 'A', 'C'],
        tempo: 35,
        pattern: [0, 1, 2, 1],
      },
      excitement: {
        baseNote: 'E3',
        scale: ['E', 'F#', 'G#', 'B'],
        tempo: 120,
        pattern: [0, 1, 2, 3, 2, 1],
      },
    };
    
    return configs[emotion as keyof typeof configs] || configs.calm;
  }
  
  private playSoundscape(config: any): void {
    // Play ambient pad
    const padLayer = this.layers.get('ambient-pad');
    if (padLayer && padLayer.synth instanceof Tone.Synth) {
      const loop = new Tone.Loop((time) => {
        padLayer.synth.triggerAttackRelease(config.baseNote, '4n', time);
      }, '2m').start(0);
    }
    
    // Play texture
    const textureLayer = this.layers.get('texture');
    if (textureLayer && textureLayer.synth instanceof Tone.NoiseSynth) {
      const loop = new Tone.Loop((time) => {
        textureLayer.synth.triggerAttackRelease('8n', time);
      }, '4m').start(0);
    }
    
    // Play melody
    const melodyLayer = this.layers.get('melody');
    if (melodyLayer && melodyLayer.synth instanceof Tone.Synth) {
      let noteIndex = 0;
      const loop = new Tone.Loop((time) => {
        const scaleIndex = config.pattern[noteIndex % config.pattern.length];
        const note = config.scale[scaleIndex] + '4';
        melodyLayer.synth.triggerAttackRelease(note, '4n', time);
        noteIndex++;
      }, '2n').start(0);
    }
    
    // Set tempo
    Tone.getTransport().bpm.value = config.tempo;
    Tone.getTransport().start();
  }
  
  /**
   * Generate spatial soundscape with 3D positions
   */
  public generateSpatialSoundscape(positions: THREE.Vector3[], emotion: string): void {
    // Each position gets a sound source
    positions.forEach((position, index) => {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
      });
      
      const panner = new Tone.Panner3D({
        positionX: position.x,
        positionY: position.y,
        positionZ: position.z,
      });
      
      synth.connect(panner);
      panner.connect(this.masterGain);
      
      this.layers.set(`spatial-${index}`, {
        id: `spatial-${index}`,
        type: 'ambient',
        synth,
        volume: -12,
        panning: 0,
      });
    });
  }
  
  public setLayerVolume(layerId: string, volume: number): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.volume = volume;
      layer.synth.volume.value = volume;
    }
  }
  
  public clearLayers(): void {
    for (const layer of this.layers.values()) {
      layer.synth.dispose();
    }
    this.layers.clear();
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }
  
  public dispose(): void {
    this.clearLayers();
    this.masterGain.dispose();
  }
}

/**
 * Dynamic Visual Theme Generator
 */
export class DynamicThemeGenerator {
  private currentTheme: string = 'default';
  
  /**
   * Generate color palette based on emotion
   */
  public generateEmotionPalette(emotion: string): {
    primary: THREE.Color;
    secondary: THREE.Color;
    accent: THREE.Color;
    background: THREE.Color;
  } {
    const palettes = {
      joy: {
        primary: new THREE.Color(0xFFD700),
        secondary: new THREE.Color(0xFFA500),
        accent: new THREE.Color(0xFF6347),
        background: new THREE.Color(0x1A1A2E),
      },
      calm: {
        primary: new THREE.Color(0x87CEEB),
        secondary: new THREE.Color(0x4169E1),
        accent: new THREE.Color(0x98FB98),
        background: new THREE.Color(0x0F1419),
      },
      love: {
        primary: new THREE.Color(0xFF69B4),
        secondary: new THREE.Color(0xFF1493),
        accent: new THREE.Color(0xFFB6C1),
        background: new THREE.Color(0x2C1E3E),
      },
      energy: {
        primary: new THREE.Color(0xFF4500),
        secondary: new THREE.Color(0xFF6347),
        accent: new THREE.Color(0xFFD700),
        background: new THREE.Color(0x1C0A00),
      },
    };
    
    return palettes[emotion as keyof typeof palettes] || palettes.calm;
  }
  
  /**
   * Generate environment lighting based on time and emotion
   */
  public generateEnvironmentLighting(
    scene: THREE.Scene,
    emotion: string,
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  ): void {
    // Remove existing lights
    scene.children.filter(c => c instanceof THREE.Light).forEach(light => scene.remove(light));
    
    const palette = this.generateEmotionPalette(emotion);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(palette.background, 0.3);
    scene.add(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(palette.primary, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);
    
    // Accent light
    const accentLight = new THREE.PointLight(palette.accent, 0.7, 50);
    accentLight.position.set(-5, 5, -5);
    scene.add(accentLight);
    
    // Time of day modifications
    switch (timeOfDay) {
      case 'dawn':
        mainLight.intensity = 0.6;
        mainLight.color.setHex(0xFFB347);
        break;
      case 'dusk':
        mainLight.intensity = 0.5;
        mainLight.color.setHex(0xFF6B35);
        break;
      case 'night':
        mainLight.intensity = 0.2;
        ambientLight.intensity = 0.5;
        accentLight.intensity = 1.2;
        break;
    }
  }
}
