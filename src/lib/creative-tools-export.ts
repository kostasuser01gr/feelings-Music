/**
 * Creative Tools & Export System
 * Comprehensive creation tools for recording cosmic journeys, exporting visualizations,
 * sharing experiences, and creating custom cosmic content
 */

import * as THREE from 'three';

export interface CreativeProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  lastModified: number;
  duration: number; // seconds
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  collaborators: string[];
  settings: ProjectSettings;
  timeline: TimelineEntry[];
  assets: ProjectAsset[];
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  resolution: { width: number; height: number };
  frameRate: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'mp4' | 'webm' | 'gif' | 'image_sequence' | 'vr360' | 'interactive';
  audioEnabled: boolean;
  audioQuality: number; // bitrate kbps
  compression: number; // 0-1
  backgroundMusic?: {
    url: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
  };
  watermark?: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
}

export interface TimelineEntry {
  id: string;
  startTime: number;
  duration: number;
  type: 'scene' | 'transition' | 'effect' | 'audio' | 'text' | 'camera_movement';
  layer: number;
  enabled: boolean;
  properties: Record<string, unknown>;
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number; // relative to timeline entry start
  properties: Record<string, unknown>;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
}

export interface ProjectAsset {
  id: string;
  name: string;
  type: 'audio' | 'texture' | 'model' | 'custom_element' | 'preset' | 'shader';
  url?: string;
  data?: unknown;
  size: number; // bytes
  createdAt: number;
  usedInEntries: string[]; // timeline entry IDs
}

export interface ProjectMetadata {
  author: string;
  version: string;
  description: string;
  keywords: string[];
  license: string;
  exportCount: number;
  shareCount: number;
  rating: number;
  comments: ProjectComment[];
}

export interface ProjectComment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  replies: ProjectComment[];
}

export interface ExportJob {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-1
  startTime: number;
  endTime?: number;
  settings: ProjectSettings;
  outputUrl?: string;
  errorMessage?: string;
  estimatedDuration?: number;
  priority: number;
}

export interface RecordingSession {
  id: string;
  projectId: string;
  isRecording: boolean;
  startTime: number;
  duration: number;
  recordedFrames: number;
  capturedEvents: CapturedEvent[];
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
}

export interface CapturedEvent {
  timestamp: number;
  type: 'camera_movement' | 'user_interaction' | 'cosmic_event' | 'audio_trigger' | 'effect_change';
  data: Record<string, unknown>;
}

export interface ShareableExperience {
  id: string;
  title: string;
  description: string;
  previewUrl: string;
  interactiveUrl: string;
  embedCode: string;
  socialLinks: SocialShareLink[];
  accessControl: {
    isPublic: boolean;
    password?: string;
    allowedUsers: string[];
    expirationDate?: number;
  };
  analytics: {
    views: number;
    interactions: number;
    averageSessionTime: number;
    userRatings: number[];
  };
}

export interface SocialShareLink {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'discord';
  url: string;
  text: string;
  hashtags: string[];
}

export interface CustomCosmicElement {
  id: string;
  name: string;
  description: string;
  type: 'particle_system' | 'celestial_body' | 'effect' | 'audio_reactive' | 'interactive';
  icon?: string;
  parameters: ElementParameter[];
  shader?: {
    vertex: string;
    fragment: string;
    uniforms: Record<string, unknown>;
  };
  geometry?: {
    type: string;
    parameters: Record<string, unknown>;
  };
  behavior?: {
    animation: AnimationBehavior;
    interaction: InteractionBehavior;
    physics: PhysicsBehavior;
  };
  createdAt: number;
  createdBy: string;
  isPublic: boolean;
  downloads: number;
  rating: number;
}

export interface ElementParameter {
  name: string;
  type: 'number' | 'color' | 'texture' | 'vector' | 'boolean' | 'select' | 'range';
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
  category: string;
}

export interface AnimationBehavior {
  type: 'orbital' | 'linear' | 'random_walk' | 'wave' | 'spiral' | 'custom';
  parameters: Record<string, unknown>;
  duration?: number;
  loop: boolean;
  easing: string;
}

export interface InteractionBehavior {
  type: 'clickable' | 'hoverable' | 'draggable' | 'audio_reactive' | 'gesture_controlled';
  triggers: string[];
  responses: InteractionResponse[];
}

