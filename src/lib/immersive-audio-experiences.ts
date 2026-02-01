/**
 * Immersive Audio Experiences System
 * Advanced spatial audio with 3D positioning, binaural processing, 
 * reverb zones, and dynamic audio environment mapping
 */

import * as Tone from 'tone';
import * as THREE from 'three';

export interface SpatialAudioConfig {
  listenerPosition: THREE.Vector3;
  listenerOrientation: THREE.Quaternion;
  roomSize: THREE.Vector3;
  reverbIntensity: number;
  dopplerFactor: number;
  speedOfSound: number;
  maxDistance: number;
  rolloffFactor: number;
  enableHRTF: boolean;
  enableBinaural: boolean;
  environmentPreset: string;
}

export interface AudioZone {
  id: string;
  name: string;
  geometry: THREE.Box3 | THREE.Sphere;
  properties: AudioZoneProperties;
  isActive: boolean;
  priority: number;
  fadeDistance: number;
}

export interface AudioZoneProperties {
  reverb: {
    roomSize: number;
    decay: number;
    damping: number;
    wetLevel: number;
  };
  filter: {
    type: 'lowpass' | 'highpass' | 'bandpass' | 'allpass';
    frequency: number;
    Q: number;
  };
  distortion: {
    amount: number;
    oversample: string;
  };
  delay: {
    time: number;
    feedback: number;
    wetLevel: number;
  };
  modulation: {
    type: 'chorus' | 'flanger' | 'phaser' | 'tremolo';
    rate: number;
    depth: number;
  };
  ambientSound?: {
    url: string;
    volume: number;
    loop: boolean;
  };
}

export interface SpatialAudioSource {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  volume: number;
  loop: boolean;
  autoPlay: boolean;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
  orientation: THREE.Vector3;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  type: 'music' | 'effect' | 'ambient' | 'voice' | 'cosmic';
}

export interface HRTFData {
  sampleRate: number;
  impulseResponses: Map<string, { left: Float32Array; right: Float32Array }>;
  elevationAngles: number[];
  azimuthAngles: number[];
  distances: number[];
}

export interface BinauralProcessor {
  leftConvolver: ConvolverNode;
  rightConvolver: ConvolverNode;
  crossfeedGain: GainNode;
  bassBoost: BiquadFilterNode;
  highShelf: BiquadFilterNode;
  spatializer: PannerNode;
}

export class ImmersiveAudioEngine {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private listenerPosition: THREE.Vector3;
  private listenerOrientation: THREE.Quaternion;
  private listenerVelocity: THREE.Vector3;
  
  private audioSources: Map<string, SpatialAudioSource> = new Map();
  private audioZones: Map<string, AudioZone> = new Map();
  private binauralProcessors: Map<string, BinauralProcessor> = new Map();
  
  private config: SpatialAudioConfig;
  private hrtfData?: HRTFData;
  
  // Audio processing nodes
  private reverbNode: ConvolverNode;
  private delayNode: DelayNode;
  private compressor: DynamicsCompressorNode;
  private analyser: AnalyserNode;
  private spatialAnalyser: AnalyserNode;
  
  // Environment simulation
  private roomToneGenerator: OscillatorNode;
  private cosmicAmbienceNode: GainNode;
  private weatherEffectsNode: GainNode;
  
  // Audio effects chains
  private effectChains: Map<string, AudioNode[]> = new Map();
  private environmentChain: AudioNode[];
  
  // Real-time audio data
  private frequencyData: Float32Array;
  private spatialFrequencyData: Float32Array;
  private audioMetrics: AudioMetrics;
  
  private isInitialized = false;
  private isListening = false;

