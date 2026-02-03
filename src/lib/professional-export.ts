/**
 * Professional Export & Integration Tools
 * Animation export, DAW sync, custom shader programming interface
 */

import * as THREE from 'three';
import * as Tone from 'tone';

export interface AnimationFrame {
  timestamp: number;
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Euler;
  objectStates: Map<string, {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
  }>;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif' | 'png-sequence';
  resolution: { width: number; height: number };
  framerate: number;
  duration: number;
  quality: number; // 0-1
}

/**
 * Animation Recorder & Exporter
 */
export class AnimationExporter {
  private frames: AnimationFrame[] = [];
  private isRecording: boolean = false;
  private startTime: number = 0;
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
  
  /**
   * Start recording animation
   */
  public startRecording(settings: Partial<ExportSettings> = {}): void {
    this.frames = [];
    this.isRecording = true;
    this.startTime = performance.now();
    
    const fullSettings: ExportSettings = {
      format: settings.format || 'webm',
      resolution: settings.resolution || { width: 1920, height: 1080 },
      framerate: settings.framerate || 60,
      duration: settings.duration || 10,
      quality: settings.quality || 0.9,
    };
    
    // Setup MediaRecorder for video export
    if (fullSettings.format === 'webm' || fullSettings.format === 'mp4') {
      const stream = this.canvas.captureStream(fullSettings.framerate);
      
      const options = {
        mimeType: fullSettings.format === 'webm' ? 'video/webm;codecs=vp9' : 'video/mp4',
        videoBitsPerSecond: 8000000, // 8 Mbps
      };
      
      try {
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.recordedChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        
        this.mediaRecorder.start();
      } catch (error) {
        console.error('MediaRecorder not supported:', error);
      }
    }
    
    console.log('Recording started');
  }
  
  /**
   * Capture current frame
   */
  public captureFrame(camera: THREE.Camera, scene: THREE.Scene): void {
    if (!this.isRecording) return;
    
    const timestamp = performance.now() - this.startTime;
    
    const frame: AnimationFrame = {
      timestamp,
      cameraPosition: camera.position.clone(),
      cameraRotation: camera.rotation.clone(),
      objectStates: new Map(),
    };
    
    // Capture object states
    scene.traverse((object) => {
      if (object.name) {
        frame.objectStates.set(object.name, {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
        });
      }
    });
    
    this.frames.push(frame);
  }
  
