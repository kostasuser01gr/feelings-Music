/**
 * Advanced Audio Engine with AI-powered analysis, harmonic processing,
 * and predictive pattern recognition for enhanced cosmic visualization
 */

import * as Tone from 'tone';
import { AudioAnalysisData } from './enhanced-audio-analyzer';

export interface HarmonicAnalysisData {
  fundamentalFrequency: number;
  harmonicSeries: number[];
  harmonicStrengths: number[];
  inharmonicity: number;
  spectralCentroid: number;
  spectralSpread: number;
  spectralFlux: number;
  zeroCrossingRate: number;
  mfcc: number[]; // Mel-frequency cepstral coefficients
  chordProgression: string[];
  keySignature: string;
  musicalMode: string;
}

export interface PredictiveAudioData {
  nextBeat: number;
  nextChordChange: number;
  energyTrend: 'rising' | 'falling' | 'stable';
  emotionalArc: string;
  recommendedVisualEffects: string[];
  predictedDuration: number;
}

export interface SpatialAudioData {
  soundSources: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    intensity: number;
    frequency: number;
  }>;
  acousticEnvironment: 'space' | 'cathedral' | 'concert_hall' | 'nature';
  reverberation: number;
  spatialWidth: number;
}

export class AdvancedAudioEngine {
  private harmonicAnalyzer?: HarmonicAnalyzer;
  private patternPredictor?: AudioPatternPredictor;
  private spatialProcessor?: SpatialAudioProcessor;
  private aiComposer?: AIComposer;
  
  private isInitialized = false;
  private analysisBuffer: Float32Array[] = [];
  private predictionModel?: any; // TensorFlow.js model
  
  constructor() {}

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.harmonicAnalyzer = new HarmonicAnalyzer();
      this.patternPredictor = new AudioPatternPredictor();
      this.spatialProcessor = new SpatialAudioProcessor();
      this.aiComposer = new AIComposer();
      
      // Load pre-trained ML model for pattern prediction
      await this.loadPredictionModel();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize advanced audio engine:', error);
      throw error;
    }
  }

  async loadPredictionModel() {
    try {
      // In a real implementation, this would load a pre-trained TensorFlow.js model
      this.predictionModel = {
        predict: (inputData: number[]) => {
          // Mock prediction - replace with actual model inference
          return {
            nextBeat: Date.now() + Math.random() * 2000,
            energyTrend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
            emotionalArc: 'building_tension'
          };
        }
      };
    } catch (error) {
      console.warn('Could not load prediction model, using fallback:', error);
    }
  }

  analyzeAdvancedAudio(
    audioData: AudioAnalysisData,
    frequencyData: Float32Array,
    waveformData: Float32Array
  ): {
    harmonic: HarmonicAnalysisData;
    predictive: PredictiveAudioData;
    spatial: SpatialAudioData;
  } {
    if (!this.isInitialized) {
      throw new Error('Advanced audio engine not initialized');
    }

    // Store analysis history for pattern recognition
    this.analysisBuffer.push(frequencyData.slice());
    if (this.analysisBuffer.length > 100) {
      this.analysisBuffer.shift();
    }

    const harmonic = this.harmonicAnalyzer!.analyze(frequencyData, waveformData);
    const predictive = this.patternPredictor!.predict(this.analysisBuffer, audioData);
    const spatial = this.spatialProcessor!.process(frequencyData, audioData);

    return { harmonic, predictive, spatial };
  }

  generateAdaptiveMusic(currentAnalysis: AudioAnalysisData): Tone.ToneAudioBuffer | null {
    if (!this.aiComposer) return null;
    return this.aiComposer.compose(currentAnalysis);
  }

  dispose() {
    this.harmonicAnalyzer?.dispose();
    this.patternPredictor?.dispose();
    this.spatialProcessor?.dispose();
    this.aiComposer?.dispose();
    this.isInitialized = false;
  }
}

class HarmonicAnalyzer {
  private window: Float32Array;
  
  constructor() {
    this.window = this.createHannWindow(2048);
  }

  analyze(frequencyData: Float32Array, waveformData: Float32Array): HarmonicAnalysisData {
    const fundamental = this.detectFundamental(frequencyData);
    const harmonics = this.extractHarmonics(frequencyData, fundamental);
    const mfcc = this.calculateMFCC(frequencyData);
    const musicalFeatures = this.analyzeMusicalFeatures(frequencyData);

    return {
      fundamentalFrequency: fundamental,
      harmonicSeries: harmonics.frequencies,
      harmonicStrengths: harmonics.strengths,
      inharmonicity: this.calculateInharmonicity(harmonics),
      spectralCentroid: this.calculateSpectralCentroid(frequencyData),
      spectralSpread: this.calculateSpectralSpread(frequencyData),
      spectralFlux: this.calculateSpectralFlux(frequencyData),
      zeroCrossingRate: this.calculateZeroCrossingRate(waveformData),
      mfcc,
      chordProgression: musicalFeatures.chords,
      keySignature: musicalFeatures.key,
      musicalMode: musicalFeatures.mode
    };
  }

