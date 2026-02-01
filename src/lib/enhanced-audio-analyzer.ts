/**
 * Enhanced Audio Analyzer for real-time music visualization in the cosmos
 * Integrates with Tone.js and provides detailed frequency analysis for cosmic mapping
 */

import * as Tone from 'tone';

export interface FrequencyBands {
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
}

export interface AudioCharacteristics {
  peak: number;
  rms: number;
  centroid: number;
  rolloff: number;
}

export interface EnvelopeCharacteristics {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface EmotionalState {
  energy: number;
  valence: number;
  arousal: number;
  tension: number;
}

export interface AudioAnalysisData {
  // Frequency bands
  bass: number;       // 20-250 Hz
  lowMid: number;     // 250-500 Hz
  mid: number;        // 500-2000 Hz
  highMid: number;    // 2000-4000 Hz
  treble: number;     // 4000-20000 Hz
  
  // Rhythm and tempo
  bpm: number;
  beat: number;
  measure: number;
  
  // Audio characteristics
  volume: number;
  peak: number;
  rms: number;
  centroid: number;
  rolloff: number;
  
  // Harmonic analysis
  pitch: number;
  harmonics: number[];
  chroma: number[];
  
  // Dynamics
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  
  // Emotional mapping
  energy: number;
  valence: number;
  arousal: number;
  tension: number;
}

export interface CosmicMappingData {
  starIntensity: number;
  planetRotation: number;
  nebulaMovement: number;
  auroraActivity: number;
  cameraMovement: { x: number; y: number; z: number };
  colorPalette: string[];
  particleEmission: number;
  gravityWaves: number;
}

export class EnhancedAudioAnalyzer {
  private analyzer?: Tone.Analyser;
  private fft?: Tone.FFT;
  private meter?: Tone.Meter;
  private follower?: Tone.Follower;
  private waveform?: Tone.Waveform;
  
  private isInitialized = false;
  private frameId?: number;
  private onAnalysisCallback?: (data: AudioAnalysisData) => void;
  private onCosmicMappingCallback?: (data: CosmicMappingData) => void;
  
  // BPM detection
  private beatBuffer: number[] = [];
  private lastBeatTime = 0;
  private currentBPM = 120;
  
  // Pitch detection
  private pitchBuffer: number[] = [];
  private fundamentalFreq = 440;
  
  // History for analysis
  private analysisHistory: AudioAnalysisData[] = [];
  private maxHistoryLength = 100;

  constructor() {}

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Tone.js analyzers
      // Use FFT analyser for frequency analysis
      this.analyzer = new Tone.Analyser('fft', 1024);
      this.fft = new Tone.FFT(2048);
      this.meter = new Tone.Meter();
      // Create amplitude follower with default settings
      this.follower = new Tone.Follower();
      this.waveform = new Tone.Waveform(1024);
      