  constructor(config: Partial<SpatialAudioConfig> = {}) {
    this.config = {
      listenerPosition: new THREE.Vector3(0, 0, 0),
      listenerOrientation: new THREE.Quaternion(),
      roomSize: new THREE.Vector3(100, 30, 100),
      reverbIntensity: 0.3,
      dopplerFactor: 1.0,
      speedOfSound: 343.3,
      maxDistance: 200,
      rolloffFactor: 1,
      enableHRTF: true,
      enableBinaural: true,
      environmentPreset: 'cosmic_space',
      ...config
    };

    this.listenerPosition = this.config.listenerPosition.clone();
    this.listenerOrientation = this.config.listenerOrientation.clone();
    this.listenerVelocity = new THREE.Vector3();

    this.audioMetrics = {
      latency: 0,
      bufferSize: 0,
      sampleRate: 44100,
      spatialAccuracy: 0.9,
      processingLoad: 0.1
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.audioContext.resume();

      // Create master audio chain
      this.masterGain = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.analyser = this.audioContext.createAnalyser();
      this.spatialAnalyser = this.audioContext.createAnalyser();

      // Configure analyser
      this.analyser.fftSize = 2048;
      this.spatialAnalyser.fftSize = 1024;
      this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);
      this.spatialFrequencyData = new Float32Array(this.spatialAnalyser.frequencyBinCount);

      // Create reverb
      await this.initializeReverb();
      
      // Create delay
      this.delayNode = this.audioContext.createDelay(2.0);
      this.delayNode.delayTime.value = 0.1;

      // Create cosmic ambience
      this.initializeCosmicAmbience();

      // Load HRTF data if enabled
      if (this.config.enableHRTF) {
        await this.loadHRTFData();
      }

      // Connect master chain
      this.connectMasterChain();

      // Initialize audio zones
      this.initializeDefaultAudioZones();

      this.isInitialized = true;
      console.log('Immersive Audio Engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  private async initializeReverb(): Promise<void> {
    // Create impulse response for reverb
    const impulseResponse = await this.createImpulseResponse(
      this.config.roomSize,
      this.config.reverbIntensity
    );
    
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = impulseResponse;
  }

  private async createImpulseResponse(roomSize: THREE.Vector3, intensity: number): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 3; // 3 seconds of reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        // Create realistic room reverb based on room dimensions
        const roomFactor = (roomSize.x * roomSize.y * roomSize.z) / 10000;
        const decay = Math.pow(1 - intensity, i / sampleRate);
        const earlyReflections = this.calculateEarlyReflections(i, roomSize, sampleRate);
        const lateReverb = (Math.random() * 2 - 1) * decay * intensity;
        
        channelData[i] = (earlyReflections + lateReverb) * roomFactor * 0.1;
      }
    }

    return impulse;
  }

  private calculateEarlyReflections(sample: number, roomSize: THREE.Vector3, sampleRate: number): number {
    const time = sample / sampleRate;
    const speed = this.config.speedOfSound;
    
    // Calculate reflections from walls
    const reflectionTimes = [
      roomSize.x / speed, // front/back walls
      roomSize.y / speed, // floor/ceiling
      roomSize.z / speed  // side walls
    ];

    let reflection = 0;
    for (const reflectionTime of reflectionTimes) {
      if (time > reflectionTime && time < reflectionTime + 0.001) {
        reflection += Math.exp(-time * 5) * 0.3; // Reflection with decay
      }
    }

    return reflection;
  }

  private initializeCosmicAmbience(): void {
    // Create cosmic room tone
    this.roomToneGenerator = this.audioContext.createOscillator();
    this.roomToneGenerator.type = 'sine';
    this.roomToneGenerator.frequency.value = 40; // Deep cosmic hum

    this.cosmicAmbienceNode = this.audioContext.createGain();
    this.cosmicAmbienceNode.gain.value = 0.05;

    this.weatherEffectsNode = this.audioContext.createGain();
    this.weatherEffectsNode.gain.value = 0.0;

    // Connect cosmic ambience
    this.roomToneGenerator.connect(this.cosmicAmbienceNode);
    this.roomToneGenerator.start();

    // Add cosmic wind simulation
    this.createCosmicWindEffect();
  }

  private createCosmicWindEffect(): void {
    // Use filtered noise for cosmic wind
    const bufferSize = this.audioContext.sampleRate * 10; // 10 seconds of noise
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    // Generate pink noise for more natural wind sound
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      noiseData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const windSource = this.audioContext.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    // Filter for wind characteristics
    const windFilter = this.audioContext.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 800;
    windFilter.Q.value = 0.5;

    windSource.connect(windFilter);
    windFilter.connect(this.weatherEffectsNode);
    windSource.start();
  }

  private async loadHRTFData(): Promise<void> {
    // In a real implementation, this would load actual HRTF data
    // For now, we'll create a simplified simulation
    this.hrtfData = {
      sampleRate: this.audioContext.sampleRate,
      impulseResponses: new Map(),
      elevationAngles: [-40, -30, -20, -10, 0, 10, 20, 30, 40],
      azimuthAngles: Array.from({length: 36}, (_, i) => i * 10 - 180),
      distances: [0.2, 0.5, 1, 2, 5, 10, 20]
    };

    // Generate simplified HRTF impulse responses
    for (const elevation of this.hrtfData.elevationAngles) {
      for (const azimuth of this.hrtfData.azimuthAngles) {
        const key = `${elevation}_${azimuth}`;
        this.hrtfData.impulseResponses.set(key, this.generateHRTFResponse(elevation, azimuth));
      }
    }
  }

  private generateHRTFResponse(elevation: number, azimuth: number): { left: Float32Array; right: Float32Array } {
    const length = 256; // HRTF impulse response length
    const left = new Float32Array(length);
    const right = new Float32Array(length);

    // Simplified HRTF simulation based on angle
    const azimuthRad = (azimuth * Math.PI) / 180;
    const elevationRad = (elevation * Math.PI) / 180;

    // Inter-aural time difference (ITD)
    const headRadius = 0.0875; // Average head radius in meters
    const itdSamples = Math.sin(azimuthRad) * headRadius / this.config.speedOfSound * this.audioContext.sampleRate;

    // Inter-aural level difference (ILD)
    const leftGain = Math.max(0.1, 1 - Math.max(0, azimuthRad / Math.PI));
    const rightGain = Math.max(0.1, 1 + Math.min(0, azimuthRad / Math.PI));

    // Generate impulse responses
    for (let i = 0; i < length; i++) {
      // Simple impulse with delay and gain differences
      const leftDelay = Math.round(-itdSamples / 2);
      const rightDelay = Math.round(itdSamples / 2);

      if (i === Math.max(0, leftDelay)) {
        left[i] = leftGain * Math.exp(-i * 0.01);
      }
      if (i === Math.max(0, rightDelay)) {
        right[i] = rightGain * Math.exp(-i * 0.01);
      }

      // Add some frequency-dependent effects
      const freqResponse = 1 - Math.abs(elevationRad) / (Math.PI / 2) * 0.3;
      left[i] *= freqResponse;
      right[i] *= freqResponse;
    }

    return { left, right };
  }

  private connectMasterChain(): void {
    // Create master audio processing chain
    this.environmentChain = [
      this.cosmicAmbienceNode,
      this.weatherEffectsNode,
      this.reverbNode,
      this.delayNode,
      this.compressor,
      this.masterGain,
      this.analyser
    ];

    // Connect chain
    for (let i = 0; i < this.environmentChain.length - 1; i++) {
      this.environmentChain[i].connect(this.environmentChain[i + 1]);
    }

    // Connect to output
    this.masterGain.connect(this.audioContext.destination);
    this.spatialAnalyser.connect(this.audioContext.destination);
  }

  private initializeDefaultAudioZones(): void {
    // Cosmic void zone (default)
    this.createAudioZone({
      id: 'cosmic_void',
      name: 'Cosmic Void',
      geometry: new THREE.Box3(
        new THREE.Vector3(-1000, -1000, -1000),
        new THREE.Vector3(1000, 1000, 1000)
      ),
      properties: {
        reverb: { roomSize: 100, decay: 8.0, damping: 0.1, wetLevel: 0.4 },
        filter: { type: 'lowpass', frequency: 8000, Q: 0.7 },
        distortion: { amount: 0.02, oversample: '4x' },
        delay: { time: 0.3, feedback: 0.3, wetLevel: 0.2 },
        modulation: { type: 'chorus', rate: 0.1, depth: 0.1 }
      },
      isActive: true,
      priority: 0,
      fadeDistance: 50
    });

    // Stellar nursery zone
    this.createAudioZone({
      id: 'stellar_nursery',
      name: 'Stellar Nursery',
      geometry: new THREE.Sphere(new THREE.Vector3(50, 0, 50), 30),
      properties: {
        reverb: { roomSize: 50, decay: 4.0, damping: 0.3, wetLevel: 0.6 },
        filter: { type: 'bandpass', frequency: 2000, Q: 2.0 },
        distortion: { amount: 0.1, oversample: '2x' },
        delay: { time: 0.15, feedback: 0.4, wetLevel: 0.3 },
        modulation: { type: 'flanger', rate: 0.2, depth: 0.2 },
        ambientSound: {
          url: '/audio/stellar_winds.ogg',
          volume: 0.3,
          loop: true
        }
      },
      isActive: true,
      priority: 2,
      fadeDistance: 20
    });

    // Black hole zone
    this.createAudioZone({
      id: 'black_hole',
      name: 'Black Hole',
      geometry: new THREE.Sphere(new THREE.Vector3(-80, 0, -80), 25),
      properties: {
        reverb: { roomSize: 20, decay: 12.0, damping: 0.05, wetLevel: 0.8 },
        filter: { type: 'lowpass', frequency: 500, Q: 5.0 },
        distortion: { amount: 0.3, oversample: '4x' },
        delay: { time: 0.8, feedback: 0.7, wetLevel: 0.6 },
        modulation: { type: 'tremolo', rate: 0.05, depth: 0.5 },
        ambientSound: {
          url: '/audio/gravitational_waves.ogg',
          volume: 0.4,
          loop: true
        }
      },
      isActive: true,
      priority: 3,
      fadeDistance: 15
    });
  }

  createAudioSource(config: Partial<SpatialAudioSource> & { id: string; position: THREE.Vector3 }): string {
    const source: SpatialAudioSource = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      volume: 1.0,
      loop: false,
      autoPlay: false,
      maxDistance: this.config.maxDistance,
      rolloffFactor: this.config.rolloffFactor,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 1.0,
      orientation: new THREE.Vector3(0, 0, -1),
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      type: 'effect',
      ...config
    };

    this.audioSources.set(source.id, source);

    // Create spatial audio processing for this source
    if (this.config.enableBinaural) {
      this.createBinauralProcessor(source.id);
    }

    return source.id;
  }

  createAudioZone(zone: Omit<AudioZone, 'isActive'> & { isActive?: boolean }): string {
    const audioZone: AudioZone = {
      isActive: true,
      ...zone
    };

    this.audioZones.set(audioZone.id, audioZone);
    return audioZone.id;
  }

  private createBinauralProcessor(sourceId: string): void {
    if (!this.hrtfData) return;

    const leftConvolver = this.audioContext.createConvolver();
    const rightConvolver = this.audioContext.createConvolver();
    const crossfeedGain = this.audioContext.createGain();
    const bassBoost = this.audioContext.createBiquadFilter();
    const highShelf = this.audioContext.createBiquadFilter();
    const spatializer = this.audioContext.createPanner();

    // Configure filters
    bassBoost.type = 'peaking';
    bassBoost.frequency.value = 80;
    bassBoost.Q.value = 1;
    bassBoost.gain.value = 3;

    highShelf.type = 'highshelf';
    highShelf.frequency.value = 8000;
    highShelf.gain.value = 2;

    // Configure spatializer
    spatializer.panningModel = 'HRTF';
    spatializer.distanceModel = 'inverse';
    spatializer.refDistance = 1;
    spatializer.maxDistance = this.config.maxDistance;
    spatializer.rolloffFactor = this.config.rolloffFactor;
    spatializer.coneInnerAngle = 360;
    spatializer.coneOuterAngle = 360;
    spatializer.coneOuterGain = 1;

    const processor: BinauralProcessor = {
      leftConvolver,
      rightConvolver,
      crossfeedGain,
      bassBoost,
      highShelf,
      spatializer
    };

    this.binauralProcessors.set(sourceId, processor);
  }

  updateListenerPosition(position: THREE.Vector3, orientation?: THREE.Quaternion): void {
    this.listenerPosition.copy(position);
    
    if (orientation) {
      this.listenerOrientation.copy(orientation);
    }

    // Update AudioContext listener
    if (this.audioContext.listener.positionX) {
      // Modern Web Audio API
      this.audioContext.listener.positionX.value = position.x;
      this.audioContext.listener.positionY.value = position.y;
      this.audioContext.listener.positionZ.value = position.z;

      if (orientation) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation);

        this.audioContext.listener.forwardX.value = forward.x;
        this.audioContext.listener.forwardY.value = forward.y;
        this.audioContext.listener.forwardZ.value = forward.z;
        this.audioContext.listener.upX.value = up.x;
        this.audioContext.listener.upY.value = up.y;
        this.audioContext.listener.upZ.value = up.z;
      }
    } else {
      // Legacy Web Audio API
      (this.audioContext.listener as any).setPosition(position.x, position.y, position.z);
      
      if (orientation) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(orientation);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation);
        (this.audioContext.listener as any).setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
      }
    }

    // Update all spatial audio sources
    this.updateAllSpatialSources();
    
    // Update audio zones
    this.updateAudioZones();
  }

  private updateAllSpatialSources(): void {
    this.audioSources.forEach((source, sourceId) => {
      this.updateSpatialSource(sourceId, source);
    });
  }

  private updateSpatialSource(sourceId: string, source: SpatialAudioSource): void {
    const processor = this.binauralProcessors.get(sourceId);
    if (!processor || !this.config.enableBinaural) return;

    // Calculate spatial parameters
    const sourceToListener = source.position.clone().sub(this.listenerPosition);
    const distance = sourceToListener.length();
    const azimuth = Math.atan2(sourceToListener.x, sourceToListener.z) * 180 / Math.PI;
    const elevation = Math.atan2(sourceToListener.y, Math.sqrt(sourceToListener.x * sourceToListener.x + sourceToListener.z * sourceToListener.z)) * 180 / Math.PI;

    // Update panner position
    if (processor.spatializer.positionX) {
      processor.spatializer.positionX.value = source.position.x;
      processor.spatializer.positionY.value = source.position.y;
      processor.spatializer.positionZ.value = source.position.z;
    }

    // Update HRTF convolution
    if (this.hrtfData) {
      const hrtfKey = this.findNearestHRTF(elevation, azimuth);
      const hrtfResponse = this.hrtfData.impulseResponses.get(hrtfKey);
      
      if (hrtfResponse) {
        // Update convolver buffers
        this.updateConvolverBuffer(processor.leftConvolver, hrtfResponse.left);
        this.updateConvolverBuffer(processor.rightConvolver, hrtfResponse.right);
      }
    }

    // Apply distance attenuation
    const attenuation = this.calculateDistanceAttenuation(distance, source.maxDistance, source.rolloffFactor);
    processor.crossfeedGain.gain.value = attenuation;

    // Apply Doppler effect if source has velocity
    if (source.velocity.length() > 0) {
      const dopplerShift = this.calculateDopplerShift(source.velocity, sourceToListener);
      // Apply doppler shift to playback rate (would need access to source node)
    }
  }

  private findNearestHRTF(elevation: number, azimuth: number): string {
    if (!this.hrtfData) return '0_0';

    // Find nearest elevation
    let nearestElevation = this.hrtfData.elevationAngles[0];
    let minElevDiff = Math.abs(elevation - nearestElevation);
    for (const elev of this.hrtfData.elevationAngles) {
      const diff = Math.abs(elevation - elev);
      if (diff < minElevDiff) {
        minElevDiff = diff;
        nearestElevation = elev;
      }
    }

    // Find nearest azimuth
    let nearestAzimuth = this.hrtfData.azimuthAngles[0];
    let minAzimDiff = Math.abs(azimuth - nearestAzimuth);
    for (const azim of this.hrtfData.azimuthAngles) {
      let diff = Math.abs(azimuth - azim);
      if (diff > 180) diff = 360 - diff; // Handle wraparound
      if (diff < minAzimDiff) {
        minAzimDiff = diff;
        nearestAzimuth = azim;
      }
    }

    return `${nearestElevation}_${nearestAzimuth}`;
  }

  private updateConvolverBuffer(convolver: ConvolverNode, impulseData: Float32Array): void {
    const buffer = this.audioContext.createBuffer(1, impulseData.length, this.audioContext.sampleRate);
    buffer.copyToChannel(impulseData, 0);
    convolver.buffer = buffer;
  }

  private calculateDistanceAttenuation(distance: number, maxDistance: number, rolloff: number): number {
    if (distance >= maxDistance) return 0;
    return Math.pow(1 - (distance / maxDistance), rolloff);
  }

  private calculateDopplerShift(sourceVelocity: THREE.Vector3, sourceToListener: THREE.Vector3): number {
    const listenerVelocity = this.listenerVelocity;
    const soundSpeed = this.config.speedOfSound;
    
    const sourceDirection = sourceToListener.clone().normalize();
    const sourceVelRadial = sourceVelocity.dot(sourceDirection);
    const listenerVelRadial = listenerVelocity.dot(sourceDirection);
    
    const dopplerFactor = (soundSpeed + listenerVelRadial) / (soundSpeed + sourceVelRadial);
    return dopplerFactor * this.config.dopplerFactor;
  }

  private updateAudioZones(): void {
    // Find active audio zones based on listener position
    const activeZones: AudioZone[] = [];
    
    this.audioZones.forEach(zone => {
      if (!zone.isActive) return;
      
      let isInZone = false;
      let distanceToZone = 0;
      
      if (zone.geometry instanceof THREE.Box3) {
        isInZone = zone.geometry.containsPoint(this.listenerPosition);
        distanceToZone = zone.geometry.distanceToPoint(this.listenerPosition);
      } else if (zone.geometry instanceof THREE.Sphere) {
        distanceToZone = this.listenerPosition.distanceTo(zone.geometry.center) - zone.geometry.radius;
        isInZone = distanceToZone <= 0;
      }
      
      if (isInZone || distanceToZone <= zone.fadeDistance) {
        activeZones.push(zone);
      }
    });
    
    // Sort by priority (higher priority first)
    activeZones.sort((a, b) => b.priority - a.priority);
    
    // Apply audio zone effects
    if (activeZones.length > 0) {
      this.applyAudioZoneEffects(activeZones);
    }
  }

  private applyAudioZoneEffects(zones: AudioZone[]): void {
    // Blend effects from multiple zones
    const blendedEffects = this.blendZoneEffects(zones);
    
    // Apply reverb settings
    if (blendedEffects.reverb) {
      this.updateReverbSettings(blendedEffects.reverb);
    }
    
    // Apply filter settings
    if (blendedEffects.filter && this.environmentChain.length > 0) {
      // Would need access to filter nodes in the chain
    }
    
    // Apply delay settings
    if (blendedEffects.delay) {
      this.delayNode.delayTime.value = blendedEffects.delay.time;
      // Would need delay feedback and wet level nodes
    }
  }

  private blendZoneEffects(zones: AudioZone[]): Partial<AudioZoneProperties> {
    if (zones.length === 0) return {};
    if (zones.length === 1) return zones[0].properties;
    
    // Blend properties based on distance and priority
    const blended: Partial<AudioZoneProperties> = {};
    
    // Simple weighted average based on priority
    let totalWeight = 0;
    zones.forEach(zone => totalWeight += zone.priority + 1);
    
    // Blend reverb settings
    if (zones[0].properties.reverb) {
      blended.reverb = {
        roomSize: 0,
        decay: 0,
        damping: 0,
        wetLevel: 0
      };
      
      zones.forEach(zone => {
        const weight = (zone.priority + 1) / totalWeight;
        blended.reverb!.roomSize += zone.properties.reverb.roomSize * weight;
        blended.reverb!.decay += zone.properties.reverb.decay * weight;
        blended.reverb!.damping += zone.properties.reverb.damping * weight;
        blended.reverb!.wetLevel += zone.properties.reverb.wetLevel * weight;
      });
    }
    
    return blended;
  }

  private updateReverbSettings(reverbSettings: AudioZoneProperties['reverb']): void {
    // Would need to recreate reverb impulse response with new settings
    // For now, we'll just adjust the wet level
    if (this.reverbNode && this.environmentChain.includes(this.reverbNode)) {
      // Would need a wet/dry mix node
    }
  }

  // Analysis and metrics
  updateAudioMetrics(): void {
    if (!this.analyser) return;
    
    this.analyser.getFloatFrequencyData(this.frequencyData);
    this.spatialAnalyser.getFloatFrequencyData(this.spatialFrequencyData);
    
    // Calculate audio metrics
    this.audioMetrics = {
      latency: this.audioContext.outputLatency || this.audioContext.baseLatency || 0,
      bufferSize: this.audioContext.sampleRate / 60, // Estimate
      sampleRate: this.audioContext.sampleRate,
      spatialAccuracy: this.calculateSpatialAccuracy(),
      processingLoad: this.calculateProcessingLoad()
    };
  }

  private calculateSpatialAccuracy(): number {
    // Simplified spatial accuracy calculation
    const activeSources = Array.from(this.audioSources.values()).filter(s => s.isPlaying).length;
    const maxSources = 32; // Theoretical max for good spatial accuracy
    return Math.max(0.5, 1 - (activeSources / maxSources));
  }

  private calculateProcessingLoad(): number {
    // Estimate processing load based on active elements
    const activeSourcesLoad = this.audioSources.size * 0.02;
    const activeZonesLoad = this.audioZones.size * 0.01;
    const binauralLoad = this.config.enableBinaural ? 0.1 : 0;
    return Math.min(1, activeSourcesLoad + activeZonesLoad + binauralLoad);
  }

  // Audio source control
  async playAudioSource(sourceId: string): Promise<void> {
    const source = this.audioSources.get(sourceId);
    if (!source || source.isPlaying) return;
    
    try {
      // Load and play audio
      if (source.audioUrl && !source.audioBuffer) {
        source.audioBuffer = await this.loadAudioBuffer(source.audioUrl);
        source.duration = source.audioBuffer.duration;
      }
      
      if (source.audioBuffer) {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = source.audioBuffer;
        bufferSource.loop = source.loop;
        
        // Connect to spatial processing chain
        const processor = this.binauralProcessors.get(sourceId);
        if (processor) {
          bufferSource.connect(processor.spatializer);
          processor.spatializer.connect(this.masterGain);
        } else {
          bufferSource.connect(this.masterGain);
        }
        
        bufferSource.start(0, source.currentTime);
        source.isPlaying = true;
        source.isPaused = false;
      }
    } catch (error) {
      console.error(`Failed to play audio source ${sourceId}:`, error);
    }
  }

  stopAudioSource(sourceId: string): void {
    const source = this.audioSources.get(sourceId);
    if (!source || !source.isPlaying) return;
    
    source.isPlaying = false;
    source.isPaused = false;
    source.currentTime = 0;
    
    // Stop buffer source (would need reference to the actual source node)
  }

  pauseAudioSource(sourceId: string): void {
    const source = this.audioSources.get(sourceId);
    if (!source || !source.isPlaying || source.isPaused) return;
    
    source.isPaused = true;
    // Pause logic would need reference to the actual source node
  }

  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  // Environment control
  setEnvironmentPreset(preset: string): void {
    this.config.environmentPreset = preset;
    
    switch (preset) {
      case 'cosmic_space':
        this.cosmicAmbienceNode.gain.value = 0.05;
        this.weatherEffectsNode.gain.value = 0.0;
        this.config.reverbIntensity = 0.3;
        break;
      case 'nebula':
        this.cosmicAmbienceNode.gain.value = 0.08;
        this.weatherEffectsNode.gain.value = 0.1;
        this.config.reverbIntensity = 0.6;
        break;
      case 'inside_star':
        this.cosmicAmbienceNode.gain.value = 0.15;
        this.weatherEffectsNode.gain.value = 0.3;
        this.config.reverbIntensity = 0.8;
        break;
      case 'black_hole':
        this.cosmicAmbienceNode.gain.value = 0.02;
        this.weatherEffectsNode.gain.value = 0.0;
        this.config.reverbIntensity = 1.0;
        break;
    }
  }

  // Public API
  getAudioMetrics(): AudioMetrics {
    return { ...this.audioMetrics };
  }

  getConfig(): SpatialAudioConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SpatialAudioConfig>): void {
    Object.assign(this.config, newConfig);
    
    // Re-initialize if significant changes
    if (newConfig.enableHRTF !== undefined || newConfig.enableBinaural !== undefined) {
      this.reinitialize();
    }
  }

  private async reinitialize(): Promise<void> {
    const wasListening = this.isListening;
    if (wasListening) this.stopListening();
    
    this.isInitialized = false;
    await this.initialize();
    
    if (wasListening) this.startListening();
  }

  startListening(): void {
    if (this.isListening) return;
    this.isListening = true;
    
    // Start real-time audio processing
    const processAudio = () => {
      if (!this.isListening) return;
      
      this.updateAudioMetrics();
      this.updateAllSpatialSources();
      this.updateAudioZones();
      
      requestAnimationFrame(processAudio);
    };
    
    requestAnimationFrame(processAudio);
  }

  stopListening(): void {
    this.isListening = false;
  }

  dispose(): void {
    this.stopListening();
    
    // Stop all audio sources
    this.audioSources.forEach((_, id) => this.stopAudioSource(id));
    
    // Disconnect audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Clear collections
    this.audioSources.clear();
    this.audioZones.clear();
    this.binauralProcessors.clear();
    this.effectChains.clear();
  }
}

