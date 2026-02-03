/**
 * Audio Reactive Universe - Core orchestration system
 * Manages the entire cosmic visualization with audio integration
 */

import * as THREE from 'three';
import { AdvancedParticleEngine, EmotionType, AudioFrequencyData } from './advanced-particle-engine';
import * as Tone from 'tone';

export interface UniverseConfig {
  enableParticles: boolean;
  enableNebulae: boolean;
  enableGravitationalLensing: boolean;
  enableGodRays: boolean;
  audioSensitivity: number;
  maxStars: number;
}

export interface CosmicObject {
  id: string;
  type: 'star' | 'planet' | 'nebula' | 'blackhole' | 'pulsar';
  position: THREE.Vector3;
  mass: number;
  emotion: EmotionType;
  audioReactivity: number;
}

export class AudioReactiveUniverse {
  private scene: THREE.Scene;
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array;
  private particleEngine: AdvancedParticleEngine;
  private config: UniverseConfig;
  private cosmicObjects: CosmicObject[] = [];
  private nebulae: THREE.Group[] = [];
  private currentEmotion: EmotionType = 'calm';
  private emotionTransitionSpeed: number = 0.1;
  private audioContext: AudioContext | null = null;
  
  // Audio frequency ranges
  private bassFrequency: number = 0;
  private midFrequency: number = 0;
  private trebleFrequency: number = 0;
  private overallAmplitude: number = 0;

  // Visual effects
  private godRays: THREE.Mesh | null = null;
  private gravitationalLensEffect: THREE.ShaderMaterial | null = null;

  constructor(scene: THREE.Scene, config: Partial<UniverseConfig> = {}) {
    this.scene = scene;
    this.config = {
      enableParticles: config.enableParticles !== false,
      enableNebulae: config.enableNebulae !== false,
      enableGravitationalLensing: config.enableGravitationalLensing !== false,
      enableGodRays: config.enableGodRays !== false,
      audioSensitivity: config.audioSensitivity || 1.0,
      maxStars: config.maxStars || 10000,
    };

    this.frequencyData = new Uint8Array(512);
    
    // Initialize particle engine
    this.particleEngine = new AdvancedParticleEngine({
      maxParticles: 100000,
      emissionRate: 1000,
      particleLifetime: 8,
      useGPUAcceleration: true,
      emotionBlendSpeed: 0.3,
    });

    if (this.config.enableParticles) {
      this.scene.add(this.particleEngine.getParticleSystem());
    }

    this.initializeUniverse();
  }

  private initializeUniverse(): void {
    // Create background starfield
    this.createStarfield();
    
    // Create nebulae
    if (this.config.enableNebulae) {
      this.createNebulae();
    }
    
    // Create god rays
    if (this.config.enableGodRays) {
      this.createGodRays();
    }
  }

  private createStarfield(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    const starColors: number[] = [];
    const starSizes: number[] = [];

    for (let i = 0; i < this.config.maxStars; i++) {
      // Random position in a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 500 + Math.random() * 500;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starPositions.push(x, y, z);
      
      // Random star color (bluish to reddish)
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.5 + Math.random() * 0.3);
      starColors.push(color.r, color.g, color.b);
      
      starSizes.push(Math.random() * 2 + 0.5);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioIntensity: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float audioIntensity;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Twinkle effect
          float twinkle = sin(time + position.x * 0.01) * 0.5 + 0.5;
          float audioTwinkle = 1.0 + audioIntensity * 0.3;
          
          gl_PointSize = size * twinkle * audioTwinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    starfield.name = 'starfield';
    this.scene.add(starfield);
  }

  private createNebulae(): void {
    const nebulaCount = 3;
    
    for (let i = 0; i < nebulaCount; i++) {
      const nebula = new THREE.Group();
      
      // Create volumetric nebula using multiple layers
      for (let layer = 0; layer < 5; layer++) {
        const geometry = new THREE.IcosahedronGeometry(80 + layer * 20, 3);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x4169E1) },
            color2: { value: new THREE.Color(0xFF69B4) },
            audioIntensity: { value: 0 },
            layer: { value: layer / 5 },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            uniform float layer;
            
            // Simplex noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
              const vec2 C = vec2(1.0/6.0, 1.0/3.0);
              const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
              
              vec3 i  = floor(v + dot(v, C.yyy));
              vec3 x0 = v - i + dot(i, C.xxx);
              
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min(g.xyz, l.zxy);
              vec3 i2 = max(g.xyz, l.zxy);
              
              vec3 x1 = x0 - i1 + C.xxx;
              vec3 x2 = x0 - i2 + C.yyy;
              vec3 x3 = x0 - D.yyy;
              
              i = mod289(i);
              vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
              float n_ = 0.142857142857;
              vec3 ns = n_ * D.wyz - D.xzx;
              
              vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
              
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_);
              
              vec4 x = x_ *ns.x + ns.yyyy;
              vec4 y = y_ *ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
              
              vec4 b0 = vec4(x.xy, y.xy);
              vec4 b1 = vec4(x.zw, y.zw);
              
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
              vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
              
              vec3 p0 = vec3(a0.xy, h.x);
              vec3 p1 = vec3(a0.zw, h.y);
              vec3 p2 = vec3(a1.xy, h.z);
              vec3 p3 = vec3(a1.zw, h.w);
              
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
              p0 *= norm.x;
              p1 *= norm.y;
              p2 *= norm.z;
              p3 *= norm.w;
              
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = position;
              
