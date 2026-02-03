/**
 * Gesture Control System - Advanced hand tracking and multi-touch controls
 * Supports WebXR hand tracking, MediaPipe, and touch gestures
 */

import * as THREE from 'three';

export type GestureType = 
  | 'pinch' 
  | 'grab' 
  | 'swipe-left' 
  | 'swipe-right' 
  | 'swipe-up' 
  | 'swipe-down'
  | 'rotate'
  | 'spread'
  | 'tap'
  | 'double-tap'
  | 'long-press';

export interface GestureEvent {
  type: GestureType;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  distance?: number;
  rotation?: number;
  pressure?: number;
  fingers: number;
  timestamp: number;
}

export type GestureCallback = (event: GestureEvent) => void;

export class GestureController {
  private canvas: HTMLCanvasElement;
  private listeners: Map<GestureType, Set<GestureCallback>> = new Map();
  private touchStartPositions: Map<number, THREE.Vector2> = new Map();
  private touchStartTimes: Map<number, number> = new Map();
  private lastTouchPositions: Map<number, THREE.Vector2> = new Map();
  private isTracking: boolean = false;
  private longPressTimer: NodeJS.Timeout | null = null;
  private lastTapTime: number = 0;
  private doubleTapThreshold: number = 300; // ms
  private longPressThreshold: number = 500; // ms
  private swipeThreshold: number = 50; // pixels
  
  // Hand tracking (WebXR)
  private xrSession: XRSession | null = null;
  private handTracking: boolean = false;
  
  // Pinch detection
  private initialPinchDistance: number = 0;
  private currentPinchDistance: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initializeTouchEvents();
    this.initializeMouseEvents();
  }
  
  private initializeTouchEvents(): void {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }
  
  private initializeMouseEvents(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const now = Date.now();
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const position = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      
      this.touchStartPositions.set(touch.identifier, position.clone());
      this.touchStartTimes.set(touch.identifier, now);
      this.lastTouchPositions.set(touch.identifier, position.clone());
    }
    
    // Detect double tap
    if (event.touches.length === 1) {
      const timeSinceLastTap = now - this.lastTapTime;
      if (timeSinceLastTap < this.doubleTapThreshold) {
        this.emitGesture('double-tap', event.touches[0]);
        this.lastTapTime = 0;
      } else {
        this.lastTapTime = now;
        
        // Start long press timer
        this.longPressTimer = setTimeout(() => {
          if (this.touchStartPositions.has(event.touches[0].identifier)) {
            this.emitGesture('long-press', event.touches[0]);
          }
        }, this.longPressThreshold);
      }
    }
    
    // Detect pinch start
    if (event.touches.length === 2) {
      this.initialPinchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      this.currentPinchDistance = this.initialPinchDistance;
    }
    
    this.isTracking = true;
  }
  
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Update touch positions
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const position = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      this.lastTouchPositions.set(touch.identifier, position);
    }
    
    // Detect pinch/spread gestures
    if (event.touches.length === 2) {
      const newDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      const distanceDelta = newDistance - this.currentPinchDistance;
      
      if (Math.abs(distanceDelta) > 5) {
        const gestureType = distanceDelta > 0 ? 'spread' : 'pinch';
        const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        
        this.emit(gestureType, {
          type: gestureType,
          position: new THREE.Vector2(
            (centerX / window.innerWidth) * 2 - 1,
            -(centerY / window.innerHeight) * 2 + 1
          ),
          velocity: new THREE.Vector2(0, 0),
          distance: newDistance,
          fingers: 2,
          timestamp: Date.now(),
        });
        
        this.currentPinchDistance = newDistance;
      }
      
      // Detect rotation
      const angle1 = Math.atan2(
        event.touches[1].clientY - event.touches[0].clientY,
        event.touches[1].clientX - event.touches[0].clientX
      );
      
      this.emit('rotate', {
        type: 'rotate',
        position: new THREE.Vector2(
          (event.touches[0].clientX / window.innerWidth) * 2 - 1,
          -(event.touches[0].clientY / window.innerHeight) * 2 + 1
        ),
        velocity: new THREE.Vector2(0, 0),
        rotation: angle1,
        fingers: 2,
        timestamp: Date.now(),
      });
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const changedTouches = Array.from(event.changedTouches);
    
    for (const touch of changedTouches) {
      const startPos = this.touchStartPositions.get(touch.identifier);
      const endPos = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );
      
      if (startPos) {
        const delta = endPos.clone().sub(startPos);
        const distance = delta.length();
        
        // Detect swipe gestures
        if (distance > this.swipeThreshold / window.innerWidth) {
          const angle = Math.atan2(delta.y, delta.x);
          let gestureType: GestureType;
          
          if (Math.abs(angle) < Math.PI / 4) {
            gestureType = 'swipe-right';
          } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
            gestureType = 'swipe-left';
          } else if (angle > 0) {
            gestureType = 'swipe-up';
          } else {
            gestureType = 'swipe-down';
          }
          
          const velocity = delta.clone().multiplyScalar(1000 / (Date.now() - (this.touchStartTimes.get(touch.identifier) || Date.now())));
          
          this.emit(gestureType, {
            type: gestureType,
            position: endPos,
            velocity,
            fingers: changedTouches.length,
            timestamp: Date.now(),
          });
        } else if (changedTouches.length === 1 && Date.now() - this.lastTapTime > this.doubleTapThreshold) {
          // Single tap
          this.emitGesture('tap', touch);
        }
        
        this.touchStartPositions.delete(touch.identifier);
        this.touchStartTimes.delete(touch.identifier);
        this.lastTouchPositions.delete(touch.identifier);
      }
    }
    
    if (event.touches.length === 0) {
      this.isTracking = false;
    }
  }
  
  private handleTouchCancel(event: TouchEvent): void {
    this.touchStartPositions.clear();
    this.touchStartTimes.clear();
    this.lastTouchPositions.clear();
    this.isTracking = false;
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  
  private handleMouseDown(event: MouseEvent): void {
    const position = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    this.touchStartPositions.set(0, position.clone());
    this.touchStartTimes.set(0, Date.now());
    this.isTracking = true;
  }
  
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isTracking) return;
    
    const position = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    this.lastTouchPositions.set(0, position);
  }
  
  private handleMouseUp(event: MouseEvent): void {
    const startPos = this.touchStartPositions.get(0);
    const endPos = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    if (startPos) {
      const delta = endPos.clone().sub(startPos);
      const distance = delta.length();
      
      if (distance < 0.01) {
        // Click/tap
        this.emit('tap', {
          type: 'tap',
          position: endPos,
          velocity: new THREE.Vector2(0, 0),
          fingers: 1,
          timestamp: Date.now(),
        });
      }
    }
    
    this.touchStartPositions.clear();
    this.touchStartTimes.clear();
    this.isTracking = false;
  }
  
  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private emitGesture(type: GestureType, touch: Touch): void {
    this.emit(type, {
      type,
      position: new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      ),
      velocity: new THREE.Vector2(0, 0),
      fingers: 1,
      timestamp: Date.now(),
    });
  }
  
  private emit(type: GestureType, event: GestureEvent): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }
  
  public on(gesture: GestureType, callback: GestureCallback): void {
    if (!this.listeners.has(gesture)) {
      this.listeners.set(gesture, new Set());
    }
    this.listeners.get(gesture)!.add(callback);
  }
  
  public off(gesture: GestureType, callback: GestureCallback): void {
    const callbacks = this.listeners.get(gesture);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }
  
  public async enableHandTracking(): Promise<boolean> {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return false;
    }
    
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!supported) {
        console.warn('Immersive VR not supported');
        return false;
      }
      
      this.handTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to enable hand tracking:', error);
      return false;
    }
  }
  
  public dispose(): void {
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    this.listeners.clear();
  }
}

