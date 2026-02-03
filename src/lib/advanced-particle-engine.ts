/**
 * Advanced Particle Engine for Emotion-Reactive Visualization
 * Handles millions of particles with GPU acceleration and audio reactivity
 */

import * as THREE from 'three';

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'peace' | 'excitement' | 'calm';

export interface EmotionParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  audioReactivity: number;
  emotionWeight: EmotionType;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
}

export interface AudioFrequencyData {
  bass: number;        // 0-100 Hz
  lowMid: number;      // 100-500 Hz
  mid: number;         // 500-2000 Hz
  highMid: number;     // 2000-6000 Hz
  treble: number;      // 6000-20000 Hz
  overall: number;     // Overall amplitude
}

export interface ParticleEngineConfig {
  maxParticles: number;
  emissionRate: number;
  particleLifetime: number;
  useGPUAcceleration: boolean;
  emotionBlendSpeed: number;
}

export class AdvancedParticleEngine {
  private particles: EmotionParticle[] = [];
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.ShaderMaterial;
  private particleSystem: THREE.Points;
  private config: ParticleEngineConfig;
  private currentEmotion: EmotionType = 'calm';
  private emotionColorMap: Map<EmotionType, THREE.Color>;
  private audioData: AudioFrequencyData = {
    bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, overall: 0
  };

  constructor(config: Partial<ParticleEngineConfig> = {}) {
    this.config = {
      maxParticles: config.maxParticles || 100000,
      emissionRate: config.emissionRate || 1000,
      particleLifetime: config.particleLifetime || 5,
      useGPUAcceleration: config.useGPUAcceleration !== false,
      emotionBlendSpeed: config.emotionBlendSpeed || 0.5,
    };

    // Initialize emotion color mapping
    this.emotionColorMap = new Map([
      ['joy', new THREE.Color(0xFFD700)],        // Gold
      ['sadness', new THREE.Color(0x4169E1)],    // Royal Blue
      ['anger', new THREE.Color(0xFF4500)],      // Orange Red
      ['fear', new THREE.Color(0x9370DB)],       // Medium Purple
      ['love', new THREE.Color(0xFF69B4)],       // Hot Pink
      ['peace', new THREE.Color(0x98FB98)],      // Pale Green
      ['excitement', new THREE.Color(0xFF6347)], // Tomato
      ['calm', new THREE.Color(0x87CEEB)],       // Sky Blue
    ]);

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleMaterial = this.createParticleMaterial();
    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    
    this.initializeParticles();
  }

  private createParticleMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bassIntensity: { value: 0 },
        trebleIntensity: { value: 0 },
        pointTexture: { 
          value: this.createParticleTexture() 
        },
        audioReactivity: { value: 1.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float bassIntensity;
        uniform float trebleIntensity;
        
        attribute float size;
        attribute vec3 customColor;
        attribute float audioReact;
        attribute float life;
        
        varying vec3 vColor;
        varying float vLife;
        
        void main() {
          vColor = customColor;
          vLife = life;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Size variation based on audio
          float audioSize = size * (1.0 + bassIntensity * audioReact * 0.5);
          
          // Depth-based size attenuation
          gl_PointSize = audioSize * (300.0 / -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        uniform float trebleIntensity;
        
        varying vec3 vColor;
        varying float vLife;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edges
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vLife; // Fade based on particle life
          
          // Glow effect based on treble
          float glow = 1.0 + trebleIntensity * 0.3;
          vec3 finalColor = vColor * glow;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });
  }

  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private initializeParticles(): void {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const audioReactivities: number[] = [];
    const lives: number[] = [];

    for (let i = 0; i < this.config.maxParticles; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      
      positions.push(particle.position.x, particle.position.y, particle.position.z);
      colors.push(particle.color.r, particle.color.g, particle.color.b);
      sizes.push(particle.size);
      audioReactivities.push(particle.audioReactivity);
      lives.push(particle.life / particle.maxLife);
    }

    this.particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    this.particleGeometry.setAttribute('audioReact', new THREE.Float32BufferAttribute(audioReactivities, 1));
    this.particleGeometry.setAttribute('life', new THREE.Float32BufferAttribute(lives, 1));
  }