export interface InteractionResponse {
  trigger: string;
  action: 'animate' | 'change_property' | 'emit_particles' | 'play_sound' | 'change_scene';
  parameters: Record<string, unknown>;
}

export interface PhysicsBehavior {
  mass: number;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  damping: number;
  collisionResponse: 'bounce' | 'stick' | 'pass_through' | 'destroy';
  affectedByGravity: boolean;
}

export class CreativeToolsManager {
  private currentProject: CreativeProject | null = null;
  private projects: Map<string, CreativeProject> = new Map();
  private exportJobs: Map<string, ExportJob> = new Map();
  private recordingSessions: Map<string, RecordingSession> = new Map();
  private customElements: Map<string, CustomCosmicElement> = new Map();
  
  private recorder: MediaRecorder | null = null;
  private recordedBlobs: Blob[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private canvasRecorder: CanvasCaptureMediaStreamTrack | null = null;
  
  private exportQueue: ExportJob[] = [];
  private isProcessingExports = false;
  
  private callbacks: {
    onProjectCreated: (project: CreativeProject) => void;
    onProjectUpdated: (project: CreativeProject) => void;
    onRecordingStarted: (session: RecordingSession) => void;
    onRecordingProgress: (session: RecordingSession) => void;
    onRecordingCompleted: (session: RecordingSession) => void;
    onExportProgress: (job: ExportJob) => void;
    onExportCompleted: (job: ExportJob) => void;
    onCustomElementCreated: (element: CustomCosmicElement) => void;
  } = {
    onProjectCreated: () => {},
    onProjectUpdated: () => {},
    onRecordingStarted: () => {},
    onRecordingProgress: () => {},
    onRecordingCompleted: () => {},
    onExportProgress: () => {},
    onExportCompleted: () => {},
    onCustomElementCreated: () => {}
  };

  constructor() {
    this.initializeDefaultElements();
  }

  // Project Management
  createProject(config: Partial<CreativeProject> = {}): CreativeProject {
    const project: CreativeProject = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'Untitled Cosmic Journey',
      description: config.description || 'A journey through the cosmos',
      createdAt: Date.now(),
      lastModified: Date.now(),
      duration: config.duration || 60,
      tags: config.tags || ['cosmic', 'journey'],
      isPublic: config.isPublic || false,
      collaborators: config.collaborators || [],
      settings: this.createDefaultProjectSettings(),
      timeline: [],
      assets: [],
      metadata: {
        author: 'Anonymous Creator',
        version: '1.0.0',
        description: '',
        keywords: [],
        license: 'CC BY-SA 4.0',
        exportCount: 0,
        shareCount: 0,
        rating: 0,
        comments: []
      },
      ...config
    };

    this.projects.set(project.id, project);
    this.currentProject = project;
    
    this.callbacks.onProjectCreated?.(project);
    
    return project;
  }

  private createDefaultProjectSettings(): ProjectSettings {
    return {
      resolution: { width: 1920, height: 1080 },
      frameRate: 60,
      quality: 'high',
      format: 'mp4',
      audioEnabled: true,
      audioQuality: 128,
      compression: 0.8,
      watermark: {
        enabled: false,
        text: 'Created with Feelings & Music',
        position: 'bottom-right',
        opacity: 0.7
      }
    };
  }

  loadProject(projectId: string): CreativeProject | undefined {
    const project = this.projects.get(projectId);
    if (project) {
      this.currentProject = project;
      project.lastModified = Date.now();
      this.callbacks.onProjectUpdated?.(project);
    }
    return project;
  }

  saveProject(): void {
    if (!this.currentProject) return;
    
    this.currentProject.lastModified = Date.now();
    this.projects.set(this.currentProject.id, this.currentProject);
    
    // Save to local storage or send to server
    this.persistProject(this.currentProject);
    
    this.callbacks.onProjectUpdated?.(this.currentProject);
  }

  private persistProject(project: CreativeProject): void {
    try {
      const projectData = JSON.stringify(project);
      localStorage.setItem(`cosmic_project_${project.id}`, projectData);
    } catch (error) {
      console.warn('Failed to save project to local storage:', error);
    }
  }

