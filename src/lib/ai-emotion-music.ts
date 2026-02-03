/**
 * AI Emotion Detection & Procedural Music Generation
 * Machine learning-based emotion analysis and generative music system
 */

import * as Tone from 'tone';
import type { EmotionType } from './advanced-particle-engine';

export interface EmotionAnalysisResult {
  primary: EmotionType;
  secondary?: EmotionType;
  confidence: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (energetic)
  dominance: number; // 0 (submissive) to 1 (dominant)
  timestamp: number;
}

export interface MusicGenerationParams {
  tempo: number;
  key: string;
  scale: 'major' | 'minor' | 'pentatonic' | 'blues' | 'chromatic';
  complexity: number; // 0-1
  duration: number; // seconds
  emotionalIntensity: number; // 0-1
}

export class EmotionDetector {
  private history: EmotionAnalysisResult[] = [];
  private maxHistoryLength: number = 100;
  
  // Emotion mapping based on circumplex model
  private emotionMap: Map<EmotionType, { valence: number; arousal: number; dominance: number }> = new Map([
    ['joy', { valence: 0.8, arousal: 0.7, dominance: 0.6 }],
    ['excitement', { valence: 0.7, arousal: 0.9, dominance: 0.7 }],
    ['calm', { valence: 0.4, arousal: 0.2, dominance: 0.5 }],
    ['peace', { valence: 0.6, arousal: 0.1, dominance: 0.4 }],
    ['sadness', { valence: -0.6, arousal: 0.3, dominance: 0.3 }],
    ['fear', { valence: -0.5, arousal: 0.8, dominance: 0.2 }],
    ['anger', { valence: -0.7, arousal: 0.9, dominance: 0.9 }],
    ['love', { valence: 0.9, arousal: 0.5, dominance: 0.6 }],
  ]);
  
  /**
   * Analyze text input for emotional content
   */
  public analyzeText(text: string): EmotionAnalysisResult {
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple keyword-based analysis (in production, use a proper NLP model)
    const emotionScores = new Map<EmotionType, number>();
    
    const emotionKeywords = {
      joy: ['happy', 'joyful', 'delighted', 'pleased', 'cheerful', 'glad', 'amazing', 'wonderful'],
      excitement: ['excited', 'thrilled', 'energetic', 'enthusiastic', 'hyped', 'pumped'],
      calm: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'quiet'],
      peace: ['peace', 'harmony', 'balance', 'zen', 'mindful'],
      sadness: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'melancholy', 'sorrow'],
      fear: ['afraid', 'scared', 'fearful', 'anxious', 'worried', 'nervous', 'terrified'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage'],
      love: ['love', 'adore', 'cherish', 'affection', 'care', 'devoted', 'romantic'],
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (words.includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        emotionScores.set(emotion as EmotionType, score);
      }
    }
    
    // Find primary emotion
    let primary: EmotionType = 'calm';
    let maxScore = 0;
    