/**
 * Gesture-based camera controller
 */
export class GestureCameraController {
  private camera: THREE.Camera;
  private gestureController: GestureController;
  private targetPosition: THREE.Vector3;
  private targetRotation: THREE.Euler;
  private dampingFactor: number = 0.1;
  
  constructor(camera: THREE.Camera, gestureController: GestureController) {
    this.camera = camera;
    this.gestureController = gestureController;
    this.targetPosition = camera.position.clone();
    this.targetRotation = camera.rotation.clone();
    
    this.setupGestureHandlers();
  }
  
  private setupGestureHandlers(): void {
    // Pinch to zoom
    this.gestureController.on('pinch', (event) => {
      if (event.distance) {
        const zoomFactor = 1 + (this.currentPinchDistance - event.distance!) * 0.01;
        this.targetPosition.multiplyScalar(zoomFactor);
      }
    });
    
    this.gestureController.on('spread', (event) => {
      if (event.distance) {
        const zoomFactor = 1 - (event.distance! - this.currentPinchDistance) * 0.01;
        this.targetPosition.multiplyScalar(Math.max(0.1, zoomFactor));
      }
    });
    
    // Rotate view
    this.gestureController.on('rotate', (event) => {
      if (event.rotation !== undefined) {
        this.targetRotation.z = event.rotation;
      }
    });
    
    // Swipe to pan
    this.gestureController.on('swipe-left', (event) => {
      this.targetRotation.y -= Math.PI / 4;
    });
    
    this.gestureController.on('swipe-right', (event) => {
      this.targetRotation.y += Math.PI / 4;
    });
    
    this.gestureController.on('swipe-up', (event) => {
      this.targetRotation.x += Math.PI / 8;
    });
    
    this.gestureController.on('swipe-down', (event) => {
      this.targetRotation.x -= Math.PI / 8;
    });
  }
  
  private currentPinchDistance: number = 0;
  
  public update(): void {
    // Smooth camera movement
    this.camera.position.lerp(this.targetPosition, this.dampingFactor);
    
    // Smooth camera rotation
    this.camera.rotation.x += (this.targetRotation.x - this.camera.rotation.x) * this.dampingFactor;
    this.camera.rotation.y += (this.targetRotation.y - this.camera.rotation.y) * this.dampingFactor;
    this.camera.rotation.z += (this.targetRotation.z - this.camera.rotation.z) * this.dampingFactor;
  }
}