  /**
   * Stop recording and export
   */
  public async stopRecording(): Promise<Blob | null> {
    this.isRecording = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder!.mimeType,
          });
          resolve(blob);
        };
        
        this.mediaRecorder!.stop();
      });
    }
    
    console.log(`Recording stopped. Captured ${this.frames.length} frames`);
    return null;
  }
  
  /**
   * Export as PNG sequence
   */
  public async exportPNGSequence(): Promise<Blob[]> {
    const blobs: Blob[] = [];
    
    for (const frame of this.frames) {
      const blob = await new Promise<Blob>((resolve) => {
        this.canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      blobs.push(blob);
    }
    
    return blobs;
  }
  
  /**
   * Download exported video/images
   */
  public download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  public getFrames(): AnimationFrame[] {
    return this.frames;
  }
}

/**
 * DAW (Digital Audio Workstation) Sync System
 */
export class DAWSyncSystem {
  private tempo: number = 120;
  private timeSignature: [number, number] = [4, 4];
  private isPlaying: boolean = false;
  private currentBar: number = 0;
  private currentBeat: number = 0;
  private callbacks: Map<string, (bar: number, beat: number) => void> = new Map();
  
  // MIDI sync
  private midiAccess: MIDIAccess | null = null;
  private midiInputs: MIDIInput[] = [];
  
  // OSC sync (for Ableton Link, etc.)
  private oscEnabled: boolean = false;
  
  constructor() {
    this.initializeMIDI();
  }
  
  private async initializeMIDI(): Promise<void> {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        
        this.midiAccess.inputs.forEach((input) => {
          this.midiInputs.push(input);
          input.onmidimessage = this.handleMIDIMessage.bind(this);
        });
        
        console.log('MIDI initialized:', this.midiInputs.length, 'inputs found');
      } catch (error) {
        console.error('MIDI not supported:', error);
      }
    }
  }
  
  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const [status, data1, data2] = event.data;
    
    // MIDI Clock (0xF8)
    if (status === 0xF8) {
      this.onMIDIClock();
    }
    
    // Start (0xFA)
    if (status === 0xFA) {
      this.play();
    }
    
    // Stop (0xFC)
    if (status === 0xFC) {
      this.stop();
    }
    
    // Note On/Off for triggering
    if (status >= 0x80 && status <= 0x9F) {
      this.onMIDINote(status, data1, data2);
    }
  }
  
  private midiClockCount: number = 0;
  
  private onMIDIClock(): void {
    this.midiClockCount++;
    
    // 24 MIDI clocks per quarter note
    if (this.midiClockCount >= 24) {
      this.midiClockCount = 0;
      this.advanceBeat();
    }
  }
  
  private onMIDINote(status: number, note: number, velocity: number): void {
    console.log('MIDI Note:', { status, note, velocity });
    // Trigger visual events based on MIDI notes
  }
  
  /**
   * Sync with Tone.js transport
   */
  public syncWithTone(): void {
    Tone.getTransport().bpm.value = this.tempo;
    Tone.getTransport().timeSignature = this.timeSignature;
    
    Tone.getTransport().scheduleRepeat((time) => {
      this.advanceBeat();
    }, '4n');
  }
  
  /**
   * Set tempo (BPM)
   */
  public setTempo(bpm: number): void {
    this.tempo = bpm;
    Tone.getTransport().bpm.value = bpm;
  }
  
  /**
   * Set time signature
   */
  public setTimeSignature(numerator: number, denominator: number): void {
    this.timeSignature = [numerator, denominator];
    Tone.getTransport().timeSignature = numerator;
  }
  
  private advanceBeat(): void {
    this.currentBeat++;
    
    if (this.currentBeat >= this.timeSignature[0]) {
      this.currentBeat = 0;
      this.currentBar++;
    }
    
    // Notify all callbacks
    this.callbacks.forEach((callback) => {
      callback(this.currentBar, this.currentBeat);
    });
  }
  
  /**
   * Register callback for beat sync
   */
  public onBeat(id: string, callback: (bar: number, beat: number) => void): void {
    this.callbacks.set(id, callback);
  }
  
  /**
   * Remove beat callback
   */
  public offBeat(id: string): void {
    this.callbacks.delete(id);
  }
  
  public play(): void {
    this.isPlaying = true;
    Tone.getTransport().start();
  }
  
  public stop(): void {
    this.isPlaying = false;
    this.currentBar = 0;
    this.currentBeat = 0;
    Tone.getTransport().stop();
  }
  
  public pause(): void {
    this.isPlaying = false;
    Tone.getTransport().pause();
  }
  
  public getCurrentPosition(): { bar: number; beat: number } {
    return {
      bar: this.currentBar,
      beat: this.currentBeat,
    };
  }
}

/**
 * Custom Shader Programming Interface
 */
export class ShaderProgrammingInterface {
  private shaders: Map<string, THREE.ShaderMaterial> = new Map();
  private uniformUpdaters: Map<string, (uniforms: any) => void> = new Map();
  