  private detectFundamental(frequencyData: Float32Array): number {
    // Harmonic Product Spectrum method
    const length = Math.floor(frequencyData.length / 8);
    const product = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      product[i] = 1;
      for (let harmonic = 1; harmonic <= 8; harmonic++) {
        const index = Math.floor(i * harmonic);
        if (index < frequencyData.length) {
          product[i] *= Math.pow(10, frequencyData[index] / 20);
        }
      }
    }

    // Find peak in product spectrum
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 10; i < length; i++) { // Skip very low frequencies
      if (product[i] > maxValue) {
        maxValue = product[i];
        maxIndex = i;
      }
    }

    const sampleRate = Tone.getContext().sampleRate;
    return (maxIndex * sampleRate) / (frequencyData.length * 2);
  }

  private extractHarmonics(frequencyData: Float32Array, fundamental: number) {
    const harmonics = { frequencies: [] as number[], strengths: [] as number[] };
    const sampleRate = Tone.getContext().sampleRate;
    const binSize = sampleRate / frequencyData.length;

    for (let h = 1; h <= 16; h++) {
      const targetFreq = fundamental * h;
      const bin = Math.round(targetFreq / binSize);
      
      if (bin < frequencyData.length) {
        // Safe property access for harmonics arrays
        const frequencies = harmonics.frequencies as number[];
        const strengths = harmonics.strengths as number[];
        frequencies.push(targetFreq);
        strengths.push(Math.pow(10, frequencyData[bin] / 20));
      }
    }

    return harmonics;
  }

  private calculateMFCC(frequencyData: Float32Array): number[] {
    // Simplified MFCC calculation
    const melFilters = this.createMelFilterBank(frequencyData.length, 13);
    const mfcc = [];

    for (let i = 0; i < melFilters.length; i++) {
      let filterOutput = 0;
      for (let j = 0; j < frequencyData.length; j++) {
        filterOutput += melFilters[i][j] * Math.pow(10, frequencyData[j] / 20);
      }
      mfcc.push(Math.log(Math.max(filterOutput, 1e-10)));
    }

    // Apply DCT
    return this.applyDCT(mfcc);
  }

  private createMelFilterBank(numBins: number, numFilters: number): number[][] {
    const melFilters = [];
    const sampleRate = Tone.getContext().sampleRate;
    
    // Mel scale conversion
    const melScale = (freq: number) => 2595 * Math.log10(1 + freq / 700);
    const invMelScale = (mel: number) => 700 * (Math.pow(10, mel / 2595) - 1);
    
    const minMel = melScale(0);
    const maxMel = melScale(sampleRate / 2);
    const melPoints = [];
    
    for (let i = 0; i <= numFilters + 1; i++) {
      melPoints.push(invMelScale(minMel + (maxMel - minMel) * i / (numFilters + 1)));
    }
    
    for (let i = 1; i <= numFilters; i++) {
      const filter = new Array(numBins).fill(0);
      const leftFreq = melPoints[i - 1];
      const centerFreq = melPoints[i];
      const rightFreq = melPoints[i + 1];
      
      for (let j = 0; j < numBins; j++) {
        const freq = (j * sampleRate) / (2 * numBins);
        
        if (freq >= leftFreq && freq <= rightFreq) {
          if (freq <= centerFreq) {
            filter[j] = (freq - leftFreq) / (centerFreq - leftFreq);
          } else {
            filter[j] = (rightFreq - freq) / (rightFreq - centerFreq);
          }
        }
      }
      
      melFilters.push(filter);
    }
    
    return melFilters;
  }

  private applyDCT(input: number[]): number[] {
    const output = [];
    const N = input.length;
    
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += input[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
      }
      output.push(sum);
    }
    
    return output;
  }

  private calculateInharmonicity(harmonics: { frequencies: number[]; strengths: number[] }): number {
    if (harmonics.frequencies.length < 2) return 0;
    
    const fundamental = harmonics.frequencies[0];
    let inharmonicity = 0;
    
    for (let i = 1; i < harmonics.frequencies.length; i++) {
      const expectedFreq = fundamental * (i + 1);
      const actualFreq = harmonics.frequencies[i];
      const deviation = Math.abs(actualFreq - expectedFreq) / expectedFreq;
      inharmonicity += deviation * harmonics.strengths[i];
    }
    
    return inharmonicity / harmonics.frequencies.length;
  }

  private calculateSpectralCentroid(frequencyData: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  private calculateSpectralSpread(frequencyData: Float32Array): number {
    const centroid = this.calculateSpectralCentroid(frequencyData);
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      weightedSum += Math.pow(i - centroid, 2) * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? Math.sqrt(weightedSum / magnitudeSum) : 0;
  }

  private calculateSpectralFlux(frequencyData: Float32Array): number {
    // This would require previous frame data in a real implementation
    // For now, calculate variation within current frame
    let flux = 0;
    for (let i = 1; i < frequencyData.length; i++) {
      const diff = Math.pow(10, frequencyData[i] / 20) - Math.pow(10, frequencyData[i - 1] / 20);
      flux += Math.pow(Math.max(0, diff), 2);
    }
    return Math.sqrt(flux);
  }

  private calculateZeroCrossingRate(waveformData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < waveformData.length; i++) {
      if ((waveformData[i] >= 0) !== (waveformData[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / (waveformData.length - 1);
  }

  private analyzeMusicalFeatures(frequencyData: Float32Array) {
    // Simplified chord and key detection
    const chroma = this.calculateChromaVector(frequencyData);
    const key = this.detectKey(chroma);
    const mode = this.detectMode(chroma);
    const chords = this.detectChords(chroma);

    return { key, mode, chords };
  }

  private calculateChromaVector(frequencyData: Float32Array): number[] {
    const chroma = new Array(12).fill(0);
    const sampleRate = Tone.getContext().sampleRate;
    const binSize = sampleRate / frequencyData.length;

    for (let i = 0; i < frequencyData.length; i++) {
      const freq = i * binSize;
      if (freq > 80 && freq < 2000) {
        const noteClass = Math.round(12 * Math.log2(freq / 440)) % 12;
        const magnitude = Math.pow(10, frequencyData[i] / 20);
        chroma[noteClass] += magnitude;
      }
    }

    // Normalize
    const sum = chroma.reduce((a, b) => a + b, 0);
    return chroma.map(x => sum > 0 ? x / sum : 0);
  }

  private detectKey(chroma: number[]): string {
    const keyProfiles = {
      'C major': [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
      'C minor': [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
      // Add more key profiles...
    };

    let bestKey = 'C major';
    let bestCorrelation = -1;

    Object.entries(keyProfiles).forEach(([key, profile]) => {
      const correlation = this.calculateCorrelation(chroma, profile);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestKey = key;
      }
    });

    return bestKey;
  }

  private detectMode(chroma: number[]): string {
    // Simplified mode detection based on interval patterns
    const majorPattern = [2, 2, 1, 2, 2, 2, 1];
    const minorPattern = [2, 1, 2, 2, 1, 2, 2];
    
    // This would be more sophisticated in a real implementation
    return chroma[0] + chroma[4] + chroma[7] > chroma[2] + chroma[5] + chroma[9] ? 'major' : 'minor';
  }

  private detectChords(chroma: number[]): string[] {
    // Simplified chord detection
    const chords = [];
    
    // Major triad detection
    if (chroma[0] > 0.1 && chroma[4] > 0.1 && chroma[7] > 0.1) {
      chords.push('C major');
    }
    
    // Minor triad detection
    if (chroma[0] > 0.1 && chroma[3] > 0.1 && chroma[7] > 0.1) {
      chords.push('C minor');
    }
    
    return chords;
  }

  private calculateCorrelation(a: number[], b: number[]): number {
    const meanA = a.reduce((sum, val) => sum + val, 0) / a.length;
    const meanB = b.reduce((sum, val) => sum + val, 0) / b.length;
    
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    
    for (let i = 0; i < a.length; i++) {
      const diffA = a[i] - meanA;
      const diffB = b[i] - meanB;
      numerator += diffA * diffB;
      denomA += diffA * diffA;
      denomB += diffB * diffB;
    }
    
    return numerator / Math.sqrt(denomA * denomB);
  }

  private createHannWindow(size: number): Float32Array {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
    }
    return window;
  }

  dispose() {
    // Cleanup resources
  }
}

class AudioPatternPredictor {
  private beatHistory: number[] = [];
  private chordHistory: string[] = [];
  private energyHistory: number[] = [];

  predict(analysisBuffer: Float32Array[], currentAnalysis: AudioAnalysisData): PredictiveAudioData {
    this.updateHistory(currentAnalysis);
    
    const nextBeat = this.predictNextBeat();
    const nextChordChange = this.predictChordChange();
    const energyTrend = this.analyzeEnergyTrend();
    const emotionalArc = this.predictEmotionalArc();
    const visualEffects = this.recommendVisualEffects(currentAnalysis);
    
    return {
      nextBeat,
      nextChordChange,
      energyTrend,
      emotionalArc,
      recommendedVisualEffects: visualEffects,
      predictedDuration: this.estimateDuration()
    };
  }

  private updateHistory(analysis: AudioAnalysisData) {
    this.beatHistory.push(Date.now());
    this.energyHistory.push(analysis.energy);
    
    // Keep only recent history
    if (this.beatHistory.length > 50) this.beatHistory.shift();
    if (this.energyHistory.length > 100) this.energyHistory.shift();
  }

  private predictNextBeat(): number {
    if (this.beatHistory.length < 2) return Date.now() + 500;
    
    // Calculate average interval
    const intervals = [];
    for (let i = 1; i < this.beatHistory.length; i++) {
      intervals.push(this.beatHistory[i] - this.beatHistory[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return this.beatHistory[this.beatHistory.length - 1] + avgInterval;
  }

  private predictChordChange(): number {
    // Simplified chord change prediction
    return Date.now() + Math.random() * 4000 + 2000;
  }

  private analyzeEnergyTrend(): 'rising' | 'falling' | 'stable' {
    if (this.energyHistory.length < 10) return 'stable';
    
    const recent = this.energyHistory.slice(-10);
    const trend = recent[recent.length - 1] - recent[0];
    
    if (trend > 0.1) return 'rising';
    if (trend < -0.1) return 'falling';
    return 'stable';
  }

  private predictEmotionalArc(): string {
    const trends = ['building_tension', 'climax', 'resolution', 'calm', 'excitement'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private recommendVisualEffects(analysis: AudioAnalysisData): string[] {
    const effects = [];
    
    if (analysis.energy > 0.7) effects.push('intense_particles');
    if (analysis.bass > 0.6) effects.push('gravity_waves');
    if (analysis.treble > 0.5) effects.push('star_burst');
    if (analysis.valence > 0.7) effects.push('aurora_enhancement');
    
    return effects;
  }

  private estimateDuration(): number {
    // Estimate remaining duration based on energy patterns
    return 120000; // 2 minutes default
  }

  dispose() {
    this.beatHistory = [];
    this.chordHistory = [];
    this.energyHistory = [];
  }
}

class SpatialAudioProcessor {
  process(frequencyData: Float32Array, audioData: AudioAnalysisData): SpatialAudioData {
    const soundSources = this.identifySoundSources(frequencyData);
    const environment = this.classifyAcousticEnvironment(audioData);
    const reverberation = this.calculateReverberation(frequencyData);
    const spatialWidth = this.calculateSpatialWidth(frequencyData);

    return {
      soundSources,
      acousticEnvironment: environment,
      reverberation,
      spatialWidth
    };
  }

  private identifySoundSources(frequencyData: Float32Array) {
    const sources = [];
    
    // Identify distinct frequency peaks as sound sources
    for (let i = 10; i < frequencyData.length - 10; i++) {
      const current = Math.pow(10, frequencyData[i] / 20);
      const isLocalMax = current > Math.pow(10, frequencyData[i - 1] / 20) && 
                        current > Math.pow(10, frequencyData[i + 1] / 20);
      
      if (isLocalMax && current > 0.1) {
        sources.push({
          id: `source_${i}`,
          position: {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 10
          },
          intensity: current,
          frequency: (i * Tone.getContext().sampleRate) / (frequencyData.length * 2)
        });
      }
    }
    
    return sources.slice(0, 8); // Limit to 8 sources for performance
  }

  private classifyAcousticEnvironment(audioData: AudioAnalysisData): 'space' | 'cathedral' | 'concert_hall' | 'nature' {
    if (audioData.valence > 0.7 && audioData.energy < 0.3) return 'nature';
    // Use tension as reverb approximation since reverb property doesn't exist
    if (audioData.tension > 0.7) return 'cathedral';
    if (audioData.energy > 0.6) return 'concert_hall';
    return 'space';
  }

  private calculateReverberation(frequencyData: Float32Array): number {
    // Estimate reverberation time from frequency decay
    let totalDecay = 0;
    for (let i = 1; i < frequencyData.length; i++) {
      totalDecay += Math.abs(frequencyData[i] - frequencyData[i - 1]);
    }
    return Math.min(1, totalDecay / frequencyData.length);
  }

  private calculateSpatialWidth(frequencyData: Float32Array): number {
    // Calculate stereo width estimation
    return 0.5 + Math.random() * 0.5; // Simplified
  }
}

class AIComposer {
  compose(analysis: AudioAnalysisData): Tone.ToneAudioBuffer {
    // This would generate adaptive music based on current analysis
    // For now, return empty buffer
    return new Tone.ToneAudioBuffer();
  }
}

// Global instance
export const advancedAudioEngine = new AdvancedAudioEngine();