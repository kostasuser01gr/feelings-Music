/**
 * Social Collaboration System for real-time shared cosmic experiences
 * WebRTC integration, collaborative creation, synchronized cosmic spaces
 */

import * as THREE from 'three';
// Note: Socket.IO would be imported here in a real implementation
// import { io, Socket } from 'socket.io-client';

// Mock Socket type for demonstration
type Socket = {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  disconnect: () => void;
  id: string;
};

type SocketIO = {
  connect: (url: string) => Socket;
};

// Mock Socket.IO for demonstration - in production use actual socket.io-client
const io: SocketIO = {
  connect: (url: string) => ({
    on: () => {},
    emit: () => {},
    disconnect: () => {},
    id: 'mock-id'
  } as Socket)
};

export interface User {
  id: string;
  name: string;
  avatar?: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  isVoiceActive: boolean;
  color: string;
  instrument?: string;
  lastActivity: number;
}

export interface SharedSession {
  id: string;
  name: string;
  hostId: string;
  users: Map<string, User>;
  settings: SessionSettings;
  cosmicState: CosmicState;
  createdAt: number;
  lastActivity: number;
}

export interface CosmicState {
  planetPositions: Record<string, THREE.Vector3>;
  nebulaIntensity: number;
  particleCount: number;
  audioFrequencies: Float32Array;
  emotion: string;
  timestamp: number;
}

export interface SessionSettings {
  maxUsers: number;
  isPublic: boolean;
  allowGuests: boolean;
  syncAudio: boolean;
  syncVisuals: boolean;
  collaborativeCreation: boolean;
  voiceChat: boolean;
  recordSession: boolean;
}

export interface CosmicState {
  sharedElements: Map<string, SharedCosmicElement>;
  audioSync: AudioSyncState;
  visualSync: VisualSyncState;
  timestamp: number;
}

export interface SharedCosmicElement {
  id: string;
  type: 'star' | 'planet' | 'nebula' | 'constellation' | 'wormhole' | 'effect' | 'custom';
  position: THREE.Vector3;
  properties: Record<string, any>;
  ownerId: string;
  locked: boolean;
  collaborative: boolean;
  lastModified: number;
}

export interface AudioSyncState {
  currentTrack?: {
    url: string;
    position: number;
    isPlaying: boolean;
    volume: number;
  };
  sharedInstruments: Map<string, InstrumentState>;
  mixerState: MixerState;
}

export interface InstrumentState {
  userId: string;
  type: string;
  notes: NoteEvent[];
  effects: Record<string, any>;
  volume: number;
  muted: boolean;
}

export interface NoteEvent {
  note: string;
  velocity: number;
  timestamp: number;
  duration: number;
}

export interface VisualSyncState {
  cameraSync: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    followUser?: string;
  };
  effectsSync: {
    globalEffects: string[];
    userEffects: Map<string, string[]>;
  };
  environmentSync: {
    timeOfDay: number;
    weatherEffects: string[];
    ambientSettings: Record<string, number>;
  };
}

export interface MixerState {
  masterVolume: number;
  userVolumes: Map<string, number>;
  effects: {
    reverb: number;
    delay: number;
    chorus: number;
    filter: { frequency: number; resonance: number };
  };
}

export class CollaborationManager {
  private socket: Socket | null = null;
  private currentSession: SharedSession | null = null;
  private localUser: User | null = null;
  
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private audioStreams: Map<string, MediaStream> = new Map();
  
  private scene: THREE.Scene;
  private userAvatars: Map<string, THREE.Object3D> = new Map();
  private sharedObjects: Map<string, THREE.Object3D> = new Map();
  