  /**
   * Create custom shader
   */
  public createShader(
    id: string,
    vertexShader: string,
    fragmentShader: string,
    uniforms: any = {}
  ): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    
    this.shaders.set(id, material);
    return material;
  }
  
  /**
   * Update shader uniforms
   */
  public updateUniforms(id: string, uniforms: any): void {
    const shader = this.shaders.get(id);
    if (shader) {
      Object.assign(shader.uniforms, uniforms);
    }
  }
  
  /**
   * Register automatic uniform updater
   */
  public registerUniformUpdater(
    id: string,
    updater: (uniforms: any) => void
  ): void {
    this.uniformUpdaters.set(id, updater);
  }
  
  /**
   * Update all shaders
   */
  public update(deltaTime: number, audioData?: any): void {
    for (const [id, shader] of this.shaders.entries()) {
      const updater = this.uniformUpdaters.get(id);
      
      if (updater) {
        updater(shader.uniforms);
      }
      
      // Default time update
      if (shader.uniforms.time) {
        shader.uniforms.time.value += deltaTime;
      }
      
      // Audio reactivity
      if (audioData && shader.uniforms.audioIntensity) {
        shader.uniforms.audioIntensity.value = audioData.overall;
      }
    }
  }
  
  /**
   * Load shader from file
   */
  public async loadShaderFromFile(
    id: string,
    vertexPath: string,
    fragmentPath: string,
    uniforms: any = {}
  ): Promise<THREE.ShaderMaterial> {
    const [vertexShader, fragmentShader] = await Promise.all([
      fetch(vertexPath).then((r) => r.text()),
      fetch(fragmentPath).then((r) => r.text()),
    ]);
    
    return this.createShader(id, vertexShader, fragmentShader, uniforms);
  }
  
  /**
   * Get shader template library
   */
  public getTemplates(): Record<string, { vertex: string; fragment: string }> {
    return {
      basic: {
        vertex: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            vec3 color = vec3(vUv, sin(time));
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      },
      audioReactive: {
        vertex: `
          uniform float audioIntensity;
          varying vec2 vUv;
          varying float vDisplacement;
          
          void main() {
            vUv = uv;
            vec3 newPosition = position + normal * audioIntensity * 0.5;
            vDisplacement = audioIntensity;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragment: `
          uniform float time;
          varying vec2 vUv;
          varying float vDisplacement;
          
          void main() {
            vec3 color = vec3(vDisplacement, vUv.x, vUv.y);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      },
    };
  }
  
  public dispose(): void {
    for (const shader of this.shaders.values()) {
      shader.dispose();
    }
    this.shaders.clear();
    this.uniformUpdaters.clear();
  }
}

/**
 * Comprehensive Export Manager
 */
export class ExportManager {
  private animationExporter: AnimationExporter;
  private dawSync: DAWSyncSystem;
  private shaderInterface: ShaderProgrammingInterface;
  
  constructor(canvas: HTMLCanvasElement) {
    this.animationExporter = new AnimationExporter(canvas);
    this.dawSync = new DAWSyncSystem();
    this.shaderInterface = new ShaderProgrammingInterface();
  }
  
  public getAnimationExporter(): AnimationExporter {
    return this.animationExporter;
  }
  
  public getDAWSync(): DAWSyncSystem {
    return this.dawSync;
  }
  
  public getShaderInterface(): ShaderProgrammingInterface {
    return this.shaderInterface;
  }
  
  /**
   * Export complete project
   */
  public async exportProject(settings: ExportSettings): Promise<{
    video: Blob | null;
    audio: Blob | null;
    metadata: any;
  }> {
    const video = await this.animationExporter.stopRecording();
    
    // Export audio from Tone.js
    const audio = await this.exportAudio(settings.duration);
    
    const metadata = {
      duration: settings.duration,
      framerate: settings.framerate,
      resolution: settings.resolution,
      timestamp: new Date().toISOString(),
      frames: this.animationExporter.getFrames().length,
    };
    
    return { video, audio, metadata };
  }
  
  private async exportAudio(duration: number): Promise<Blob> {
    // Render audio offline
    const buffer = await Tone.Offline(({ transport }) => {
      transport.start();
    }, duration);
    
    // Convert to WAV
    const wav = this.audioBufferToWav(buffer.get()!);
    return new Blob([wav], { type: 'audio/wav' });
  }
  
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = this.interleave(buffer);
    const dataLength = data.length * bytesPerSample;
    
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    this.floatTo16BitPCM(view, 44, data);
    
    return arrayBuffer;
  }
  
  private interleave(buffer: AudioBuffer): Float32Array {
    const length = buffer.length * buffer.numberOfChannels;
    const result = new Float32Array(length);
    
    let offset = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        result[offset++] = buffer.getChannelData(channel)[i];
      }
    }
    
    return result;
  }
  
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  private floatTo16BitPCM(view: DataView, offset: number, input: Float32Array): void {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
}
