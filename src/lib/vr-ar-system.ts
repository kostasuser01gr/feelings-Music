/**
 * VR/AR Integration System
 * Full VR immersion and AR overlay capabilities
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export interface XRConfig {
  enableVR: boolean;
  enableAR: boolean;
  enableHandTracking: boolean;
  enableControllers: boolean;
  roomScale: boolean;
}

export interface XRControllerState {
  id: number;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  grip: boolean;
  trigger: boolean;
  thumbstick: THREE.Vector2;
  buttons: boolean[];
}

export class VRARSystem {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private config: XRConfig;
  
  private xrSession: XRSession | null = null;
  private isVRActive: boolean = false;
  private isARActive: boolean = false;
  
  // Controllers
  private controller1: THREE.Group | null = null;
  private controller2: THREE.Group | null = null;
  private controllerGrip1: THREE.Group | null = null;
  private controllerGrip2: THREE.Group | null = null;
  private controllerModelFactory: XRControllerModelFactory;
  
  // Hand tracking
  private hand1: THREE.Group | null = null;
  private hand2: THREE.Group | null = null;
  
  // Teleportation
  private teleportMarker: THREE.Mesh | null = null;
  private teleportRay: THREE.Line | null = null;
  
  // AR specific
  private hitTestSource: XRHitTestSource | null = null;
  private hitTestSourceRequested: boolean = false;
  private reticle: THREE.Mesh | null = null;
  
  // Room scale boundaries
  private playArea: THREE.Line | null = null;
  
  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<XRConfig> = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    this.config = {
      enableVR: config.enableVR !== false,
      enableAR: config.enableAR !== false,
      enableHandTracking: config.enableHandTracking !== false,
      enableControllers: config.enableControllers !== false,
      roomScale: config.roomScale !== false,
    };
    
    this.controllerModelFactory = new XRControllerModelFactory();
    
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    // Enable XR
    this.renderer.xr.enabled = true;
    
    if (this.config.enableVR) {
      await this.initializeVR();
    }
    
    if (this.config.enableAR) {
      await this.initializeAR();
    }
    
    if (this.config.enableControllers) {
      this.setupControllers();
    }
    
    if (this.config.enableHandTracking) {
      this.setupHandTracking();
    }
    
    this.setupTeleportation();
  }
  
  private async initializeVR(): Promise<void> {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return;
    }
    
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (supported) {
        // VRButton will be added to the DOM
        const vrButton = VRButton.createButton(this.renderer);
        document.body.appendChild(vrButton);
      }
    } catch (error) {
      console.error('VR initialization failed:', error);
    }
  }
  
  private async initializeAR(): Promise<void> {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return;
    }
    
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (supported) {
        const arButton = ARButton.createButton(this.renderer, {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay'],
        });
        document.body.appendChild(arButton);
        
        // Create AR reticle
        this.createARReticle();
      }
    } catch (error) {
      console.error('AR initialization failed:', error);
    }
  }
  
  private setupControllers(): void {
    // Controller 1
    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', this.onSelectStart.bind(this));
    this.controller1.addEventListener('selectend', this.onSelectEnd.bind(this));
    this.controller1.addEventListener('connected', (event: any) => {
      this.controller1!.add(this.buildController(event.data));
    });
    this.scene.add(this.controller1);
    
    // Controller 2
    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', this.onSelectStart.bind(this));
    this.controller2.addEventListener('selectend', this.onSelectEnd.bind(this));
    this.controller2.addEventListener('connected', (event: any) => {
      this.controller2!.add(this.buildController(event.data));
    });
    this.scene.add(this.controller2);
    
    // Controller grips (for holding objects)
    this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip1.add(this.controllerModelFactory.createControllerModel(this.controllerGrip1));
    this.scene.add(this.controllerGrip1);
    
    this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    this.controllerGrip2.add(this.controllerModelFactory.createControllerModel(this.controllerGrip2));
    this.scene.add(this.controllerGrip2);
  }
  
  private buildController(data: XRInputSource): THREE.Object3D {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    
    return new THREE.Line(geometry, material);
  }
  
  private setupHandTracking(): void {
    // Hand tracking will be set up when the session starts
    this.renderer.xr.addEventListener('sessionstart', () => {
      const session = this.renderer.xr.getSession();
      if (session) {
        this.enableHandTracking(session);
      }
    });
  }
  
  private async enableHandTracking(session: XRSession): Promise<void> {
    try {
      // Request hand tracking
      const hands = await (session as any).requestReferenceSpace('hand-left');
      
      // Create hand meshes
      const handGeometry = new THREE.SphereGeometry(0.02);
      const handMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      
      this.hand1 = new THREE.Group();
      this.hand2 = new THREE.Group();
      
      // Add joint spheres
      for (let i = 0; i < 25; i++) {
        const joint = new THREE.Mesh(handGeometry, handMaterial);
        this.hand1.add(joint);
        
        const joint2 = new THREE.Mesh(handGeometry, handMaterial);
        this.hand2.add(joint2);
      }
      
      this.scene.add(this.hand1);
      this.scene.add(this.hand2);
    } catch (error) {
      console.warn('Hand tracking not available:', error);
    }
  }
  
  private setupTeleportation(): void {
    // Create teleport marker
    const geometry = new THREE.RingGeometry(0.3, 0.35, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    
    this.teleportMarker = new THREE.Mesh(geometry, material);
    this.teleportMarker.rotation.x = -Math.PI / 2;
    this.teleportMarker.visible = false;
    this.scene.add(this.teleportMarker);
    
    // Create teleport ray
    const rayGeometry = new THREE.BufferGeometry();
    rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -5], 3));
    const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    
    this.teleportRay = new THREE.Line(rayGeometry, rayMaterial);
    this.teleportRay.visible = false;
  }
  
  private createARReticle(): void {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    this.reticle = new THREE.Mesh(geometry, material);
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }
  
  private onSelectStart(event: any): void {
    const controller = event.target;
    
    // Show teleport marker
    if (this.teleportMarker && this.isVRActive) {
      this.teleportMarker.visible = true;
      if (this.teleportRay) {
        this.teleportRay.visible = true;
        controller.add(this.teleportRay);
      }
    }
    
    // Handle AR object placement
    if (this.isARActive && this.reticle && this.reticle.visible) {
      this.placeARObject(this.reticle.position);
    }
  }
  
  private onSelectEnd(event: any): void {
    const controller = event.target;
    
    // Teleport in VR
    if (this.teleportMarker && this.teleportMarker.visible && this.isVRActive) {
      const offset = this.teleportMarker.position.clone();
      offset.y = this.camera.position.y;
      
      const baseReferenceSpace = this.renderer.xr.getReferenceSpace();
      if (baseReferenceSpace) {
        const offsetPosition = {
          x: -offset.x,
          y: -offset.y,
          z: -offset.z,
          w: 1,
        };
        
        // Apply teleportation
        // Note: Actual implementation would use XR reference space offset
      }
      
      this.teleportMarker.visible = false;
      if (this.teleportRay) {
        this.teleportRay.visible = false;
      }
    }
  }
  
  private placeARObject(position: THREE.Vector3): void {
    // Override this method to place custom AR objects
    console.log('Placing AR object at:', position);
  }
  
  public update(frame?: XRFrame): void {
    if (!frame) return;
    
    // Update AR hit test
    if (this.isARActive && frame) {
      this.updateARHitTest(frame);
    }
    
    // Update hand tracking
    if (this.config.enableHandTracking) {
      this.updateHandTracking(frame);
    }
    
    // Update controllers
    if (this.controller1 && this.controller2) {
      this.updateTeleportRay();
    }
  }
  
  private updateARHitTest(frame: XRFrame): void {
    const session = frame.session;
    
    if (!this.hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource?.({ space: referenceSpace })?.then((source) => {
          this.hitTestSource = source;
        });
      });
      
      this.hitTestSourceRequested = true;
    }
    
    if (this.hitTestSource && this.reticle) {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const referenceSpace = this.renderer.xr.getReferenceSpace();
        
        if (referenceSpace) {
          const pose = hit.getPose(referenceSpace);
          
          if (pose) {
            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);
          }
        }
      } else {
        this.reticle.visible = false;
      }
    }
  }
  
  private updateHandTracking(frame: XRFrame): void {
    // Update hand joint positions
    // This would require XRHand API implementation
  }
  
  private updateTeleportRay(): void {
    if (!this.controller1 || !this.teleportRay || !this.teleportMarker) return;
    
    // Raycast from controller
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(this.controller1.matrixWorld);
    
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(this.controller1.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    
    // Cast ray to find teleport position
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0 && this.teleportRay.visible) {
      const intersection = intersects[0];
      this.teleportMarker.position.copy(intersection.point);
    }
  }
  
  public enterVR(): void {
    this.isVRActive = true;
  }
  
  public exitVR(): void {
    this.isVRActive = false;
  }
  
  public enterAR(): void {
    this.isARActive = true;
  }
  
  public exitAR(): void {
    this.isARActive = false;
    this.hitTestSourceRequested = false;
    
    if (this.hitTestSource) {
      this.hitTestSource.cancel();
      this.hitTestSource = null;
    }
  }
  
  public getControllerState(controllerIndex: 0 | 1): XRControllerState | null {
    const controller = controllerIndex === 0 ? this.controller1 : this.controller2;
    if (!controller) return null;
    
    return {
      id: controllerIndex,
      position: new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld),
      rotation: new THREE.Quaternion().setFromRotationMatrix(controller.matrixWorld),
      grip: false,
      trigger: false,
      thumbstick: new THREE.Vector2(0, 0),
      buttons: [],
    };
  }
  
  public dispose(): void {
    // Clean up controllers
    if (this.controller1) this.scene.remove(this.controller1);
    if (this.controller2) this.scene.remove(this.controller2);
    if (this.controllerGrip1) this.scene.remove(this.controllerGrip1);
    if (this.controllerGrip2) this.scene.remove(this.controllerGrip2);
    
    // Clean up hands
    if (this.hand1) this.scene.remove(this.hand1);
    if (this.hand2) this.scene.remove(this.hand2);
    
    // Clean up teleportation
    if (this.teleportMarker) {
      this.teleportMarker.geometry.dispose();
      (this.teleportMarker.material as THREE.Material).dispose();
      this.scene.remove(this.teleportMarker);
    }
    
    // Clean up AR reticle
    if (this.reticle) {
      this.reticle.geometry.dispose();
      (this.reticle.material as THREE.Material).dispose();
      this.scene.remove(this.reticle);
    }
    
    // Disable XR
    this.renderer.xr.enabled = false;
  }
}

/**
 * Immersive Emotion Visualization in VR/AR
 */
