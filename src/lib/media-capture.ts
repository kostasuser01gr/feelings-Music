/**
 * Screenshot and Recording Utilities
 * Capture cosmic moments as images or videos
 */

import * as THREE from 'three';

export class ScreenshotManager {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  
  initialize(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer): void {
    this.canvas = canvas;
    this.renderer = renderer;
  }
  
  /**
   * Capture current frame as image
   */
  async captureScreenshot(filename: string = 'cosmic-screenshot.png'): Promise<void> {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return;
    }
    
    try {
      // Get image data
      const dataURL = this.canvas.toDataURL('image/png');
      
      // Download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      link.click();
      
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }
  
  /**
   * Capture high-resolution screenshot
   */
  async captureHiResScreenshot(
    width: number = 3840,
    height: number = 2160,
    filename: string = 'cosmic-screenshot-4k.png'
  ): Promise<void> {
    if (!this.renderer || !this.canvas) {
      console.error('Renderer not initialized');
      return;
    }
    
    try {
      // Save current size
      const originalWidth = this.canvas.width;
      const originalHeight = this.canvas.height;
      
      // Set high resolution
      this.renderer.setSize(width, height);
      
      // Render frame
      this.renderer.render(
        this.renderer.domElement as any,
        this.renderer.domElement as any
      );
      
      // Capture
      await this.captureScreenshot(filename);
      
      // Restore original size
      this.renderer.setSize(originalWidth, originalHeight);
      
    } catch (error) {
      console.error('Failed to capture hi-res screenshot:', error);
    }
  }
  
  /**
   * Copy screenshot to clipboard
   */
  async copyToClipboard(): Promise<void> {
    if (!this.canvas) {
      console.error('Canvas not initialized');
      return;
    }
    
    try {
      const blob = await new Promise<Blob>((resolve) => {
        this.canvas!.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      console.log('Screenshot copied to clipboard');
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;
  
  /**
   * Start recording
   */
  async startRecording(canvas: HTMLCanvasElement): Promise<void> {
    try {
      // Get canvas stream
      this.stream = canvas.captureStream(60); // 60 FPS
      
      // Create media recorder
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps
      };
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      
      console.log('Recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }
  
  /**
   * Stop recording and download
   */
  async stopRecording(filename: string = 'cosmic-recording.webm'): Promise<void> {
    if (!this.mediaRecorder || !this.isRecording) {
      console.error('Not currently recording');
      return;
    }
    
    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        this.isRecording = false;
        
        console.log('Recording saved');
        resolve();
      };
      
      this.mediaRecorder!.stop();
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    });
  }
  
  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }
}

// Global instances
let screenshotManager: ScreenshotManager | null = null;
let videoRecorder: VideoRecorder | null = null;

export function getScreenshotManager(): ScreenshotManager {
  if (!screenshotManager) {
    screenshotManager = new ScreenshotManager();
  }
  return screenshotManager;
}

export function getVideoRecorder(): VideoRecorder {
  if (!videoRecorder) {
    videoRecorder = new VideoRecorder();
  }
  return videoRecorder;
}

// React hook for screenshot/recording controls
import { useCallback, useState } from 'react';

export function useMediaCapture(canvas: HTMLCanvasElement | null, renderer: THREE.WebGLRenderer | null) {
  const [isRecording, setIsRecording] = useState(false);
  
  const takeScreenshot = useCallback(() => {
    if (!canvas || !renderer) return;
    
    const manager = getScreenshotManager();
    manager.initialize(canvas, renderer);
    manager.captureScreenshot();
  }, [canvas, renderer]);
  
  const takeHiResScreenshot = useCallback(() => {
    if (!canvas || !renderer) return;
    
    const manager = getScreenshotManager();
    manager.initialize(canvas, renderer);
    manager.captureHiResScreenshot();
  }, [canvas, renderer]);
  
  const copyScreenshot = useCallback(async () => {
    if (!canvas || !renderer) return;
    
    const manager = getScreenshotManager();
    manager.initialize(canvas, renderer);
    await manager.copyToClipboard();
  }, [canvas, renderer]);
  
  const startRecording = useCallback(async () => {
    if (!canvas) return;
    
    const recorder = getVideoRecorder();
    await recorder.startRecording(canvas);
    setIsRecording(true);
  }, [canvas]);
  
  const stopRecording = useCallback(async () => {
    const recorder = getVideoRecorder();
    await recorder.stopRecording();
    setIsRecording(false);
  }, []);
  
  return {
    takeScreenshot,
    takeHiResScreenshot,
    copyScreenshot,
    startRecording,
    stopRecording,
    isRecording
  };
}