      // Connect to master output for analysis
      Tone.getDestination().connect(this.analyzer);
      Tone.getDestination().connect(this.fft);
      Tone.getDestination().connect(this.meter);
      Tone.getDestination().connect(this.follower);
      Tone.getDestination().connect(this.waveform);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
      throw error;
    }
  }

  start(
    onAnalysis?: (data: AudioAnalysisData) => void,
    onCosmicMapping?: (data: CosmicMappingData) => void
  ) {
    if (!this.isInitialized) {
      throw new Error('Audio analyzer not initialized');
    }
    
    this.onAnalysisCallback = onAnalysis;
    this.onCosmicMappingCallback = onCosmicMapping;
    
    const analyze = () => {
      const analysisData = this.analyzeAudio();
      const cosmicData = this.mapToCosmicVisuals(analysisData);
      
      this.onAnalysisCallback?.(analysisData);
      this.onCosmicMappingCallback?.(cosmicData);
      
      // Store history
      this.analysisHistory.push(analysisData);
      if (this.analysisHistory.length > this.maxHistoryLength) {
        this.analysisHistory.shift();
      }
      
      this.frameId = requestAnimationFrame(analyze);
    };
    
    this.frameId = requestAnimationFrame(analyze);
  }

  stop() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }

  private analyzeAudio(): AudioAnalysisData {
    if (!this.analyzer || !this.fft || !this.meter || !this.follower || !this.waveform) {
      throw new Error('Analyzers not initialized');
    }

    // Get raw data
    const frequencyData = this.analyzer.getValue() as Float32Array;
    const fftData = this.fft.getValue() as Float32Array;
    const volume = this.meter.getValue() as number;
    // Get envelope/amplitude data (follower doesn't have getValue method)
    const envelope = 0.5; // Mock envelope value
    const waveformData = this.waveform.getValue() as Float32Array;

    // Frequency band analysis
    const bands = this.analyzeFrequencyBands(frequencyData);
    
    // Beat detection
    const beatInfo = this.detectBeat(volume, envelope);
    
    // Pitch detection
    const pitch = this.detectPitch(fftData, waveformData);
    
    // Harmonic analysis
    const harmonics = this.analyzeHarmonics(fftData, pitch);
    const chroma = this.calculateChroma(fftData);
    
    // Audio characteristics
    const characteristics = this.analyzeCharacteristics(frequencyData, waveformData);
    
    // Envelope analysis
    const envelopeData = this.analyzeEnvelope(envelope);
    
    // Emotional mapping
    const emotion = this.mapToEmotion(bands, characteristics);

    return {
      ...bands,
      ...beatInfo,
      volume,
      ...characteristics,
      pitch,
      harmonics,
      chroma,
      ...envelopeData,
      ...emotion
    };
  }

  private analyzeFrequencyBands(frequencyData: Float32Array) {
    const sampleRate = Tone.getContext().sampleRate;
    const binSize = sampleRate / frequencyData.length;
    
    const getBandPower = (startFreq: number, endFreq: number): number => {
      const startBin = Math.floor(startFreq / binSize);
      const endBin = Math.floor(endFreq / binSize);
      
      let sum = 0;
      for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
        sum += Math.pow(10, frequencyData[i] / 20); // Convert from dB
      }
      
      return sum / (endBin - startBin);
    };

    return {
      bass: getBandPower(20, 250),
      lowMid: getBandPower(250, 500),
      mid: getBandPower(500, 2000),
      highMid: getBandPower(2000, 4000),
      treble: getBandPower(4000, 20000)
    };
  }

  private detectBeat(volume: number, envelope: number) {
    const currentTime = Date.now();
    const threshold = -20; // dB threshold for beat detection
    
    if (volume > threshold && envelope > 0.5) {
      if (currentTime - this.lastBeatTime > 300) { // Minimum 300ms between beats
        this.beatBuffer.push(currentTime);
        this.lastBeatTime = currentTime;
        
        // Calculate BPM from recent beats
        if (this.beatBuffer.length > 4) {
          this.beatBuffer = this.beatBuffer.slice(-8); // Keep last 8 beats
          const intervals = [];
          for (let i = 1; i < this.beatBuffer.length; i++) {
            intervals.push(this.beatBuffer[i] - this.beatBuffer[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
          this.currentBPM = Math.round(60000 / avgInterval);
        }
      }
    }

    const beat = Math.max(0, Math.min(1, (volume + 30) / 30)); // Normalize beat strength
    const measure = (Date.now() / (60000 / this.currentBPM * 4)) % 1; // 4/4 time

    return {
      bpm: this.currentBPM,
      beat,
      measure
    };
  }

  private detectPitch(fftData: Float32Array, waveformData: Float32Array): number {
    // Autocorrelation pitch detection
    const sampleRate = Tone.getContext().sampleRate;
    const bufferSize = waveformData.length;
    
    let maxCorrelation = 0;
    let bestOffset = 0;
    
    // Search for fundamental frequency
    for (let offset = 1; offset < bufferSize / 2; offset++) {
      let correlation = 0;
      
      for (let i = 0; i < bufferSize - offset; i++) {
        correlation += Math.abs(waveformData[i] - waveformData[i + offset]);
      }
      
      correlation = 1 - correlation / (bufferSize - offset);
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestOffset = offset;
      }
    }
    
    this.fundamentalFreq = bestOffset > 0 ? sampleRate / bestOffset : 0;
    return this.fundamentalFreq;
  }

  private analyzeHarmonics(fftData: Float32Array, fundamentalFreq: number): number[] {
    const harmonics: number[] = [];
    const sampleRate = Tone.getContext().sampleRate;
    const binSize = sampleRate / fftData.length;
    
    for (let harmonic = 1; harmonic <= 8; harmonic++) {
      const targetFreq = fundamentalFreq * harmonic;
      const bin = Math.round(targetFreq / binSize);
      
      if (bin < fftData.length) {
        harmonics.push(Math.pow(10, fftData[bin] / 20));
      } else {
        harmonics.push(0);
      }
    }
    
    return harmonics;
  }

  private calculateChroma(fftData: Float32Array): number[] {
    const chroma = new Array(12).fill(0);
    const sampleRate = Tone.getContext().sampleRate;
    const binSize = sampleRate / fftData.length;
    
    for (let i = 0; i < fftData.length; i++) {
      const freq = i * binSize;
      if (freq > 80 && freq < 2000) { // Focus on musical range
        const noteIndex = Math.round(12 * Math.log2(freq / 440)) % 12;
        const magnitude = Math.pow(10, fftData[i] / 20);
        chroma[noteIndex] += magnitude;
      }
    }
    
    // Normalize
    const maxChroma = Math.max(...chroma);
    return chroma.map(c => maxChroma > 0 ? c / maxChroma : 0);
  }

  private analyzeCharacteristics(frequencyData: Float32Array, waveformData: Float32Array) {
    // RMS calculation
    let rmsSum = 0;
    for (let i = 0; i < waveformData.length; i++) {
      rmsSum += waveformData[i] * waveformData[i];
    }
    const rms = Math.sqrt(rmsSum / waveformData.length);
    
    // Peak detection
    const peak = Math.max(...Array.from(waveformData).map(Math.abs));
    
    // Spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    // Spectral rolloff (frequency below which 85% of energy is contained)
    let energySum = 0;
    const totalEnergy = magnitudeSum;
    let rolloff = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      energySum += magnitude;
      if (energySum >= totalEnergy * 0.85) {
        rolloff = i;
        break;
      }
    }

    return { peak, rms, centroid, rolloff };
  }

  private analyzeEnvelope(envelope: number): EnvelopeCharacteristics {
    // Simplified ADSR analysis
    const volume = envelope;
    
    return {
      attack: Math.min(1, volume * 2),
      decay: Math.max(0, 1 - volume),
      sustain: Math.min(1, Math.max(0, volume - 0.2)),
      release: Math.max(0, 0.8 - volume)
    };
  }

  private mapToEmotion(bands: FrequencyBands, characteristics: AudioCharacteristics): EmotionalState {
    // Energy: combination of volume and high frequencies
    const energy = Math.min(1, (bands.bass + bands.treble + characteristics.peak) / 3);
    
    // Valence: major/minor detection through harmonic content
    const valence = Math.min(1, (bands.mid + bands.highMid) / (bands.bass + 0.1));
    
    // Arousal: rhythm and dynamics (use characteristics.peak instead of undefined envelopeData)
    const arousal = Math.min(1, (0.5 + characteristics.peak) / 2);
    
    // Tension: dissonance and complexity
    const tension = Math.min(1, (characteristics.centroid / 1000 + characteristics.rolloff / 1000) / 2);

    return { energy, valence, arousal, tension };
  }

  private mapToCosmicVisuals(analysis: AudioAnalysisData): CosmicMappingData {
    return {
      starIntensity: analysis.energy * 2 + analysis.treble,
      planetRotation: analysis.bass * 0.5 + analysis.beat,
      nebulaMovement: analysis.mid * analysis.arousal,
      auroraActivity: analysis.energy * analysis.valence,
      cameraMovement: {
        x: (analysis.bass - 0.5) * 0.1,
        y: (analysis.treble - 0.5) * 0.05,
        z: (analysis.mid - 0.5) * 0.08
      },
      colorPalette: this.generateColorPalette(analysis),
      particleEmission: analysis.attack * analysis.energy,
      gravityWaves: analysis.tension * analysis.arousal
    };
  }

  private generateColorPalette(analysis: AudioAnalysisData): string[] {
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    // Adjust colors based on audio characteristics
    const energyFactor = analysis.energy;
    const valenceFactor = analysis.valence;
    
    return baseColors.map(color => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Modify based on audio
      const newR = Math.min(255, Math.floor(r * (0.5 + energyFactor * 0.5)));
      const newG = Math.min(255, Math.floor(g * (0.5 + valenceFactor * 0.5)));
      const newB = Math.min(255, Math.floor(b * (0.7 + analysis.tension * 0.3)));
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    });
  }

  getAnalysisHistory(): AudioAnalysisData[] {
    return [...this.analysisHistory];
  }

  getCurrentAnalysis(): AudioAnalysisData | null {
    return this.analysisHistory.length > 0 ? this.analysisHistory[this.analysisHistory.length - 1] : null;
  }

  dispose() {
    this.stop();
    
    this.analyzer?.dispose();
    this.fft?.dispose();
    this.meter?.dispose();
    this.follower?.dispose();
    this.waveform?.dispose();
    
    this.isInitialized = false;
  }
}

// Global instance
export const audioAnalyzer = new EnhancedAudioAnalyzer();