              // Animated displacement
              vec3 displaced = position;
              float noise = snoise(position * 0.05 + time * 0.1 * (1.0 - layer));
              displaced += normal * noise * 10.0 * (1.0 - layer * 0.5);
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float audioIntensity;
            uniform float layer;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
              vec3 viewDirection = normalize(cameraPosition - vPosition);
              float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
              
              vec3 color = mix(color1, color2, fresnel);
              float alpha = fresnel * (0.1 + audioIntensity * 0.2) * (1.0 - layer * 0.15);
              
              gl_FragColor = vec4(color, alpha);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        nebula.add(mesh);
      }
      
      // Position nebulae
      const angle = (i / nebulaCount) * Math.PI * 2;
      nebula.position.set(
        Math.cos(angle) * 300,
        (Math.random() - 0.5) * 100,
        Math.sin(angle) * 300
      );
      
      this.nebulae.push(nebula);
      this.scene.add(nebula);
    }
  }

  private createGodRays(): void {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        intensity: { value: 0.5 },
        audioBoost: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunPosition;
        uniform float intensity;
        uniform float audioBoost;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vUv - vec2(0.5);
          float dist = length(center);
          float angle = atan(center.y, center.x);
          
          // Rotating rays
          float rays = sin(angle * 12.0 + time) * 0.5 + 0.5;
          float radial = 1.0 - smoothstep(0.0, 0.7, dist);
          
          float godRay = rays * radial * intensity * (1.0 + audioBoost);
          vec3 color = vec3(1.0, 0.9, 0.7) * godRay;
          
          gl_FragColor = vec4(color, godRay * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.godRays = new THREE.Mesh(geometry, material);
    this.godRays.renderOrder = -1;
  }

  public connectAudioSource(source: MediaElementAudioSourceNode | AudioBufferSourceNode): void {
    if (!this.audioContext) {
      this.audioContext = Tone.getContext().rawContext as AudioContext;
    }
    
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;
    
    source.connect(this.analyser);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public setEmotion(emotion: EmotionType, immediate: boolean = false): void {
    this.currentEmotion = emotion;
    this.particleEngine.setEmotion(emotion);
    
    if (immediate) {
      this.emotionTransitionSpeed = 1.0;
    } else {
      this.emotionTransitionSpeed = 0.1;
    }
  }

  public addCosmicObject(object: CosmicObject): void {
    this.cosmicObjects.push(object);
  }

  private analyzeAudioFrequencies(): void {
    if (!this.analyser) return;
    
    this.analyser.getByteFrequencyData(this.frequencyData);
    
    const sampleRate = this.audioContext?.sampleRate || 44100;
    this.particleEngine.updateAudioData(this.frequencyData, sampleRate);
    
    // Calculate frequency ranges
    const nyquist = sampleRate / 2;
    const binFreq = nyquist / this.frequencyData.length;
    
    const bassEnd = Math.floor(100 / binFreq);
    const midEnd = Math.floor(2000 / binFreq);
    
    let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
    
    for (let i = 0; i < this.frequencyData.length; i++) {
      const value = this.frequencyData[i];
      totalSum += value;
      
      if (i < bassEnd) bassSum += value;
      else if (i < midEnd) midSum += value;
      else trebleSum += value;
    }
    
    this.bassFrequency = (bassSum / bassEnd) / 255;
    this.midFrequency = (midSum / (midEnd - bassEnd)) / 255;
    this.trebleFrequency = (trebleSum / (this.frequencyData.length - midEnd)) / 255;
    this.overallAmplitude = (totalSum / this.frequencyData.length) / 255;
  }

  public update(deltaTime: number): void {
    this.analyzeAudioFrequencies();
    
    // Update particle engine
    this.particleEngine.update(deltaTime);
    
    // Update starfield
    const starfield = this.scene.getObjectByName('starfield');
    if (starfield && (starfield as THREE.Points).material) {
      const material = (starfield as THREE.Points).material as THREE.ShaderMaterial;
      material.uniforms.time.value += deltaTime;
      material.uniforms.audioIntensity.value = this.overallAmplitude * this.config.audioSensitivity;
    }
    
    // Update nebulae
    this.nebulae.forEach((nebula, index) => {
      nebula.rotation.y += deltaTime * 0.05 * (1 + this.bassFrequency * 0.5);
      nebula.rotation.x += deltaTime * 0.02;
      
      nebula.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value += deltaTime;
          child.material.uniforms.audioIntensity.value = this.midFrequency * this.config.audioSensitivity;
        }
      });
    });
    
    // Update god rays
    if (this.godRays && this.godRays.material instanceof THREE.ShaderMaterial) {
      this.godRays.material.uniforms.time.value += deltaTime;
      this.godRays.material.uniforms.audioBoost.value = this.trebleFrequency * this.config.audioSensitivity;
    }
  }

  public getFrequencyData(): AudioFrequencyData {
    return {
      bass: this.bassFrequency,
      lowMid: this.midFrequency * 0.5,
      mid: this.midFrequency,
      highMid: this.trebleFrequency * 0.5,
      treble: this.trebleFrequency,
      overall: this.overallAmplitude,
    };
  }

  public dispose(): void {
    this.particleEngine.dispose();
    
    this.nebulae.forEach(nebula => {
      nebula.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });
    
    if (this.godRays) {
      this.godRays.geometry.dispose();
      if (this.godRays.material instanceof THREE.Material) {
        this.godRays.material.dispose();
      }
    }
  }
}