    for (const [emotion, score] of emotionScores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion;
      }
    }
    
    // Get emotion characteristics
    const characteristics = this.emotionMap.get(primary) || { valence: 0, arousal: 0.5, dominance: 0.5 };
    
    const result: EmotionAnalysisResult = {
      primary,
      confidence: Math.min(maxScore / 3, 1),
      valence: characteristics.valence,
      arousal: characteristics.arousal,
      dominance: characteristics.dominance,
      timestamp: Date.now(),
    };
    
    this.addToHistory(result);
    return result;
  }
  
  /**
   * Analyze audio features for emotion
   */
  public analyzeAudio(frequencyData: Uint8Array, tempo: number): EmotionAnalysisResult {
    // Calculate spectral features
    const bass = this.getFrequencyRange(frequencyData, 0, 100);
    const mid = this.getFrequencyRange(frequencyData, 100, 500);
    const high = this.getFrequencyRange(frequencyData, 500, frequencyData.length);
    
    const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
    const energy = this.calculateEnergy(frequencyData);
    
    // Map audio features to emotional dimensions
    const arousal = Math.min(1, (tempo / 180) * 0.5 + energy * 0.5);
    const valence = (high / (bass + 0.1)) * 0.5 + (spectralCentroid / frequencyData.length) * 0.5;
    const dominance = bass * 0.7 + energy * 0.3;
    
    // Find closest emotion
    let closestEmotion: EmotionType = 'calm';
    let minDistance = Infinity;
    
    for (const [emotion, characteristics] of this.emotionMap.entries()) {
      const distance = Math.sqrt(
        Math.pow(valence - characteristics.valence, 2) +
        Math.pow(arousal - characteristics.arousal, 2) +
        Math.pow(dominance - characteristics.dominance, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEmotion = emotion;
      }
    }
    
    const result: EmotionAnalysisResult = {
      primary: closestEmotion,
      confidence: Math.max(0, 1 - minDistance / 2),
      valence: valence * 2 - 1, // Normalize to -1 to 1
      arousal,
      dominance,
      timestamp: Date.now(),
    };
    
    this.addToHistory(result);
    return result;
  }
  
  private getFrequencyRange(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end && i < data.length; i++) {
      sum += data[i];
    }
    return (sum / (end - start)) / 255;
  }
  
  private calculateSpectralCentroid(data: Uint8Array): number {
    let weightedSum = 0;
    let sum = 0;
    
    for (let i = 0; i < data.length; i++) {
      weightedSum += i * data[i];
      sum += data[i];
    }
    
    return sum > 0 ? weightedSum / sum : 0;
  }
  
  private calculateEnergy(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length) / 255;
  }
  
  private addToHistory(result: EmotionAnalysisResult): void {
    this.history.push(result);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }
  
  /**
   * Get emotion trend over time
   */
  public getEmotionTrend(durationMs: number = 60000): EmotionType[] {
    const cutoffTime = Date.now() - durationMs;
    return this.history
      .filter(r => r.timestamp > cutoffTime)
      .map(r => r.primary);
  }
  
  /**
   * Get average emotional state
   */
  public getAverageEmotion(): EmotionAnalysisResult {
    if (this.history.length === 0) {
      return {
        primary: 'calm',
        confidence: 0,
        valence: 0,
        arousal: 0.5,
        dominance: 0.5,
        timestamp: Date.now(),
      };
    }
    
    let avgValence = 0;
    let avgArousal = 0;
    let avgDominance = 0;
    
    for (const result of this.history) {
      avgValence += result.valence;
      avgArousal += result.arousal;
      avgDominance += result.dominance;
    }
    
    avgValence /= this.history.length;
    avgArousal /= this.history.length;
    avgDominance /= this.history.length;
    
    // Find closest emotion
    let closestEmotion: EmotionType = 'calm';
    let minDistance = Infinity;
    
    for (const [emotion, characteristics] of this.emotionMap.entries()) {
      const distance = Math.sqrt(
        Math.pow(avgValence - characteristics.valence, 2) +
        Math.pow(avgArousal - characteristics.arousal, 2) +
        Math.pow(avgDominance - characteristics.dominance, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestEmotion = emotion;
      }
    }
    
    return {
      primary: closestEmotion,
      confidence: 0.8,
      valence: avgValence,
      arousal: avgArousal,
      dominance: avgDominance,
      timestamp: Date.now(),
    };
  }
}

/**
 * Procedural Music Generator
 */
export class ProceduralMusicGenerator {
  private synths: Tone.PolySynth[] = [];
  private sequences: Tone.Sequence[] = [];
  