interface AudioMetrics {
  latency: number;
  bufferSize: number;
  sampleRate: number;
  spatialAccuracy: number;
  processingLoad: number;
}

// Helper functions
export function createCosmicAudioSource(
  engine: ImmersiveAudioEngine, 
  position: THREE.Vector3, 
  audioUrl: string,
  options: Partial<SpatialAudioSource> = {}
): string {
  return engine.createAudioSource({
    id: `cosmic_source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    position,
    audioUrl,
    type: 'cosmic',
    maxDistance: 100,
    autoPlay: true,
    volume: 0.7,
    ...options
  });
}

export function createNebulaAudioZone(
  engine: ImmersiveAudioEngine,
  center: THREE.Vector3,
  radius: number
): string {
  return engine.createAudioZone({
    id: `nebula_zone_${Date.now()}`,
    name: 'Nebula Zone',
    geometry: new THREE.Sphere(center, radius),
    properties: {
      reverb: { roomSize: 60, decay: 6.0, damping: 0.2, wetLevel: 0.7 },
      filter: { type: 'highpass', frequency: 100, Q: 1.0 },
      distortion: { amount: 0.05, oversample: '2x' },
      delay: { time: 0.2, feedback: 0.5, wetLevel: 0.4 },
      modulation: { type: 'chorus', rate: 0.15, depth: 0.3 },
      ambientSound: {
        url: '/audio/nebula_whispers.ogg',
        volume: 0.2,
        loop: true
      }
    },
    priority: 2,
    fadeDistance: radius * 0.5
  });
}

// Global immersive audio engine instance
export const immersiveAudioEngine = new ImmersiveAudioEngine();