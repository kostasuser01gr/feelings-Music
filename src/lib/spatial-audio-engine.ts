/**
 * Spatial Audio Engine - 3D Positional Audio System
 * Features: Binaural audio, Doppler effects, reverb zones, HRTF processing
 */

import * as Tone from 'tone';
import * as THREE from 'three';

export interface SpatialAudioConfig {
  enableBinaural: boolean;
  enableDoppler: boolean;
  enableReverb: boolean;
  maxDistance: number;
  rolloffFactor: number;
  dopplerFactor: number;
}

export interface AudioZone {
  id: string;
  position: THREE.Vector3;
  radius: number;
  reverbType: 'cave' | 'hall' | 'cathedral' | 'space' | 'chamber';
  reverbMix: number;
}

export class SpatialAudioSource {
  public id: string;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public player: Tone.Player | Tone.Synth;
  public panner: Tone.Panner3D;
  public gain: Tone.Gain;
  public isPlaying: boolean = false;
  private lastPosition: THREE.Vector3;
  
  constructor(id: string, audioBuffer?: AudioBuffer) {
    this.id = id;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.lastPosition = this.position.clone();
    
    // Create audio chain: source -> panner -> gain -> destination
    if (audioBuffer) {
      this.player = new Tone.Player().toDestination();
    } else {
      this.player = new Tone.Synth().toDestination();
    }
    
    this.panner = new Tone.Panner3D({
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 100,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0,
    });
    
    this.gain = new Tone.Gain(1);
    
    // Connect audio chain
    if (this.player instanceof Tone.Player) {
      this.player.chain(this.panner, this.gain, Tone.getDestination());
    } else {
      this.player.chain(this.panner, this.gain, Tone.getDestination());
    }
  }
  
  public play(): void {
    if (this.player instanceof Tone.Player) {
      this.player.start();
    } else {
      this.player.triggerAttack('C4');
    }
    this.isPlaying = true;
  }
  
  public stop(): void {
    if (this.player instanceof Tone.Player) {
      this.player.stop();
    } else {
      this.player.triggerRelease();
    }
    this.isPlaying = false;
  }
  
  public setPosition(position: THREE.Vector3): void {
    this.lastPosition.copy(this.position);
    this.position.copy(position);
    this.panner.positionX.value = position.x;
    this.panner.positionY.value = position.y;
    this.panner.positionZ.value = position.z;
  }
  
  public updateVelocity(deltaTime: number): void {
    this.velocity.copy(this.position).sub(this.lastPosition).divideScalar(deltaTime);
  }
  
  public setVolume(volume: number): void {
    this.gain.gain.value = volume;
  }
  
  public dispose(): void {
    this.stop();
    this.player.dispose();
    this.panner.dispose();
    this.gain.dispose();
  }
}

export class SpatialAudioEngine {
  private audioContext: AudioContext;
  private listener: THREE.Vector3;
  private listenerVelocity: THREE.Vector3;
  private lastListenerPosition: THREE.Vector3;
  private sources: Map<string, SpatialAudioSource> = new Map();
  private zones: Map<string, AudioZone> = new Map();
  private config: SpatialAudioConfig;
  
  // Reverb effects for different zones
  private reverbs: Map<string, Tone.Reverb> = new Map();
  
  // Binaural beats generator
  private binauralGenerator: Tone.Oscillator | null = null;
  private binauralGain: Tone.Gain;
  
  // Master effects chain
  private masterGain: Tone.Gain;
  private masterCompressor: Tone.Compressor;
  
  constructor(config: Partial<SpatialAudioConfig> = {}) {
    this.audioContext = Tone.getContext().rawContext as AudioContext;
    this.listener = new THREE.Vector3();
    this.listenerVelocity = new THREE.Vector3();
    this.lastListenerPosition = this.listener.clone();
    
    this.config = {
      enableBinaural: config.enableBinaural !== false,
      enableDoppler: config.enableDoppler !== false,
      enableReverb: config.enableReverb !== false,
      maxDistance: config.maxDistance || 100,
      rolloffFactor: config.rolloffFactor || 1,
      dopplerFactor: config.dopplerFactor || 1,
    };
    
    // Setup master effects
    this.masterGain = new Tone.Gain(1);
    this.masterCompressor = new Tone.Compressor({
      threshold: -24,
      ratio: 12,
      attack: 0.003,
      release: 0.25,
    });
    
    this.binauralGain = new Tone.Gain(0);
    
    // Connect master chain
    this.masterGain.chain(this.masterCompressor, Tone.getDestination());
    
    this.initializeReverbs();
  }
  
