/**
 * Advanced Music Analyzer
 * Provides comprehensive real-time audio analysis including:
 * - Frequency band separation (bass, mid, treble)
 * - Beat detection with tempo tracking
 * - Volume envelope tracking
 * - Spectral analysis
 * - Onset detection
 */

export interface MusicAnalysisData {
  // Frequency bands (0-1)
  bass: number;
  mid: number;
  treble: number;
  
  // Beat detection
  beat: boolean;
  beatStrength: number;
  tempo: number;
  
  // Volume
  volume: number;
  volumeSmooth: number;
  
  // Spectral data
  spectrum: number[]; // Full frequency spectrum
  spectralCentroid: number;
  spectralFlux: number;
  
  // Advanced metrics
  energy: number;
  zcr: number; // Zero crossing rate
  rms: number; // Root mean square
  
  // Time
  timestamp: number;
}

export class AdvancedMusicAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  
  private dataArray: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;
  
  // Beat detection
  private beatHistory: number[] = [];
  private lastBeatTime = 0;
  private tempoHistory: number[] = [];
  
  // Smoothing
  private volumeHistory: number[] = [];
  private bassHistory: number[] = [];
  private midHistory: number[] = [];
  private trebleHistory: number[] = [];
  
  // Previous spectral data for flux calculation
  private previousSpectrum: number[] = [];
  
  // Configuration
  private smoothingFactor = 0.8;
  private beatThreshold = 1.3;
  private beatCooldown = 200; // ms
  
  constructor() {}
  
  /**
   * Initialize analyzer with audio element
   */
  initWithElement(audioElement: HTMLAudioElement): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // High resolution analysis
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);
      this.timeDomainData = new Uint8Array(bufferLength);
      this.previousSpectrum = new Array(bufferLength).fill(0);
      
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }
  
  /**
   * Initialize with Web Audio API AudioNode
   */
  initWithAudioNode(audioNode: AudioNode, audioContext: AudioContext): void {
    try {
      this.audioContext = audioContext;
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      audioNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);
      this.timeDomainData = new Uint8Array(bufferLength);
      this.previousSpectrum = new Array(bufferLength).fill(0);
      
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }
  
  /**
   * Get current music analysis data
   */
  getAnalysis(): MusicAnalysisData {
    if (!this.analyser || !this.frequencyData || !this.timeDomainData) {
      return this.getEmptyAnalysis();
    }
    
    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);
    
    // Calculate frequency bands
    const bass = this.getFrequencyBand(0, 250);
    const mid = this.getFrequencyBand(250, 4000);
    const treble = this.getFrequencyBand(4000, 20000);
    
    // Smooth values
    const smoothBass = this.smooth(bass, this.bassHistory, 5);
    const smoothMid = this.smooth(mid, this.midHistory, 5);
    const smoothTreble = this.smooth(treble, this.trebleHistory, 5);
    
    // Calculate volume
    const volume = this.calculateVolume();
    const volumeSmooth = this.smooth(volume, this.volumeHistory, 10);
    
    // Beat detection
    const { beat, beatStrength } = this.detectBeat(smoothBass, volume);
    const tempo = this.calculateTempo();
    
    // Spectral analysis
    const spectrum = Array.from(this.frequencyData).map(v => v / 255);
    const spectralCentroid = this.calculateSpectralCentroid(spectrum);
    const spectralFlux = this.calculateSpectralFlux(spectrum);
    
    // Advanced metrics
    const energy = this.calculateEnergy();
    const zcr = this.calculateZeroCrossingRate();
    const rms = this.calculateRMS();
    
    // Update previous spectrum for next frame
    this.previousSpectrum = [...spectrum];
    
    return {
      bass: smoothBass,
      mid: smoothMid,
      treble: smoothTreble,
      beat,
      beatStrength,
      tempo,
      volume,
      volumeSmooth,
      spectrum,
      spectralCentroid,
      spectralFlux,
      energy,
      zcr,
      rms,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get frequency band average (Hz to Hz)
   */
  private getFrequencyBand(lowHz: number, highHz: number): number {
    if (!this.analyser || !this.frequencyData) return 0;
    
    const nyquist = this.audioContext!.sampleRate / 2;
    const lowIndex = Math.floor(lowHz / nyquist * this.frequencyData.length);
    const highIndex = Math.ceil(highHz / nyquist * this.frequencyData.length);
    
    let sum = 0;
    let count = 0;
    
    for (let i = lowIndex; i < highIndex && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
      count++;
    }
    
    return count > 0 ? (sum / count / 255) : 0;
  }
  
  /**
   * Calculate overall volume
   */
  private calculateVolume(): number {
    if (!this.frequencyData) return 0;
    
    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    
    return sum / this.frequencyData.length / 255;
  }
  
  /**
   * Smooth value using history
   */
  private smooth(value: number, history: number[], maxLength: number): number {
    history.push(value);
    if (history.length > maxLength) {
      history.shift();
    }
    
    const sum = history.reduce((a, b) => a + b, 0);
    return sum / history.length;
  }
  
  /**
   * Detect beats using bass energy
   */
  private detectBeat(bass: number, volume: number): { beat: boolean; beatStrength: number } {
    const now = Date.now();
    const timeSinceLastBeat = now - this.lastBeatTime;
    
    // Calculate average bass energy
    const avgBass = this.bassHistory.reduce((a, b) => a + b, 0) / Math.max(this.bassHistory.length, 1);
    
    // Beat detected if current bass is significantly higher than average
    const isBeat = bass > avgBass * this.beatThreshold && 
                   timeSinceLastBeat > this.beatCooldown &&
                   volume > 0.1;
    
    if (isBeat) {
      this.beatHistory.push(timeSinceLastBeat);
      if (this.beatHistory.length > 8) {
        this.beatHistory.shift();
      }
      this.lastBeatTime = now;
    }
    
    const beatStrength = isBeat ? Math.min((bass / avgBass) - 1, 1) : 0;
    
    return { beat: isBeat, beatStrength };
  }
  
  /**
   * Calculate tempo (BPM) from beat history
   */
  private calculateTempo(): number {
    if (this.beatHistory.length < 4) return 0;
    
    const avgInterval = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    const bpm = 60000 / avgInterval; // Convert ms to BPM
    
    // Filter unrealistic tempos
    if (bpm < 40 || bpm > 240) return 0;
    
    return Math.round(bpm);
  }
  
  /**
   * Calculate spectral centroid (brightness)
   */
  private calculateSpectralCentroid(spectrum: number[]): number {
    let weightedSum = 0;
    let sum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      weightedSum += spectrum[i] * i;
      sum += spectrum[i];
    }
    
    return sum > 0 ? weightedSum / sum / spectrum.length : 0;
  }
  
  /**
   * Calculate spectral flux (change in spectrum)
   */
  private calculateSpectralFlux(spectrum: number[]): number {
    if (this.previousSpectrum.length !== spectrum.length) return 0;
    
    let flux = 0;
    for (let i = 0; i < spectrum.length; i++) {
      const diff = spectrum[i] - this.previousSpectrum[i];
      flux += diff * diff;
    }
    
    return Math.sqrt(flux / spectrum.length);
  }
  
  /**
   * Calculate energy
   */
  private calculateEnergy(): number {
    if (!this.frequencyData) return 0;
    
    let energy = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      const normalized = this.frequencyData[i] / 255;
      energy += normalized * normalized;
    }
    
    return Math.sqrt(energy / this.frequencyData.length);
  }
  
  /**
   * Calculate zero crossing rate
   */
  private calculateZeroCrossingRate(): number {
    if (!this.timeDomainData) return 0;
    
    let crossings = 0;
    for (let i = 1; i < this.timeDomainData.length; i++) {
      if ((this.timeDomainData[i] >= 128 && this.timeDomainData[i - 1] < 128) ||
          (this.timeDomainData[i] < 128 && this.timeDomainData[i - 1] >= 128)) {
        crossings++;
      }
    }
    
    return crossings / this.timeDomainData.length;
  }
  
  /**
   * Calculate RMS (root mean square)
   */
  private calculateRMS(): number {
    if (!this.timeDomainData) return 0;
    
    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const normalized = (this.timeDomainData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    
    return Math.sqrt(sum / this.timeDomainData.length);
  }
  
  /**
   * Get empty analysis data
   */
  private getEmptyAnalysis(): MusicAnalysisData {
    return {
      bass: 0,
      mid: 0,
      treble: 0,
      beat: false,
      beatStrength: 0,
      tempo: 0,
      volume: 0,
      volumeSmooth: 0,
      spectrum: [],
      spectralCentroid: 0,
      spectralFlux: 0,
      energy: 0,
      zcr: 0,
      rms: 0,
      timestamp: Date.now()
    };
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
let analyzerInstance: AdvancedMusicAnalyzer | null = null;

export function getGlobalMusicAnalyzer(): AdvancedMusicAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new AdvancedMusicAnalyzer();
  }
  return analyzerInstance;
}