  private callbacks: {
    onUserJoined: (user: User) => void;
    onUserLeft: (userId: string) => void;
    onUserPositionUpdate: (userId: string, position: THREE.Vector3, rotation: THREE.Euler) => void;
    onSharedElementCreated: (element: SharedCosmicElement) => void;
    onSharedElementModified: (element: SharedCosmicElement) => void;
    onSharedElementDeleted: (elementId: string) => void;
    onAudioSyncUpdate: (audioState: AudioSyncState) => void;
    onVisualSyncUpdate: (visualState: VisualSyncState) => void;
  } = {} as any;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeWebRTC();
  }

  private initializeWebRTC() {
    // WebRTC configuration
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];

    // Initialize peer connection factory
    this.createPeerConnection = (userId: string) => {
      const pc = new RTCPeerConnection({ iceServers });
      
      pc.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          this.socket.emit('ice-candidate', {
            targetUserId: userId,
            candidate: event.candidate
          });
        }
      };

      pc.ondatachannel = (event) => {
        const channel = event.channel;
        this.setupDataChannel(channel, userId);
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        this.audioStreams.set(userId, stream);
        this.setupAudioStream(userId, stream);
      };

      this.peerConnections.set(userId, pc);
      return pc;
    };
  }

  async connect(serverUrl: string = 'ws://localhost:3001'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl);

        this.socket.on('connect', () => {
          console.log('Connected to collaboration server');
          this.setupSocketListeners();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('user-joined', (user: User) => {
      console.log('User joined:', user.name);
      this.handleUserJoined(user);
    });

    this.socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      this.handleUserLeft(userId);
    });

    this.socket.on('user-position-update', (data: { userId: string; position: THREE.Vector3; rotation: THREE.Euler }) => {
      this.handleUserPositionUpdate(data.userId, data.position, data.rotation);
    });

    this.socket.on('shared-element-created', (element: SharedCosmicElement) => {
      this.handleSharedElementCreated(element);
    });

    this.socket.on('shared-element-modified', (element: SharedCosmicElement) => {
      this.handleSharedElementModified(element);
    });

    this.socket.on('shared-element-deleted', (elementId: string) => {
      this.handleSharedElementDeleted(elementId);
    });

    this.socket.on('audio-sync-update', (audioState: AudioSyncState) => {
      this.callbacks.onAudioSyncUpdate?.(audioState);
    });

    this.socket.on('visual-sync-update', (visualState: VisualSyncState) => {
      this.callbacks.onVisualSyncUpdate?.(visualState);
    });

    this.socket.on('webrtc-offer', async (data: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
      await this.handleWebRTCOffer(data.fromUserId, data.offer);
    });

    this.socket.on('webrtc-answer', async (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      await this.handleWebRTCAnswer(data.fromUserId, data.answer);
    });

    this.socket.on('ice-candidate', async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      await this.handleICECandidate(data.fromUserId, data.candidate);
    });
  }

  async createSession(sessionName: string, settings: SessionSettings): Promise<SharedSession> {
    if (!this.socket) throw new Error('Not connected to server');

    return new Promise((resolve, reject) => {
      this.socket!.emit('create-session', { sessionName, settings }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentSession = response.session;
          resolve(response.session);
        }
      });
    });
  }

  async joinSession(sessionId: string, userInfo: { name: string; avatar?: string }): Promise<SharedSession> {
    if (!this.socket) throw new Error('Not connected to server');

    return new Promise((resolve, reject) => {
      this.socket!.emit('join-session', { sessionId, userInfo }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentSession = response.session;
          this.localUser = response.user;
          this.createUserAvatar(this.localUser!);
          resolve(response.session);
        }
      });
    });
  }

  async leaveSession(): Promise<void> {
    if (!this.socket || !this.currentSession) return;

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.dataChannels.clear();
    this.audioStreams.clear();

    // Clean up avatars and objects
    this.userAvatars.forEach(avatar => this.scene.remove(avatar));
    this.userAvatars.clear();
    this.sharedObjects.forEach(object => this.scene.remove(object));
    this.sharedObjects.clear();

    this.socket.emit('leave-session');
    this.currentSession = null;
    this.localUser = null;
  }

  updateUserPosition(position: THREE.Vector3, rotation: THREE.Euler) {
    if (!this.socket || !this.localUser) return;

    this.localUser.position.copy(position);
    this.localUser.rotation.copy(rotation);
    this.localUser.lastActivity = Date.now();

    this.socket.emit('user-position-update', {
      position: position.toArray(),
      rotation: rotation.toArray()
    });

    // Update local avatar
    const avatar = this.userAvatars.get(this.localUser.id);
    if (avatar) {
      avatar.position.copy(position);
      avatar.rotation.copy(rotation);
    }
  }

  createSharedElement(element: Omit<SharedCosmicElement, 'id' | 'ownerId' | 'lastModified'>): string {
    if (!this.socket || !this.localUser) throw new Error('Not connected to session');

    const elementId = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sharedElement: SharedCosmicElement = {
      ...element,
      id: elementId,
      ownerId: this.localUser.id,
      lastModified: Date.now()
    };

    this.socket.emit('create-shared-element', sharedElement);
    
    return elementId;
  }

  modifySharedElement(elementId: string, properties: Partial<SharedCosmicElement>) {
    if (!this.socket || !this.localUser) return;

    const element = this.currentSession?.cosmicState.sharedElements.get(elementId);
    if (!element) return;

    // Check permissions
    if (element.locked && element.ownerId !== this.localUser.id) {
      console.warn('Cannot modify locked element owned by another user');
      return;
    }

    const modifiedElement = {
      ...element,
      ...properties,
      lastModified: Date.now()
    };

    this.socket.emit('modify-shared-element', modifiedElement);
  }

  deleteSharedElement(elementId: string) {
    if (!this.socket || !this.localUser) return;

    const element = this.currentSession?.cosmicState.sharedElements.get(elementId);
    if (!element) return;

    // Check permissions
    if (element.ownerId !== this.localUser.id && !this.isSessionHost()) {
      console.warn('Cannot delete element owned by another user');
      return;
    }

    this.socket.emit('delete-shared-element', elementId);
  }

  private isSessionHost(): boolean {
    return this.currentSession?.hostId === this.localUser?.id;
  }

  async enableVoiceChat(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Add audio track to all peer connections
      this.peerConnections.forEach((pc, userId) => {
        stream.getAudioTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });

      if (this.localUser) {
        this.localUser.isVoiceActive = true;
        this.updateUserInfo();
      }
    } catch (error) {
      console.error('Failed to enable voice chat:', error);
    }
  }

  disableVoiceChat() {
    this.peerConnections.forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track?.kind === 'audio') {
          pc.removeTrack(sender);
        }
      });
    });

    if (this.localUser) {
      this.localUser.isVoiceActive = false;
      this.updateUserInfo();
    }
  }

  private updateUserInfo() {
    if (!this.socket || !this.localUser) return;
    
    this.socket.emit('update-user-info', {
      isVoiceActive: this.localUser.isVoiceActive
    });
  }

  // Event handlers
  private handleUserJoined(user: User) {
    if (this.currentSession) {
      this.currentSession.users.set(user.id, user);
    }
    
    this.createUserAvatar(user);
    this.initializePeerConnection(user.id);
    this.callbacks.onUserJoined?.(user);
  }

  private handleUserLeft(userId: string) {
    if (this.currentSession) {
      this.currentSession.users.delete(userId);
    }
    
    // Clean up avatar
    const avatar = this.userAvatars.get(userId);
    if (avatar) {
      this.scene.remove(avatar);
      this.userAvatars.delete(userId);
    }

    // Clean up peer connection
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }

    this.dataChannels.delete(userId);
    this.audioStreams.delete(userId);
    
    this.callbacks.onUserLeft?.(userId);
  }

  private handleUserPositionUpdate(userId: string, position: THREE.Vector3, rotation: THREE.Euler) {
    const user = this.currentSession?.users.get(userId);
    if (user) {
      user.position.copy(position);
      user.rotation.copy(rotation);
      user.lastActivity = Date.now();
    }

    const avatar = this.userAvatars.get(userId);
    if (avatar) {
      avatar.position.copy(position);
      avatar.rotation.copy(rotation);
    }

    this.callbacks.onUserPositionUpdate?.(userId, position, rotation);
  }

  private handleSharedElementCreated(element: SharedCosmicElement) {
    if (this.currentSession) {
      this.currentSession.cosmicState.sharedElements.set(element.id, element);
    }
    
    this.createSharedObject(element);
    this.callbacks.onSharedElementCreated?.(element);
  }

  private handleSharedElementModified(element: SharedCosmicElement) {
    if (this.currentSession) {
      this.currentSession.cosmicState.sharedElements.set(element.id, element);
    }
    
    this.updateSharedObject(element);
    this.callbacks.onSharedElementModified?.(element);
  }

  private handleSharedElementDeleted(elementId: string) {
    if (this.currentSession) {
      this.currentSession.cosmicState.sharedElements.delete(elementId);
    }
    
    const object = this.sharedObjects.get(elementId);
    if (object) {
      this.scene.remove(object);
      this.sharedObjects.delete(elementId);
    }
    
    this.callbacks.onSharedElementDeleted?.(elementId);
  }

  // WebRTC handlers
  private async handleWebRTCOffer(fromUserId: string, offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(fromUserId);
    await pc.setRemoteDescription(offer);
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.socket?.emit('webrtc-answer', {
      targetUserId: fromUserId,
      answer
    });
  }

  private async handleWebRTCAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }

  private async handleICECandidate(fromUserId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }

  private async initializePeerConnection(userId: string) {
    const pc = this.createPeerConnection(userId);
    
    // Create data channel
    const dataChannel = pc.createDataChannel('cosmicData', {
      ordered: true
    });
    
    this.setupDataChannel(dataChannel, userId);
    
    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.socket?.emit('webrtc-offer', {
      targetUserId: userId,
      offer
    });
  }

  private setupDataChannel(channel: RTCDataChannel, userId: string) {
    this.dataChannels.set(userId, channel);
    
    channel.onopen = () => {
      console.log(`Data channel opened with user ${userId}`);
    };
    
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleDataChannelMessage(userId, data);
      } catch (error) {
        console.error('Failed to parse data channel message:', error);
      }
    };
    
    channel.onclose = () => {
      console.log(`Data channel closed with user ${userId}`);
      this.dataChannels.delete(userId);
    };
  }

  private handleDataChannelMessage(userId: string, data: any) {
    switch (data.type) {
      case 'cosmic-interaction':
        this.handleCosmicInteraction(userId, data.payload);
        break;
      case 'audio-note':
        this.handleAudioNote(userId, data.payload);
        break;
      case 'visual-effect':
        this.handleVisualEffect(userId, data.payload);
        break;
    }
  }

  private setupAudioStream(userId: string, stream: MediaStream) {
    // Create audio element for spatial audio
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
    
    // Implement 3D spatial audio based on user position
    const user = this.currentSession?.users.get(userId);
    if (user) {
      // This would connect to Web Audio API for 3D positioning
      this.setup3DAudio(audio, user.position);
    }
  }

  private setup3DAudio(audio: HTMLAudioElement, position: THREE.Vector3) {
    // Implementation would use Web Audio API's PannerNode
    // for realistic 3D spatial audio positioning
  }

  private handleCosmicInteraction(userId: string, interaction: any) {
    // Handle real-time cosmic interactions from other users
  }

  private handleAudioNote(userId: string, noteEvent: NoteEvent) {
    // Handle real-time audio notes from other users
  }

  private handleVisualEffect(userId: string, effect: any) {
    // Handle real-time visual effects from other users
  }

  // Avatar and object management
  private createUserAvatar(user: User) {
    // Create a simple avatar representation
    const avatar = new THREE.Group();
    
    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: user.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    avatar.add(body);
    
    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 1.75;
    avatar.add(head);
    
    // Name tag
    this.createNameTag(avatar, user.name);
    
    avatar.position.copy(user.position);
    avatar.rotation.copy(user.rotation);
    
    this.scene.add(avatar);
    this.userAvatars.set(user.id, avatar);
  }

  private createNameTag(avatar: THREE.Group, name: string) {
    // Create a simple text sprite for the name tag
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText(name, canvas.width / 2, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const nameSprite = new THREE.Sprite(material);
    nameSprite.position.y = 2.5;
    nameSprite.scale.set(2, 0.5, 1);
    
    avatar.add(nameSprite);
  }

  private createSharedObject(element: SharedCosmicElement) {
    // Create 3D object based on shared element type
    let object: THREE.Object3D;
    
    switch (element.type) {
      case 'star':
        object = this.createStarObject(element);
        break;
      case 'planet':
        object = this.createPlanetObject(element);
        break;
      case 'nebula':
        object = this.createNebulaObject(element);
        break;
      default:
        object = this.createGenericObject(element);
    }
    
    object.position.copy(element.position);
    object.userData.sharedElement = element;
    
    this.scene.add(object);
    this.sharedObjects.set(element.id, object);
  }

  private updateSharedObject(element: SharedCosmicElement) {
    const object = this.sharedObjects.get(element.id);
    if (object) {
      object.position.copy(element.position);
      
      // Update other properties based on element type
      Object.assign(object.userData.sharedElement, element);
    }
  }

  private createStarObject(element: SharedCosmicElement): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.properties.color || 0xffffff 
    });
    return new THREE.Mesh(geometry, material);
  }

  private createPlanetObject(element: SharedCosmicElement): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(element.properties.radius || 1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.properties.color || 0x888888 
    });
    return new THREE.Mesh(geometry, material);
  }

  private createNebulaObject(element: SharedCosmicElement): THREE.Object3D {
    // Simplified nebula representation
    const geometry = new THREE.SphereGeometry(5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: element.properties.color || 0x8888ff,
      transparent: true,
      opacity: 0.3
    });
    return new THREE.Mesh(geometry, material);
  }

  private createGenericObject(element: SharedCosmicElement): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
    return new THREE.Mesh(geometry, material);
  }

  // Event subscription methods
  onUserJoined(callback: (user: User) => void) {
    this.callbacks.onUserJoined = callback;
  }

  onUserLeft(callback: (userId: string) => void) {
    this.callbacks.onUserLeft = callback;
  }

  onUserPositionUpdate(callback: (userId: string, position: THREE.Vector3, rotation: THREE.Euler) => void) {
    this.callbacks.onUserPositionUpdate = callback;
  }

  onSharedElementCreated(callback: (element: SharedCosmicElement) => void) {
    this.callbacks.onSharedElementCreated = callback;
  }

  onSharedElementModified(callback: (element: SharedCosmicElement) => void) {
    this.callbacks.onSharedElementModified = callback;
  }

  onSharedElementDeleted(callback: (elementId: string) => void) {
    this.callbacks.onSharedElementDeleted = callback;
  }

  onAudioSyncUpdate(callback: (audioState: AudioSyncState) => void) {
    this.callbacks.onAudioSyncUpdate = callback;
  }

  onVisualSyncUpdate(callback: (visualState: VisualSyncState) => void) {
    this.callbacks.onVisualSyncUpdate = callback;
  }

  createPeerConnection!: (userId: string) => RTCPeerConnection;

  dispose() {
    this.leaveSession();
    this.socket?.disconnect();
  }
}

// Helper functions for session management
export async function createQuickSession(
  collaboration: CollaborationManager,
  sessionName: string = 'Cosmic Journey'
): Promise<SharedSession> {
  const defaultSettings: SessionSettings = {
    maxUsers: 8,
    isPublic: true,
    allowGuests: true,
    syncAudio: true,
    syncVisuals: true,
    collaborativeCreation: true,
    voiceChat: true,
    recordSession: false
  };

  return await collaboration.createSession(sessionName, defaultSettings);
}

export async function joinPublicSession(
  collaboration: CollaborationManager,
  userInfo: { name: string; avatar?: string }
): Promise<SharedSession | null> {
  // This would typically query the server for available public sessions
  // For now, we'll return null indicating no public sessions available
  return null;
}

// Global collaboration instance
export const collaborationManager = new CollaborationManager(new THREE.Scene());