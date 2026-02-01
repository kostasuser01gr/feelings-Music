/**
 * Enhanced performance system with LOD, instancing, and optimization
 * for smooth real-time 3D cosmos rendering
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface PerformanceConfig {
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  enableOcclusion: boolean;
  targetFPS: number;
  adaptiveQuality: boolean;
  maxDrawCalls: number;
  instancedRendering: boolean;
  useWebWorkers: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsage: number;
  renderTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    memoryUsage: 0,
    renderTime: 0
  };
  
  private frameCount = 0;
  private lastTime = performance.now();
  private renderStartTime = 0;
  
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  update(renderer: THREE.WebGLRenderer) {
    const currentTime = performance.now();
    this.frameCount++;
    
    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Update renderer stats
      const info = renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.geometries = info.memory.geometries;
      this.metrics.textures = info.memory.textures;
      
      // Estimate memory usage (rough calculation)
      this.metrics.memoryUsage = (info.memory.geometries * 1024 + info.memory.textures * 512) / 1024; // KB
      
      // Notify listeners
      this.callbacks.forEach(callback => callback(this.metrics));
    }
  }
  
  startRenderTimer() {
    this.renderStartTime = performance.now();
  }
  
  endRenderTimer() {
    this.metrics.renderTime = performance.now() - this.renderStartTime;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export class AdaptiveQualityManager {
  private config: PerformanceConfig;
  private currentQuality = 1.0; // 1.0 = highest quality
  private performanceHistory: number[] = [];
  private adjustmentCooldown = 0;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  update(metrics: PerformanceMetrics, delta: number): number {
    if (!this.config.adaptiveQuality) return this.currentQuality;

    this.adjustmentCooldown -= delta;
    
    // Store performance history
    this.performanceHistory.push(metrics.fps);
    if (this.performanceHistory.length > 60) { // Keep last 60 frames
      this.performanceHistory.shift();
    }

    // Only adjust quality every 2 seconds
    if (this.adjustmentCooldown > 0) return this.currentQuality;

    const avgFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    const targetFPS = this.config.targetFPS;

    if (avgFPS < targetFPS * 0.8 && this.currentQuality > 0.3) {
      // Performance is poor, reduce quality
      this.currentQuality = Math.max(0.3, this.currentQuality - 0.1);
      this.adjustmentCooldown = 2.0;
    } else if (avgFPS > targetFPS * 0.95 && this.currentQuality < 1.0) {
      // Performance is good, increase quality
      this.currentQuality = Math.min(1.0, this.currentQuality + 0.05);
      this.adjustmentCooldown = 2.0;
    }

    return this.currentQuality;
  }

  getCurrentQuality(): number {
    return this.currentQuality;
  }

  setQuality(quality: number) {
    this.currentQuality = Math.max(0.1, Math.min(1.0, quality));
  }
}

// Level of Detail (LOD) system for cosmic objects
export class CosmicLODManager {
  private camera: THREE.Camera;
  private lodObjects: Map<string, THREE.LOD> = new Map();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  createLOD(
    name: string,
    highDetail: THREE.Object3D,
    mediumDetail: THREE.Object3D,
    lowDetail: THREE.Object3D,
    distances: [number, number] = [10, 50]
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    lod.addLevel(highDetail, 0);
    lod.addLevel(mediumDetail, distances[0]);
    lod.addLevel(lowDetail, distances[1]);
    
    this.lodObjects.set(name, lod);
    return lod;
  }

  update() {
    this.lodObjects.forEach(lod => {
      lod.update(this.camera);
    });
  }

  dispose() {
    this.lodObjects.clear();
  }
}

// Frustum culling for better performance
export class FrustumCuller {
  private camera: THREE.Camera;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private cameraMatrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  update() {
    // Safely access camera properties with null checks
    if (this.camera && 
        'projectionMatrix' in this.camera && 
        'matrixWorldInverse' in this.camera &&
        this.camera.projectionMatrix && 
        this.camera.matrixWorldInverse) {
      this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
      this.frustum.setFromProjectionMatrix(this.cameraMatrix);
    }
  }

  isVisible(object: THREE.Object3D): boolean {
    if (!object.geometry) return true;
    
    // Update bounding sphere if needed
    if (!object.geometry.boundingSphere) {
      object.geometry.computeBoundingSphere();
    }

    const sphere = object.geometry.boundingSphere;
    if (!sphere) return true;

    // Safely access sphere methods
    const worldSphere = sphere.clone ? sphere.clone() : sphere;
    if (worldSphere && 'applyMatrix4' in worldSphere) {
      worldSphere.applyMatrix4(object.matrixWorld);
    }

    return this.frustum.intersectsSphere(worldSphere);
  }
}

// Instanced rendering for particles and repeated objects
export class InstancedObjectManager {
  private instances: Map<string, THREE.InstancedMesh> = new Map();
  private matrices: Map<string, THREE.Matrix4[]> = new Map();
  private colors: Map<string, THREE.Color[]> = new Map();

  createInstancedMesh(
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    count: number
  ): THREE.InstancedMesh {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    
    this.instances.set(name, instancedMesh);
    this.matrices.set(name, Array(count).fill(null).map(() => new THREE.Matrix4()));
    this.colors.set(name, Array(count).fill(null).map(() => new THREE.Color()));
    
    return instancedMesh;
  }

  updateInstance(name: string, index: number, matrix: THREE.Matrix4, color?: THREE.Color) {
    const instancedMesh = this.instances.get(name);
    const matrices = this.matrices.get(name);
    const colors = this.colors.get(name);
    
    if (!instancedMesh || !matrices || !colors) return;

    matrices[index] = matrix;
    instancedMesh.setMatrixAt(index, matrix);
    
    if (color) {
      colors[index] = color;
      instancedMesh.setColorAt(index, color);
    }
  }

  finalizeUpdates(name: string) {
    const instancedMesh = this.instances.get(name);
    if (!instancedMesh) return;

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  dispose() {
    this.instances.forEach(mesh => {
      mesh.dispose();
    });
    this.instances.clear();
    this.matrices.clear();
    this.colors.clear();
  }
}

// Web Worker for heavy computations
export class CosmicWorkerManager {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Array<{ task: any; resolve: Function; reject: Function }> = [];

  constructor(workerCount: number = 2) {
    // Initialize workers
    for (let i = 0; i < workerCount; i++) {
      try {
        // Create worker inline to avoid external file dependency
        const workerCode = `
          self.onmessage = function(e) {
            const { type, data, id } = e.data;
            
            switch(type) {
              case 'calculateOrbitalPositions':
                const positions = calculateOrbitalPositions(data.planets, data.time);
                self.postMessage({ type: 'result', id, data: positions });
                break;
                
              case 'generateNoise':
                const noise = generatePerlinNoise(data.width, data.height, data.scale);
                self.postMessage({ type: 'result', id, data: noise });
                break;
                
              default:
                self.postMessage({ type: 'error', id, error: 'Unknown task type' });
            }
          };
          
          function calculateOrbitalPositions(planets, time) {
            return planets.map(planet => {
              const angle = (time * 2 * Math.PI) / planet.period;
              return {
                name: planet.name,
                x: Math.cos(angle) * planet.distance,
                y: 0,
                z: Math.sin(angle) * planet.distance
              };
            });
          }
          
          function generatePerlinNoise(width, height, scale) {
            const noise = new Array(width * height);
            for (let x = 0; x < width; x++) {
              for (let y = 0; y < height; y++) {
                const value = Math.sin(x * scale) * Math.cos(y * scale);
                noise[x * height + y] = value;
              }
            }
            return noise;
          }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        
        this.workers.push(worker);
        this.availableWorkers.push(worker);
      } catch (error) {
        console.warn('Web Worker not available:', error);
      }
    }
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { type, id, data, error } = e.data;
    const worker = e.target as Worker;
    
    // Return worker to available pool
    this.availableWorkers.push(worker);
    
    // Process next task if available
    this.processQueue();
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
  }

  private processQueue() {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) return;
    
    const worker = this.availableWorkers.pop()!;
    const { task, resolve, reject } = this.taskQueue.shift()!;
    
    const id = Math.random().toString(36).substr(2, 9);
    
    const onMessage = (e: MessageEvent) => {
      const { type, id: responseId, data, error } = e.data;
      
      if (responseId === id) {
        worker.removeEventListener('message', onMessage);
        
        if (type === 'result') {
          resolve(data);
        } else if (type === 'error') {
          reject(new Error(error));
        }
      }
    };
    
    worker.addEventListener('message', onMessage);
    worker.postMessage({ ...task, id });
  }

  executeTask(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  dispose() {
    this.workers.forEach(worker => {
      worker.terminate();
    });
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }
}

// Main performance hook
export function useCosmicPerformance(config: Partial<PerformanceConfig> = {}) {
  const { gl: renderer, camera, scene } = useThree();
  
  const fullConfig: PerformanceConfig = {
    enableLOD: true,
    enableFrustumCulling: true,
    enableOcclusion: false,
    targetFPS: 60,
    adaptiveQuality: true,
    maxDrawCalls: 1000,
    instancedRendering: true,
    useWebWorkers: true,
    ...config
  };
  
  const performanceMonitor = useRef<PerformanceMonitor | null>(new PerformanceMonitor());
  const qualityManager = useRef<AdaptiveQualityManager | null>(new AdaptiveQualityManager(fullConfig));
  const lodManager = useRef<CosmicLODManager | null>(new CosmicLODManager(camera));
  const frustumCuller = useRef<FrustumCuller | null>(new FrustumCuller(camera));
  const instancedManager = useRef<InstancedObjectManager | null>(new InstancedObjectManager());
  const workerManager = useRef<CosmicWorkerManager | null>(null);
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => {
    const monitor = new PerformanceMonitor();
    return monitor.getMetrics();
  });
  const [quality, setQuality] = useState(1.0);

  // Initialize workers if enabled
  useEffect(() => {
    if (fullConfig.useWebWorkers) {
      workerManager.current = new CosmicWorkerManager(2);
    }
    
    return () => {
      workerManager.current?.dispose();
    };
  }, [fullConfig.useWebWorkers]);

  // Subscribe to performance updates
  useEffect(() => {
    return () => {
      if (performanceMonitor.current) {
        const unsubscribe = performanceMonitor.current.subscribe(setMetrics);
        return unsubscribe;
      }
    };
  }, []);

  useFrame((state, delta) => {
    const monitor = performanceMonitor.current;
    const qualityMgr = qualityManager.current;
    
    monitor.startRenderTimer();
    
    // Update performance systems
    if (fullConfig.enableLOD) {
      lodManager.current.update();
    }
    
    if (fullConfig.enableFrustumCulling) {
      frustumCuller.current.update();
    }
    
    // Update adaptive quality
    const currentQuality = qualityMgr.update(monitor.getMetrics(), delta);
    if (currentQuality !== quality) {
      setQuality(currentQuality);
      
      // Apply quality settings
      renderer.setPixelRatio(window.devicePixelRatio * currentQuality);
      
      // Adjust shadow quality
      if (renderer.shadowMap) {
        const shadowMapSize = Math.floor(1024 * currentQuality);
        renderer.shadowMap.setSize(shadowMapSize, shadowMapSize);
      }
    }
    
    monitor.endRenderTimer();
    monitor.update(renderer);
  });

  // Cleanup
  useEffect(() => {
    return () => {
      lodManager.current.dispose();
      instancedManager.current.dispose();
      workerManager.current?.dispose();
    };
  }, []);

  return {
    metrics,
    quality,
    config: fullConfig,
    lodManager: lodManager.current,
    frustumCuller: frustumCuller.current,
    instancedManager: instancedManager.current,
    workerManager: workerManager.current,
    setQuality: (q: number) => qualityManager.current.setQuality(q)
  };
}

// Utility hooks for specific optimizations

export function useInstancedStars(count: number) {
  const { instancedManager } = useCosmicPerformance();
  
  const instancedMesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    return instancedManager.createInstancedMesh('stars', geometry, material, count);
  }, [count, instancedManager]);

  const updateStar = (index: number, position: THREE.Vector3, scale: number = 1, color?: THREE.Color) => {
    const matrix = new THREE.Matrix4();
    matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
    
    instancedManager.updateInstance('stars', index, matrix, color);
  };

  const finalize = () => {
    instancedManager.finalizeUpdates('stars');
  };

  return { instancedMesh, updateStar, finalize };
}

export function useFrustumCulling<T extends THREE.Object3D>(objects: T[]) {
  const { frustumCuller } = useCosmicPerformance();
  
  useFrame(() => {
    objects.forEach(object => {
      object.visible = frustumCuller.isVisible(object);
    });
  });
}