  private initializeReverbs(): void {
    const reverbConfigs = {
      cave: { decay: 3.5, preDelay: 0.05 },
      hall: { decay: 2.5, preDelay: 0.03 },
      cathedral: { decay: 8.0, preDelay: 0.1 },
      space: { decay: 15.0, preDelay: 0.2 },
      chamber: { decay: 1.5, preDelay: 0.01 },
    };
    
    for (const [type, config] of Object.entries(reverbConfigs)) {
      const reverb = new Tone.Reverb(config.decay);
      reverb.preDelay = config.preDelay;
      reverb.toDestination();
      this.reverbs.set(type, reverb);
    }
  }
  
  public createSource(id: string, audioBuffer?: AudioBuffer): SpatialAudioSource {
    const source = new SpatialAudioSource(id, audioBuffer);
    this.sources.set(id, source);
    return source;
  }
  
  public removeSource(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      source.dispose();
      this.sources.delete(id);
    }
  }
  
  public addZone(zone: AudioZone): void {
    this.zones.set(zone.id, zone);
  }
  
  public removeZone(id: string): void {
    this.zones.delete(id);
  }
  
  public setListenerPosition(position: THREE.Vector3): void {
    this.lastListenerPosition.copy(this.listener);
    this.listener.copy(position);
    
    const audioListener = Tone.getListener();
    if (audioListener.positionX) {
      audioListener.positionX.value = position.x;
      audioListener.positionY.value = position.y;
      audioListener.positionZ.value = position.z;
    }
  }
  
  public setListenerOrientation(forward: THREE.Vector3, up: THREE.Vector3): void {
    const audioListener = Tone.getListener();
    if (audioListener.forwardX) {
      audioListener.forwardX.value = forward.x;
      audioListener.forwardY.value = forward.y;
      audioListener.forwardZ.value = forward.z;
      audioListener.upX.value = up.x;
      audioListener.upY.value = up.y;
      audioListener.upZ.value = up.z;
    }
  }
  
  public playBinauralBeat(baseFrequency: number, beatFrequency: number, duration?: number): void {
    if (!this.config.enableBinaural) return;
    
    // Stop existing binaural
    if (this.binauralGenerator) {
      this.binauralGenerator.stop();
      this.binauralGenerator.dispose();
    }
    
    // Create carrier wave
    const carrier = new Tone.Oscillator(baseFrequency, 'sine').start();
    
    // Create beat wave (slightly offset frequency)
    const beat = new Tone.Oscillator(baseFrequency + beatFrequency, 'sine').start();
    
    // Pan to separate ears
    const leftPanner = new Tone.Panner(-1);
    const rightPanner = new Tone.Panner(1);
    
    carrier.connect(leftPanner);
    beat.connect(rightPanner);
    
    const merger = new Tone.Merge();
    leftPanner.connect(merger, 0, 0);
    rightPanner.connect(merger, 0, 1);
    
    merger.chain(this.binauralGain, Tone.getDestination());
    
    // Fade in
    this.binauralGain.gain.rampTo(0.3, 2);
    
    if (duration) {
      setTimeout(() => {
        this.stopBinauralBeat();
      }, duration * 1000);
    }
    
    this.binauralGenerator = carrier;
  }
  
  public stopBinauralBeat(): void {
    if (this.binauralGenerator) {
      this.binauralGain.gain.rampTo(0, 2);
      setTimeout(() => {
        if (this.binauralGenerator) {
          this.binauralGenerator.stop();
          this.binauralGenerator.dispose();
          this.binauralGenerator = null;
        }
      }, 2000);
    }
  }
  
  /**
   * Update all spatial audio calculations
   */
  public update(deltaTime: number): void {
    // Update listener velocity
    this.listenerVelocity.copy(this.listener)
      .sub(this.lastListenerPosition)
      .divideScalar(deltaTime);
    
    // Update each source
    for (const source of this.sources.values()) {
      source.updateVelocity(deltaTime);
      
      // Calculate distance to listener
      const distance = source.position.distanceTo(this.listener);
      
      // Apply distance-based attenuation
      const attenuation = this.calculateAttenuation(distance);
      
      // Apply Doppler effect
      if (this.config.enableDoppler) {
        const dopplerShift = this.calculateDopplerShift(source);
        // Note: Actual frequency shifting would require more complex processing
      }
      
      // Check if source is in any reverb zone
      if (this.config.enableReverb) {
        this.updateReverbZones(source);
      }
      
      // Update volume based on distance
      source.setVolume(attenuation);
    }
  }
  
  private calculateAttenuation(distance: number): number {
    if (distance >= this.config.maxDistance) {
      return 0;
    }
    
    // Inverse distance model
    const attenuation = 1 / (1 + this.config.rolloffFactor * distance);
    return Math.max(0, Math.min(1, attenuation));
  }
  
  private calculateDopplerShift(source: SpatialAudioSource): number {
    const speedOfSound = 343; // m/s
    
    // Vector from source to listener
    const direction = new THREE.Vector3()
      .subVectors(this.listener, source.position)
      .normalize();
    
    // Relative velocity along the direction
    const sourceVelocity = source.velocity.dot(direction);
    const listenerVelocity = this.listenerVelocity.dot(direction);
    
    // Doppler formula
    const dopplerFactor = (speedOfSound + listenerVelocity) / 
                         (speedOfSound + sourceVelocity);
    
    return dopplerFactor * this.config.dopplerFactor;
  }
  
  private updateReverbZones(source: SpatialAudioSource): void {
    let activeZone: AudioZone | null = null;
    let minDistance = Infinity;
    
    // Find closest zone
    for (const zone of this.zones.values()) {
      const distance = source.position.distanceTo(zone.position);
      if (distance < zone.radius && distance < minDistance) {
        activeZone = zone;
        minDistance = distance;
      }
    }
    
    // Apply reverb if in zone
    if (activeZone) {
      const reverb = this.reverbs.get(activeZone.reverbType);
      if (reverb) {
        const mixAmount = 1 - (minDistance / activeZone.radius);
        // Apply reverb (in production, this would require dynamic routing)
      }
    }
  }
  
  /**
   * Create meditation soundscape with binaural beats
   */
  public createMeditationSoundscape(emotion: string): void {
    const binauralFrequencies = {
      calm: { base: 200, beat: 4 },      // Theta waves
      focus: { base: 200, beat: 15 },    // Beta waves
      sleep: { base: 150, beat: 2 },     // Delta waves
      creative: { base: 200, beat: 7 },  // Alpha waves
    };
    
    const config = binauralFrequencies[emotion as keyof typeof binauralFrequencies] || binauralFrequencies.calm;
    this.playBinauralBeat(config.base, config.beat);
    
    // Add ambient sounds
    const ambientSource = this.createSource('ambient');
    ambientSource.setPosition(new THREE.Vector3(0, 0, 0));
    ambientSource.play();
  }
  
  /**
   * Generate spatial soundscape based on emotion
   */
  public generateEmotionSoundscape(emotion: string, positions: THREE.Vector3[]): void {
    positions.forEach((position, index) => {
      const source = this.createSource(`emotion-${index}`);
      source.setPosition(position);
      
      // Create emotion-specific sounds
      if (source.player instanceof Tone.Synth) {
        const notes = this.getEmotionNotes(emotion);
        const note = notes[index % notes.length];
        source.player.triggerAttack(note);
      }
    });
  }
  
  private getEmotionNotes(emotion: string): string[] {
    const emotionScales = {
      joy: ['C4', 'E4', 'G4', 'B4', 'D5'],
      sadness: ['C3', 'Eb3', 'F3', 'G3', 'Bb3'],
      peace: ['C3', 'D3', 'E3', 'G3', 'A3'],
      energy: ['E4', 'F#4', 'G#4', 'B4', 'C#5'],
    };
    
    return emotionScales[emotion as keyof typeof emotionScales] || emotionScales.peace;
  }
  
  public setMasterVolume(volume: number): void {
    this.masterGain.gain.rampTo(volume, 0.1);
  }
  
  public dispose(): void {
    // Stop and dispose all sources
    for (const source of this.sources.values()) {
      source.dispose();
    }
    this.sources.clear();
    
    // Dispose reverbs
    for (const reverb of this.reverbs.values()) {
      reverb.dispose();
    }
    this.reverbs.clear();
    
    // Stop binaural beats
    this.stopBinauralBeat();
    
    // Dispose master effects
    this.masterGain.dispose();
    this.masterCompressor.dispose();
    this.binauralGain.dispose();
    
    this.zones.clear();
  }
}