  private createParticle(): EmotionParticle {
    const emotionColor = this.emotionColorMap.get(this.currentEmotion) || new THREE.Color(0xFFFFFF);
    
    // Create particles in a spherical volume
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = Math.random() * 50;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return {
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ),
      acceleration: new THREE.Vector3(0, 0, 0),
      color: emotionColor.clone(),
      size: Math.random() * 3 + 1,
      life: this.config.particleLifetime,
      maxLife: this.config.particleLifetime,
      audioReactivity: Math.random(),
      emotionWeight: this.currentEmotion,
      orbitRadius: radius,
      orbitSpeed: Math.random() * 0.2 + 0.1,
      orbitPhase: Math.random() * Math.PI * 2,
    };
  }

  public updateAudioData(frequencyData: Uint8Array, sampleRate: number): void {
    // Map frequency bins to our frequency ranges
    const nyquist = sampleRate / 2;
    const binFreq = nyquist / frequencyData.length;
    
    const bassEnd = Math.floor(100 / binFreq);
    const lowMidEnd = Math.floor(500 / binFreq);
    const midEnd = Math.floor(2000 / binFreq);
    const highMidEnd = Math.floor(6000 / binFreq);
    
    this.audioData.bass = this.getAverageFrequency(frequencyData, 0, bassEnd);
    this.audioData.lowMid = this.getAverageFrequency(frequencyData, bassEnd, lowMidEnd);
    this.audioData.mid = this.getAverageFrequency(frequencyData, lowMidEnd, midEnd);
    this.audioData.highMid = this.getAverageFrequency(frequencyData, midEnd, highMidEnd);
    this.audioData.treble = this.getAverageFrequency(frequencyData, highMidEnd, frequencyData.length);
    
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    this.audioData.overall = sum / frequencyData.length / 255;
    
    // Update shader uniforms
    this.particleMaterial.uniforms.bassIntensity.value = this.audioData.bass;
    this.particleMaterial.uniforms.trebleIntensity.value = this.audioData.treble;
  }

  private getAverageFrequency(data: Uint8Array, startIndex: number, endIndex: number): number {
    let sum = 0;
    const count = endIndex - startIndex;
    for (let i = startIndex; i < endIndex; i++) {
      sum += data[i];
    }
    return (sum / count) / 255; // Normalize to 0-1
  }

  public setEmotion(emotion: EmotionType): void {
    this.currentEmotion = emotion;
  }

  public update(deltaTime: number): void {
    const positions = this.particleGeometry.attributes.position.array as Float32Array;
    const colors = this.particleGeometry.attributes.customColor.array as Float32Array;
    const lives = this.particleGeometry.attributes.life.array as Float32Array;
    const sizes = this.particleGeometry.attributes.size.array as Float32Array;

    const targetColor = this.emotionColorMap.get(this.currentEmotion) || new THREE.Color(0xFFFFFF);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update life
      p.life -= deltaTime;
      lives[i] = Math.max(0, p.life / p.maxLife);
      
      // Respawn dead particles
      if (p.life <= 0) {
        const newParticle = this.createParticle();
        this.particles[i] = newParticle;
        p.position.copy(newParticle.position);
        p.velocity.copy(newParticle.velocity);
        p.life = newParticle.life;
        p.color.copy(newParticle.color);
        p.size = newParticle.size;
        continue;
      }
      
      // Audio-reactive movement
      const audioInfluence = this.audioData.bass * p.audioReactivity;
      
      // Orbital motion around origin
      p.orbitPhase += p.orbitSpeed * deltaTime * (1 + audioInfluence);
      const orbitX = Math.cos(p.orbitPhase) * p.orbitRadius;
      const orbitZ = Math.sin(p.orbitPhase) * p.orbitRadius;
      
      // Combine orbital and velocity-based movement
      p.velocity.multiplyScalar(0.99); // Damping
      p.velocity.add(p.acceleration);
      
      // Apply audio influence to velocity
      if (this.audioData.mid > 0.5) {
        const pushDirection = p.position.clone().normalize();
        p.velocity.add(pushDirection.multiplyScalar(this.audioData.mid * 0.1));
      }
      
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
      
      // Blend orbital motion
      p.position.x = p.position.x * 0.7 + orbitX * 0.3;
      p.position.z = p.position.z * 0.7 + orbitZ * 0.3;
      
      // Vertical wave motion based on treble
      p.position.y += Math.sin(p.orbitPhase * 3) * this.audioData.treble * 0.5;
      
      // Update color towards target emotion color
      p.color.lerp(targetColor, this.config.emotionBlendSpeed * deltaTime);
      
      // Update size based on audio
      const sizeMultiplier = 1 + this.audioData.highMid * p.audioReactivity * 0.5;
      sizes[i] = p.size * sizeMultiplier;
      
      // Write to buffer attributes
      const i3 = i * 3;
      positions[i3] = p.position.x;
      positions[i3 + 1] = p.position.y;
      positions[i3 + 2] = p.position.z;
      
      colors[i3] = p.color.r;
      colors[i3 + 1] = p.color.g;
      colors[i3 + 2] = p.color.b;
    }
    
    // Mark attributes as needing update
    this.particleGeometry.attributes.position.needsUpdate = true;
    this.particleGeometry.attributes.customColor.needsUpdate = true;
    this.particleGeometry.attributes.life.needsUpdate = true;
    this.particleGeometry.attributes.size.needsUpdate = true;
    
    // Update time uniform for shaders
    this.particleMaterial.uniforms.time.value += deltaTime;
  }

  public getParticleSystem(): THREE.Points {
    return this.particleSystem;
  }

  public dispose(): void {
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    if (this.particleMaterial.uniforms.pointTexture.value) {
      this.particleMaterial.uniforms.pointTexture.value.dispose();
    }
  }
}