  // Musical scales
  private scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  };
  
  /**
   * Generate music based on emotion
   */
  public generateFromEmotion(emotion: EmotionAnalysisResult, duration: number = 60): void {
    const params = this.emotionToMusicParams(emotion);
    this.generate(params, duration);
  }
  
  private emotionToMusicParams(emotion: EmotionAnalysisResult): MusicGenerationParams {
    // Map emotion to musical parameters
    const tempo = 60 + emotion.arousal * 120; // 60-180 BPM
    const key = emotion.valence > 0 ? 'C' : 'A';
    const scale = emotion.valence > 0 ? 'major' : 'minor';
    const complexity = emotion.arousal * 0.7 + Math.abs(emotion.valence) * 0.3;
    const emotionalIntensity = Math.abs(emotion.valence) * 0.5 + emotion.arousal * 0.5;
    
    return {
      tempo,
      key,
      scale,
      complexity,
      duration: 60,
      emotionalIntensity,
    };
  }
  
  /**
   * Generate procedural music
   */
  public generate(params: MusicGenerationParams, duration: number): void {
    // Set tempo
    Tone.getTransport().bpm.value = params.tempo;
    
    // Create synths
    const leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 1,
      },
    }).toDestination();
    
    const padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.7,
        release: 2,
      },
      volume: -12,
    }).toDestination();
    
    const bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.8,
      },
      volume: -6,
    }).toDestination();
    
    this.synths.push(leadSynth, padSynth);
    
    // Generate melody
    const melody = this.generateMelody(params, 16);
    const harmony = this.generateHarmony(params, 8);
    const bassline = this.generateBassline(params, 4);
    
    // Create sequences
    const melodySeq = new Tone.Sequence(
      (time, note) => {
        if (note) {
          leadSynth.triggerAttackRelease(note, '8n', time);
        }
      },
      melody,
      '8n'
    );
    
    const harmonySeq = new Tone.Sequence(
      (time, notes) => {
        if (notes) {
          padSynth.triggerAttackRelease(notes, '2n', time);
        }
      },
      harmony,
      '2n'
    );
    
    const bassSeq = new Tone.Sequence(
      (time, note) => {
        if (note) {
          bassSynth.triggerAttackRelease(note, '4n', time);
        }
      },
      bassline,
      '4n'
    );
    
    this.sequences.push(melodySeq, harmonySeq, bassSeq);
    
    // Start sequences
    melodySeq.start(0);
    harmonySeq.start(0);
    bassSeq.start(0);
    
    // Start transport
    Tone.getTransport().start();
    
    // Stop after duration
    setTimeout(() => {
      this.stop();
    }, duration * 1000);
  }
  
  private generateMelody(params: MusicGenerationParams, length: number): (string | null)[] {
    const scale = this.scales[params.scale];
    const octave = params.emotionalIntensity > 0.5 ? 5 : 4;
    const melody: (string | null)[] = [];
    
    for (let i = 0; i < length; i++) {
      // Random walk with tendency to return to tonic
      const shouldRest = Math.random() > (0.3 + params.complexity * 0.5);
      
      if (shouldRest) {
        const degree = Math.floor(Math.random() * scale.length);
        const note = this.degreeToNote(params.key, scale[degree], octave);
        melody.push(note);
      } else {
        melody.push(null);
      }
    }
    
    return melody;
  }
  
  private generateHarmony(params: MusicGenerationParams, length: number): (string[] | null)[] {
    const scale = this.scales[params.scale];
    const harmony: (string[] | null)[] = [];
    const octave = 3;
    
    for (let i = 0; i < length; i++) {
      const root = scale[Math.floor(Math.random() * scale.length)];
      const third = scale[(scale.indexOf(root) + 2) % scale.length];
      const fifth = scale[(scale.indexOf(root) + 4) % scale.length];
      
      const chord = [
        this.degreeToNote(params.key, root, octave),
        this.degreeToNote(params.key, third, octave),
        this.degreeToNote(params.key, fifth, octave),
      ];
      
      harmony.push(chord);
    }
    
    return harmony;
  }
  
  private generateBassline(params: MusicGenerationParams, length: number): string[] {
    const scale = this.scales[params.scale];
    const bassline: string[] = [];
    const octave = 2;
    
    for (let i = 0; i < length; i++) {
      const degree = i % 2 === 0 ? scale[0] : scale[4 % scale.length];
      const note = this.degreeToNote(params.key, degree, octave);
      bassline.push(note);
    }
    
    return bassline;
  }
  
  private degreeToNote(key: string, degree: number, octave: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = notes.indexOf(key);
    const noteIndex = (keyIndex + degree) % 12;
    const noteOctave = octave + Math.floor((keyIndex + degree) / 12);
    
    return `${notes[noteIndex]}${noteOctave}`;
  }
  
  public stop(): void {
    // Stop all sequences
    this.sequences.forEach(seq => {
      seq.stop();
      seq.dispose();
    });
    this.sequences = [];
    
    // Dispose synths
    this.synths.forEach(synth => synth.dispose());
    this.synths = [];
    
    // Stop transport
    Tone.getTransport().stop();
  }
  
  public dispose(): void {
    this.stop();
  }
}

/**
 * Integrated AI music system
 */
export class AIEnhancedMusicSystem {
  private emotionDetector: EmotionDetector;
  private musicGenerator: ProceduralMusicGenerator;
  private isGenerating: boolean = false;
  
  constructor() {
    this.emotionDetector = new EmotionDetector();
    this.musicGenerator = new ProceduralMusicGenerator();
  }
  
  /**
   * Analyze emotion and generate matching music
   */
  public async createEmotionalSoundscape(input: string | Uint8Array, tempo?: number): Promise<void> {
    let emotion: EmotionAnalysisResult;
    
    if (typeof input === 'string') {
      emotion = this.emotionDetector.analyzeText(input);
    } else {
      emotion = this.emotionDetector.analyzeAudio(input, tempo || 120);
    }
    
    console.log(`Detected emotion: ${emotion.primary} (${(emotion.confidence * 100).toFixed(0)}% confidence)`);
    
    if (!this.isGenerating) {
      this.isGenerating = true;
      this.musicGenerator.generateFromEmotion(emotion);
    }
  }
  
  public getEmotionDetector(): EmotionDetector {
    return this.emotionDetector;
  }
  
  public getMusicGenerator(): ProceduralMusicGenerator {
    return this.musicGenerator;
  }
  
  public stop(): void {
    this.musicGenerator.stop();
    this.isGenerating = false;
  }
  
  public dispose(): void {
    this.musicGenerator.dispose();
  }
}