export class ImmersiveEmotionVR {
  private vrSystem: VRARSystem;
  private emotionSpheres: Map<string, THREE.Mesh> = new Map();
  
  constructor(vrSystem: VRARSystem, scene: THREE.Scene) {
    this.vrSystem = vrSystem;
    this.initializeEmotionSpheres(scene);
  }
  
  private initializeEmotionSpheres(scene: THREE.Scene): void {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'love', 'peace', 'excitement', 'calm'];
    const colors = [0xFFD700, 0x4169E1, 0xFF4500, 0x9370DB, 0xFF69B4, 0x98FB98, 0xFF6347, 0x87CEEB];
    
    emotions.forEach((emotion, index) => {
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: colors[index],
        emissive: colors[index],
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      // Position spheres in a circle around the user
      const angle = (index / emotions.length) * Math.PI * 2;
      const radius = 2;
      sphere.position.set(
        Math.cos(angle) * radius,
        1.5,
        Math.sin(angle) * radius
      );
      
      scene.add(sphere);
      this.emotionSpheres.set(emotion, sphere);
    });
  }
  
  public animateEmotion(emotion: string, intensity: number): void {
    const sphere = this.emotionSpheres.get(emotion);
    if (sphere) {
      const scale = 1 + intensity * 0.5;
      sphere.scale.setScalar(scale);
      
      if (sphere.material instanceof THREE.MeshStandardMaterial) {
        sphere.material.emissiveIntensity = 0.5 + intensity * 0.5;
      }
    }
  }
  
  public dispose(): void {
    for (const sphere of this.emotionSpheres.values()) {
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
    }
    this.emotionSpheres.clear();
  }
}