  duplicateProject(projectId: string, newName?: string): CreativeProject {
    const originalProject = this.projects.get(projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const duplicatedProject = {
      ...originalProject,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalProject.name} (Copy)`,
      createdAt: Date.now(),
      lastModified: Date.now(),
      metadata: {
        ...originalProject.metadata,
        exportCount: 0,
        shareCount: 0,
        comments: []
      }
    };

    this.projects.set(duplicatedProject.id, duplicatedProject);
    
    return duplicatedProject;
  }

  deleteProject(projectId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) return false;

    // Cancel any ongoing exports
    this.exportJobs.forEach(job => {
      if (job.projectId === projectId && job.status === 'processing') {
        this.cancelExport(job.id);
      }
    });

    // Remove from storage
    localStorage.removeItem(`cosmic_project_${projectId}`);
    
    this.projects.delete(projectId);
    
    if (this.currentProject?.id === projectId) {
      this.currentProject = null;
    }

    return true;
  }

  // Timeline Management
  addTimelineEntry(entry: Omit<TimelineEntry, 'id'>): string {
    if (!this.currentProject) throw new Error('No active project');

    const timelineEntry: TimelineEntry = {
      ...entry,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.currentProject.timeline.push(timelineEntry);
    this.currentProject.timeline.sort((a, b) => a.startTime - b.startTime);
    
    this.saveProject();
    
    return timelineEntry.id;
  }

  removeTimelineEntry(entryId: string): boolean {
    if (!this.currentProject) return false;

    const index = this.currentProject.timeline.findIndex(entry => entry.id === entryId);
    if (index === -1) return false;

    this.currentProject.timeline.splice(index, 1);
    this.saveProject();
    
    return true;
  }

  updateTimelineEntry(entryId: string, updates: Partial<TimelineEntry>): boolean {
    if (!this.currentProject) return false;

    const entry = this.currentProject.timeline.find(e => e.id === entryId);
    if (!entry) return false;

    Object.assign(entry, updates);
    this.currentProject.timeline.sort((a, b) => a.startTime - b.startTime);
    
    this.saveProject();
    
    return true;
  }

  addKeyframe(entryId: string, keyframe: Keyframe): boolean {
    if (!this.currentProject) return false;

    const entry = this.currentProject.timeline.find(e => e.id === entryId);
    if (!entry) return false;

    entry.keyframes.push(keyframe);
    entry.keyframes.sort((a, b) => a.time - b.time);
    
    this.saveProject();
    
    return true;
  }

  // Recording System
  async startRecording(projectId?: string): Promise<RecordingSession> {
    const project = projectId ? this.projects.get(projectId) : this.currentProject;
    if (!project) throw new Error('No project available for recording');

    // Setup canvas recording
    if (!this.canvas) {
      this.canvas = document.querySelector('canvas') || document.createElement('canvas');
    }

    const stream = this.canvas.captureStream(project.settings.frameRate);
    this.canvasRecorder = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;

    // Add audio if enabled
    let audioStream: MediaStream | null = null;
    if (project.settings.audioEnabled) {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
      } catch (error) {
        console.warn('Failed to capture audio:', error);
      }
    }

    // Create recording session
    const session: RecordingSession = {
      id: `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: project.id,
      isRecording: true,
      startTime: Date.now(),
      duration: 0,
      recordedFrames: 0,
      capturedEvents: [],
      audioTrack: audioStream?.getAudioTracks()[0],
      videoTrack: this.canvasRecorder
    };

    // Setup MediaRecorder
    this.recordedBlobs = [];
    this.recorder = new MediaRecorder(stream, {
      mimeType: this.getBestMimeType(),
      videoBitsPerSecond: this.calculateVideoBitrate(project.settings)
    });

    this.recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      this.completeRecording(session);
    };

    // Start recording
    this.recorder.start(100); // Collect data every 100ms
    this.recordingSessions.set(session.id, session);

    // Start capturing events
    this.startEventCapture(session);

    this.callbacks.onRecordingStarted?.(session);
    
    return session;
  }

  private getBestMimeType(): string {
    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    for (const type of possibleTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }

  private calculateVideoBitrate(settings: ProjectSettings): number {
    const pixels = settings.resolution.width * settings.resolution.height;
    const baseRate = pixels * 0.1; // Base rate per pixel
    
    switch (settings.quality) {
      case 'ultra': return baseRate * 4;
      case 'high': return baseRate * 2;
      case 'medium': return baseRate * 1;
      case 'low': return baseRate * 0.5;
      default: return baseRate;
    }
  }

  private startEventCapture(session: RecordingSession): void {
    const captureEvent = (type: CapturedEvent['type'], data: Record<string, unknown>) => {
      if (!session.isRecording) return;
      
      session.capturedEvents.push({
        timestamp: Date.now() - session.startTime,
        type,
        data
      });
    };

    // Capture camera movements
    document.addEventListener('mousemove', (e) => {
      captureEvent('camera_movement', {
        mouseX: e.clientX,
        mouseY: e.clientY,
        deltaX: e.movementX,
        deltaY: e.movementY
      });
    });

    // Capture user interactions
    document.addEventListener('click', (e) => {
      captureEvent('user_interaction', {
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        target: (e.target as HTMLElement)?.tagName
      });
    });

    document.addEventListener('keydown', (e) => {
      captureEvent('user_interaction', {
        type: 'keydown',
        key: e.key,
        code: e.code
      });
    });
  }

  stopRecording(sessionId: string): void {
    const session = this.recordingSessions.get(sessionId);
    if (!session || !session.isRecording) return;

    session.isRecording = false;
    session.duration = Date.now() - session.startTime;

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }

    // Stop tracks
    if (session.audioTrack) {
      session.audioTrack.stop();
    }
    if (session.videoTrack && 'stop' in session.videoTrack) {
      session.videoTrack.stop();
    }
  }

  private completeRecording(session: RecordingSession): void {
    // Create video blob
    const videoBlob = new Blob(this.recordedBlobs, { 
      type: this.recorder?.mimeType || 'video/webm' 
    });

    // Save recording as asset
    const project = this.projects.get(session.projectId);
    if (project) {
      const asset: ProjectAsset = {
        id: `asset_recording_${session.id}`,
        name: `Recording ${new Date(session.startTime).toLocaleString()}`,
        type: 'audio', // This would be 'video' in a real implementation
        data: videoBlob,
        size: videoBlob.size,
        createdAt: session.startTime,
        usedInEntries: []
      };

      project.assets.push(asset);
      this.persistProject(project);
    }

    this.callbacks.onRecordingCompleted?.(session);
  }

  // Export System
  async exportProject(projectId: string, customSettings?: Partial<ProjectSettings>): Promise<ExportJob> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const job: ExportJob = {
      id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      settings: { ...project.settings, ...customSettings },
      priority: 0
    };

    this.exportJobs.set(job.id, job);
    this.exportQueue.push(job);
    
    project.metadata.exportCount++;
    this.persistProject(project);

    // Start processing if not already running
    if (!this.isProcessingExports) {
      this.processExportQueue();
    }

    return job;
  }

  private async processExportQueue(): Promise<void> {
    if (this.isProcessingExports || this.exportQueue.length === 0) return;

    this.isProcessingExports = true;

    while (this.exportQueue.length > 0) {
      // Sort by priority (higher first)
      this.exportQueue.sort((a, b) => b.priority - a.priority);
      const job = this.exportQueue.shift()!;

      if (job.status === 'cancelled') continue;

      try {
        job.status = 'processing';
        this.callbacks.onExportProgress?.(job);

        await this.processExportJob(job);
        
        job.status = 'completed';
        job.endTime = Date.now();
        job.progress = 1;
        
        this.callbacks.onExportCompleted?.(job);
      } catch (error) {
        job.status = 'failed';
        job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        job.endTime = Date.now();
        
        console.error('Export job failed:', error);
        this.callbacks.onExportProgress?.(job);
      }
    }

    this.isProcessingExports = false;
  }

  private async processExportJob(job: ExportJob): Promise<void> {
    const project = this.projects.get(job.projectId);
    if (!project) throw new Error('Project not found');

    // Estimate duration
    const complexity = project.timeline.length * 0.1 + project.assets.length * 0.05;
    job.estimatedDuration = Math.max(5, complexity * 1000); // minimum 5 seconds

    // Simulate export process with progress updates
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      if (job.status === 'cancelled') throw new Error('Export cancelled');
      
      // Simulate processing step
      await new Promise(resolve => setTimeout(resolve, job.estimatedDuration! / steps));
      
      job.progress = (i + 1) / steps;
      this.callbacks.onExportProgress?.(job);
    }

    // Generate output
    job.outputUrl = await this.generateExportOutput(project, job.settings);
  }

  private async generateExportOutput(project: CreativeProject, settings: ProjectSettings): Promise<string> {
    switch (settings.format) {
      case 'mp4':
      case 'webm':
        return this.generateVideoOutput(project, settings);
      case 'gif':
        return this.generateGifOutput(project, settings);
      case 'image_sequence':
        return this.generateImageSequence(project, settings);
      case 'vr360':
        return this.generateVR360Output(project, settings);
      case 'interactive':
        return this.generateInteractiveOutput(project, settings);
      default:
        throw new Error(`Unsupported export format: ${settings.format}`);
    }
  }

  private async generateVideoOutput(_project: CreativeProject, _settings: ProjectSettings): Promise<string> {
    // In a real implementation, this would:
    // 1. Render each frame of the timeline
    // 2. Encode video using WebCodecs API or server-side processing
    // 3. Add audio tracks and synchronization
    // 4. Apply compression and quality settings
    // 5. Generate final video file
    
    const videoBlob = new Blob(['mock video data'], { type: 'video/mp4' });
    return URL.createObjectURL(videoBlob);
  }

  private async generateGifOutput(_project: CreativeProject, _settings: ProjectSettings): Promise<string> {
    // Generate animated GIF
    const gifBlob = new Blob(['mock gif data'], { type: 'image/gif' });
    return URL.createObjectURL(gifBlob);
  }

  private async generateImageSequence(_project: CreativeProject, _settings: ProjectSettings): Promise<string> {
    // Generate ZIP file with image sequence
    const zipBlob = new Blob(['mock zip data'], { type: 'application/zip' });
    return URL.createObjectURL(zipBlob);
  }

  private async generateVR360Output(_project: CreativeProject, _settings: ProjectSettings): Promise<string> {
    // Generate 360-degree VR video
    const vrBlob = new Blob(['mock vr data'], { type: 'video/mp4' });
    return URL.createObjectURL(vrBlob);
  }

  private async generateInteractiveOutput(_project: CreativeProject, _settings: ProjectSettings): Promise<string> {
    // Generate interactive web experience
    const htmlBlob = new Blob(['mock interactive html'], { type: 'text/html' });
    return URL.createObjectURL(htmlBlob);
  }

  cancelExport(jobId: string): boolean {
    const job = this.exportJobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') return false;

    job.status = 'cancelled';
    job.endTime = Date.now();
    
    // Remove from queue if pending
    const queueIndex = this.exportQueue.findIndex(j => j.id === jobId);
    if (queueIndex !== -1) {
      this.exportQueue.splice(queueIndex, 1);
    }

    return true;
  }

  // Sharing System
  async shareExperience(projectId: string, shareSettings: Partial<ShareableExperience> = {}): Promise<ShareableExperience> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    // Export as interactive experience
    const exportJob = await this.exportProject(projectId, { 
      format: 'interactive',
      quality: 'high'
    });

    // Wait for export completion (in real implementation, this would be async)
    await new Promise(resolve => {
      const checkCompletion = () => {
        if (exportJob.status === 'completed') {
          resolve(undefined);
        } else if (exportJob.status === 'failed') {
          throw new Error('Export failed');
        } else {
          setTimeout(checkCompletion, 1000);
        }
      };
      checkCompletion();
    });

    // Create shareable experience
    const experience: ShareableExperience = {
      id: `share_${projectId}_${Date.now()}`,
      title: project.name,
      description: project.description,
      previewUrl: this.generatePreviewUrl(project),
      interactiveUrl: exportJob.outputUrl!,
      embedCode: this.generateEmbedCode(exportJob.outputUrl!),
      socialLinks: this.generateSocialShareLinks(project),
      accessControl: {
        isPublic: project.isPublic,
        allowedUsers: project.collaborators,
        ...shareSettings.accessControl
      },
      analytics: {
        views: 0,
        interactions: 0,
        averageSessionTime: 0,
        userRatings: []
      },
      ...shareSettings
    };

    project.metadata.shareCount++;
    this.persistProject(project);

    return experience;
  }

  private generatePreviewUrl(project: CreativeProject): string {
    // Generate preview image or video
    return `https://cosmic-preview.app/preview/${project.id}.jpg`;
  }

  private generateEmbedCode(interactiveUrl: string): string {
    return `<iframe src="${interactiveUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
  }

  private generateSocialShareLinks(project: CreativeProject): SocialShareLink[] {
    const baseUrl = 'https://cosmic-experiences.app';
    const projectUrl = `${baseUrl}/experience/${project.id}`;
    const hashtags = ['CosmicJourney', 'FeelingsAndMusic', ...project.tags];

    return [
      {
        platform: 'twitter',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my cosmic journey: ${project.name}`)}&url=${encodeURIComponent(projectUrl)}&hashtags=${hashtags.join(',')}`,
        text: `Check out my cosmic journey: ${project.name}`,
        hashtags
      },
      {
        platform: 'facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`,
        text: `Experience: ${project.name}`,
        hashtags
      },
      {
        platform: 'reddit',
        url: `https://reddit.com/submit?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(project.name)}`,
        text: project.name,
        hashtags
      }
    ];
  }

  // Custom Element Creation
  createCustomElement(config: Omit<CustomCosmicElement, 'id' | 'createdAt' | 'downloads' | 'rating'>): CustomCosmicElement {
    const element: CustomCosmicElement = {
      ...config,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      downloads: 0,
      rating: 0
    };

    this.customElements.set(element.id, element);
    this.callbacks.onCustomElementCreated?.(element);

    return element;
  }

  private initializeDefaultElements(): void {
    // Cosmic Particle Stream
    this.createCustomElement({
      name: 'Cosmic Particle Stream',
      description: 'A flowing stream of luminous particles',
      type: 'particle_system',
      icon: '✨',
      parameters: [
        { name: 'particleCount', type: 'range', defaultValue: 1000, min: 100, max: 5000, description: 'Number of particles', category: 'Basic' },
        { name: 'streamColor', type: 'color', defaultValue: '#4facfe', description: 'Stream color', category: 'Appearance' },
        { name: 'flowSpeed', type: 'number', defaultValue: 2.0, min: 0.1, max: 10, description: 'Flow speed', category: 'Animation' },
        { name: 'turbulence', type: 'number', defaultValue: 0.3, min: 0, max: 1, description: 'Turbulence amount', category: 'Animation' }
      ],
      shader: {
        vertex: this.getParticleStreamVertexShader(),
        fragment: this.getParticleStreamFragmentShader(),
        uniforms: {
          uTime: { value: 0 },
          uFlowSpeed: { value: 2.0 },
          uTurbulence: { value: 0.3 },
          uColor: { value: new THREE.Color('#4facfe') }
        }
      },
      geometry: {
        type: 'Points',
        parameters: { count: 1000 }
      },
      behavior: {
        animation: {
          type: 'custom',
          parameters: { flowDirection: 'spiral' },
          loop: true,
          easing: 'linear'
        },
        interaction: {
          type: 'audio_reactive',
          triggers: ['beat', 'frequency_change'],
          responses: [
            { trigger: 'beat', action: 'emit_particles', parameters: { burst: 50 } },
            { trigger: 'frequency_change', action: 'change_property', parameters: { property: 'color', mapping: 'frequency_to_hue' } }
          ]
        },
        physics: {
          mass: 0.1,
          velocity: new THREE.Vector3(0, 0, 1),
          acceleration: new THREE.Vector3(0, 0, 0),
          damping: 0.98,
          collisionResponse: 'pass_through',
          affectedByGravity: false
        }
      },
      createdBy: 'system',
      isPublic: true
    });

    // Pulsing Cosmic Heart
    this.createCustomElement({
      name: 'Pulsing Cosmic Heart',
      description: 'A heart-shaped energy source that pulses with emotion',
      type: 'audio_reactive',
      icon: '💖',
      parameters: [
        { name: 'heartSize', type: 'number', defaultValue: 5.0, min: 1, max: 20, description: 'Heart size', category: 'Basic' },
        { name: 'pulseIntensity', type: 'range', defaultValue: 0.8, min: 0, max: 1, description: 'Pulse intensity', category: 'Animation' },
        { name: 'emotionColor', type: 'color', defaultValue: '#ff6b9d', description: 'Emotion color', category: 'Appearance' },
        { name: 'audioSensitivity', type: 'range', defaultValue: 0.7, min: 0, max: 1, description: 'Audio sensitivity', category: 'Audio' }
      ],
      shader: {
        vertex: this.getHeartVertexShader(),
        fragment: this.getHeartFragmentShader(),
        uniforms: {
          uTime: { value: 0 },
          uPulseIntensity: { value: 0.8 },
          uColor: { value: new THREE.Color('#ff6b9d') },
          uAudioLevel: { value: 0 }
        }
      },
      geometry: {
        type: 'Custom',
        parameters: { shape: 'heart' }
      },
      behavior: {
        animation: {
          type: 'wave',
          parameters: { frequency: 60 }, // BPM
          loop: true,
          easing: 'ease-in-out'
        },
        interaction: {
          type: 'audio_reactive',
          triggers: ['beat', 'emotion_change'],
          responses: [
            { trigger: 'beat', action: 'animate', parameters: { type: 'pulse', intensity: 1.5, duration: 0.2 } },
            { trigger: 'emotion_change', action: 'change_property', parameters: { property: 'color', transition: 'smooth' } }
          ]
        },
        physics: {
          mass: 1.0,
          velocity: new THREE.Vector3(0, 0, 0),
          acceleration: new THREE.Vector3(0, 0, 0),
          damping: 1.0,
          collisionResponse: 'bounce',
          affectedByGravity: false
        }
      },
      createdBy: 'system',
      isPublic: true
    });
  }

  private getParticleStreamVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uFlowSpeed;
      uniform float uTurbulence;
      
      attribute float particleId;
      
      varying vec3 vColor;
      varying float vLife;
      
      void main() {
        vec3 pos = position;
        
        // Flow animation
        float flow = uTime * uFlowSpeed + particleId * 0.1;
        pos.z += flow;
        pos.z = mod(pos.z, 100.0) - 50.0;
        
        // Turbulence
        float turbX = sin(flow * 2.0 + particleId) * uTurbulence;
        float turbY = cos(flow * 1.5 + particleId * 2.0) * uTurbulence;
        pos.x += turbX;
        pos.y += turbY;
        
        // Life calculation for fading
        vLife = 1.0 - abs(pos.z) / 50.0;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = vLife * 4.0;
      }
    `;
  }

  private getParticleStreamFragmentShader(): string {
    return `
      uniform vec3 uColor;
      
      varying float vLife;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(gl_PointCoord, center);
        float alpha = (1.0 - dist) * vLife;
        
        gl_FragColor = vec4(uColor, alpha);
      }
    `;
  }

  private getHeartVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uPulseIntensity;
      uniform float uAudioLevel;
      
      varying vec2 vUv;
      varying float vPulse;
      
      void main() {
        vUv = uv;
        
        // Heart pulse animation
        float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
        pulse += uAudioLevel * uPulseIntensity;
        vPulse = pulse;
        
        vec3 pos = position * (1.0 + pulse * 0.2);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getHeartFragmentShader(): string {
    return `
      uniform vec3 uColor;
      
      varying vec2 vUv;
      varying float vPulse;
      
      float heartShape(vec2 uv) {
        uv = uv * 2.0 - 1.0;
        float heart = sqrt(abs(uv.x)) * sqrt(abs(abs(uv.y) - 1.0));
        return smoothstep(0.5, 0.6, heart);
      }
      
      void main() {
        float heart = heartShape(vUv);
        vec3 color = uColor * (1.0 + vPulse * 0.5);
        float alpha = heart * (0.7 + vPulse * 0.3);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  // Preset Templates
  createProjectFromTemplate(templateName: string): CreativeProject {
    const templates = this.getProjectTemplates();
    const template = templates.find(t => t.name === templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.createProject(template.config);
  }

  private getProjectTemplates(): Array<{ name: string; description: string; config: Partial<CreativeProject> }> {
    return [
      {
        name: 'Emotional Journey',
        description: 'A template for creating emotion-driven cosmic experiences',
        config: {
          name: 'My Emotional Journey',
          description: 'A personal journey through the cosmos guided by emotions',
          duration: 180,
          tags: ['emotional', 'personal', 'journey'],
          settings: {
            resolution: { width: 1920, height: 1080 },
            frameRate: 60,
            quality: 'high',
            format: 'mp4',
            audioEnabled: true,
            audioQuality: 192,
            compression: 0.7
          },
          timeline: [
            {
              id: 'intro',
              startTime: 0,
              duration: 30,
              type: 'scene',
              layer: 0,
              enabled: true,
              properties: { scene: 'cosmic_void', mood: 'calm' },
              keyframes: []
            },
            {
              id: 'emotional_rise',
              startTime: 30,
              duration: 120,
              type: 'effect',
              layer: 1,
              enabled: true,
              properties: { effect: 'emotion_visualization', intensity: 'dynamic' },
              keyframes: []
            },
            {
              id: 'climax',
              startTime: 150,
              duration: 30,
              type: 'scene',
              layer: 0,
              enabled: true,
              properties: { scene: 'stellar_birth', mood: 'euphoric' },
              keyframes: []
            }
          ]
        }
      },
      {
        name: 'Music Visualization',
        description: 'Perfect for creating music-reactive cosmic visualizations',
        config: {
          name: 'Cosmic Music Experience',
          description: 'Music comes alive in the cosmos',
          duration: 240,
          tags: ['music', 'reactive', 'visualization'],
          settings: {
            resolution: { width: 1920, height: 1080 },
            frameRate: 60,
            quality: 'ultra',
            format: 'mp4',
            audioEnabled: true,
            audioQuality: 320,
            compression: 0.6
          }
        }
      },
      {
        name: 'VR Experience',
        description: 'Template optimized for VR/360-degree experiences',
        config: {
          name: 'Immersive Cosmic VR',
          description: 'Step into the cosmos',
          duration: 300,
          tags: ['vr', 'immersive', '360'],
          settings: {
            resolution: { width: 4096, height: 2048 },
            frameRate: 90,
            quality: 'ultra',
            format: 'vr360',
            audioEnabled: true,
            audioQuality: 320,
            compression: 0.5
          }
        }
      }
    ];
  }

  // Public API
  getCurrentProject(): CreativeProject | null {
    return this.currentProject;
  }

  getAllProjects(): CreativeProject[] {
    return Array.from(this.projects.values());
  }

  getExportJob(jobId: string): ExportJob | null {
    return this.exportJobs.get(jobId) || null;
  }

  getRecordingSession(sessionId: string): RecordingSession | null {
    return this.recordingSessions.get(sessionId) || null;
  }

  getCustomElement(elementId: string): CustomCosmicElement | null {
    return this.customElements.get(elementId) || null;
  }

  getAllCustomElements(): CustomCosmicElement[] {
    return Array.from(this.customElements.values());
  }

  // Event subscription
  onProjectCreated(callback: (project: CreativeProject) => void) {
    this.callbacks.onProjectCreated = callback;
  }

  onProjectUpdated(callback: (project: CreativeProject) => void) {
    this.callbacks.onProjectUpdated = callback;
  }

  onRecordingStarted(callback: (session: RecordingSession) => void) {
    this.callbacks.onRecordingStarted = callback;
  }

  onRecordingProgress(callback: (session: RecordingSession) => void) {
    this.callbacks.onRecordingProgress = callback;
  }

  onRecordingCompleted(callback: (session: RecordingSession) => void) {
    this.callbacks.onRecordingCompleted = callback;
  }

  onExportProgress(callback: (job: ExportJob) => void) {
    this.callbacks.onExportProgress = callback;
  }

  onExportCompleted(callback: (job: ExportJob) => void) {
    this.callbacks.onExportCompleted = callback;
  }

  onCustomElementCreated(callback: (element: CustomCosmicElement) => void) {
    this.callbacks.onCustomElementCreated = callback;
  }

  dispose(): void {
    // Stop all recordings
    this.recordingSessions.forEach((session) => {
      if (session.isRecording) {
        this.stopRecording(session.id);
      }
    });

    // Cancel all exports
    this.exportJobs.forEach((job) => {
      if (job.status === 'processing') {
        this.cancelExport(job.id);
      }
    });

    // Clear collections
    this.projects.clear();
    this.exportJobs.clear();
    this.recordingSessions.clear();
    this.customElements.clear();
    this.exportQueue = [];
  }
}

// Helper functions
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateThumbnail(canvas: HTMLCanvasElement, width: number = 320, height: number = 180): string {
  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = width;
  thumbnailCanvas.height = height;
  
  const ctx = thumbnailCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, width, height);
  }
  
  return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
}

export function estimateExportTime(project: CreativeProject, settings: ProjectSettings): number {
  const duration = project.duration;
  const complexity = project.timeline.length * 0.5 + project.assets.length * 0.1;
  const qualityMultiplier = settings.quality === 'ultra' ? 2 : settings.quality === 'high' ? 1.5 : 1;
  
  return duration * complexity * qualityMultiplier; // seconds
}

// Global creative tools manager instance
export const creativeToolsManager = new CreativeToolsManager();