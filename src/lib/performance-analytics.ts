/**
 * Performance Analytics System
 * Comprehensive monitoring, optimization, and adaptive quality management
 */

export interface PerformanceMetrics {
  timestamp: number;
  frameRate: {
    current: number;
    average: number;
    min: number;
    max: number;
    drops: number;
    stability: number; // 0-1, higher is more stable
  };
  memory: {
    used: number; // MB
    heap: number; // MB
    textures: number; // MB
    geometries: number; // MB
    buffers: number; // MB
    total: number; // MB
    available: number; // MB
    pressure: number; // 0-1, higher is more pressure
  };
  rendering: {
    drawCalls: number;
    triangles: number;
    vertices: number;
    textureSwitches: number;
    shaderSwitches: number;
    renderTime: number; // ms
    gpuTime: number; // ms
    cpuTime: number; // ms
  };
  resources: {
    activeObjects: number;
    visibleObjects: number;
    culledObjects: number;
    lodLevel: number; // Current level of detail
    particleCount: number;
    activeLights: number;
    activeMaterials: number;
  };
  user: {
    interactions: number;
    engagement: number; // 0-1
    satisfaction: number; // 0-1
    motionSickness: number; // 0-1
    eyeStrain: number; // 0-1
    sessionDuration: number; // seconds
  };
  system: {
    deviceType: string;
    gpuTier: number; // 1-3
    cpuCores: number;
    memoryTotal: number; // GB
    platform: string;
    webglVersion: string;
    capabilities: string[];
  };
}

export interface QualitySettings {
  levelOfDetail: number; // 0-1
  particleDensity: number; // 0-1
  shadowQuality: number; // 0-1
  effectComplexity: number; // 0-1
  textureResolution: number; // 0-1
  renderScale: number; // 0.5-1.0
  antialiasingLevel: number; // 0-4
  updateFrequency: number; // Hz
  cullingDistance: number;
  animationQuality: number; // 0-1
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'memory' | 'framerate' | 'rendering' | 'user' | 'system';
  message: string;
  recommendation: string;
  timestamp: number;
  severity: number; // 0-1
  autoResolved: boolean;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  targetMetric: string;
  improvementExpected: number;
  cost: number; // Performance/quality cost
  conditions: string[];
  implementation: () => Promise<void>;
  rollback: () => Promise<void>;
}

export class PerformanceAnalyzer {
  private metrics: PerformanceMetrics[] = [];
  private currentMetrics: PerformanceMetrics;
  private qualitySettings: QualitySettings;
  private alerts: PerformanceAlert[] = [];
  private optimizationStrategies: Map<string, OptimizationStrategy> = new Map();
  
  private frameTimeBuffer: number[] = [];
  private memoryBuffer: number[] = [];
  private renderTimeBuffer: number[] = [];
  
  private performanceObserver?: PerformanceObserver;
  private memoryObserver?: any; // MemoryObserver when available
  private resizeObserver?: ResizeObserver;
  
  private isMonitoring = false;
  private lastSampleTime = 0;
  private sampleInterval = 1000; // 1 second
  private historyLimit = 300; // 5 minutes at 1s intervals
  
  private thresholds = {
    frameRate: {
      target: 60,
      warning: 45,
      critical: 30
    },
    memory: {
      warning: 512, // MB
      critical: 1024 // MB
    },
    renderTime: {
      warning: 16.67, // ms (60fps)
      critical: 33.33 // ms (30fps)
    },
    drawCalls: {
      warning: 1000,
      critical: 2000
    }
  };

  private callbacks: {
    onMetricsUpdate: (metrics: PerformanceMetrics) => void;
    onQualityAdjustment: (settings: QualitySettings) => void;
    onAlert: (alert: PerformanceAlert) => void;
    onOptimization: (strategy: OptimizationStrategy) => void;
  } = {} as any;

  constructor() {
    this.currentMetrics = this.createInitialMetrics();
    this.qualitySettings = this.createDefaultQualitySettings();
    this.initializeOptimizationStrategies();
    this.setupPerformanceObservers();
  }

  private createInitialMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      frameRate: {
        current: 60,
        average: 60,
        min: 60,
        max: 60,
        drops: 0,
        stability: 1.0
      },
      memory: {
        used: 0,
        heap: 0,
        textures: 0,
        geometries: 0,
        buffers: 0,
        total: 0,
        available: 0,
        pressure: 0
      },
      rendering: {
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        textureSwitches: 0,
        shaderSwitches: 0,
        renderTime: 0,
        gpuTime: 0,
        cpuTime: 0
      },
      resources: {
        activeObjects: 0,
        visibleObjects: 0,
        culledObjects: 0,
        lodLevel: 1.0,
        particleCount: 0,
        activeLights: 0,
        activeMaterials: 0
      },
      user: {
        interactions: 0,
        engagement: 0.8,
        satisfaction: 0.8,
        motionSickness: 0.1,
        eyeStrain: 0.1,
        sessionDuration: 0
      },
      system: {
        deviceType: this.detectDeviceType(),
        gpuTier: this.detectGPUTier(),
        cpuCores: navigator.hardwareConcurrency || 4,
        memoryTotal: this.estimateMemory(),
        platform: navigator.platform,
        webglVersion: this.detectWebGLVersion(),
        capabilities: this.detectCapabilities()
      }
    };
  }

  private createDefaultQualitySettings(): QualitySettings {
    const gpuTier = this.detectGPUTier();
    const memoryGB = this.estimateMemory();
    
    // Adaptive defaults based on system capabilities
    const baseQuality = Math.min(1, (gpuTier / 3) * (memoryGB / 8));
    
    return {
      levelOfDetail: 0.5 + baseQuality * 0.5,
      particleDensity: 0.3 + baseQuality * 0.7,
      shadowQuality: baseQuality > 0.7 ? 1.0 : baseQuality > 0.4 ? 0.5 : 0,
      effectComplexity: 0.4 + baseQuality * 0.6,
      textureResolution: 0.5 + baseQuality * 0.5,
      renderScale: 0.8 + baseQuality * 0.2,
      antialiasingLevel: baseQuality > 0.8 ? 4 : baseQuality > 0.5 ? 2 : 0,
      updateFrequency: baseQuality > 0.7 ? 60 : baseQuality > 0.4 ? 30 : 20,
      cullingDistance: 50 + baseQuality * 150,
      animationQuality: 0.5 + baseQuality * 0.5
    };
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastSampleTime = performance.now();
    
    // Start frame rate monitoring
    this.startFrameRateMonitoring();
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Start render time monitoring
    this.startRenderTimeMonitoring();
    
    // Start system monitoring
    this.startSystemMonitoring();
    
    console.log('Performance monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    console.log('Performance monitoring stopped');
  }

  private startFrameRateMonitoring() {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    
    const measureFrame = () => {
      if (!this.isMonitoring) return;
      
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      frameCount++;
      
      this.frameTimeBuffer.push(frameTime);
      if (this.frameTimeBuffer.length > 60) { // Keep 1 second of frames at 60fps
        this.frameTimeBuffer.shift();
      }
      
      // Calculate frame rate metrics every second
      if (frameCount % 60 === 0) {
        this.updateFrameRateMetrics();
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  private updateFrameRateMetrics() {
    if (this.frameTimeBuffer.length === 0) return;
    
    const frameTimes = this.frameTimeBuffer;
    const frameRates = frameTimes.map(time => 1000 / time);
    
    const current = frameRates[frameRates.length - 1];
    const average = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    const min = Math.min(...frameRates);
    const max = Math.max(...frameRates);
    
    // Count frame drops (below 55fps)
    const drops = frameRates.filter(rate => rate < 55).length;
    
    // Calculate stability (coefficient of variation)
    const variance = frameRates.reduce((acc, rate) => acc + Math.pow(rate - average, 2), 0) / frameRates.length;
    const standardDeviation = Math.sqrt(variance);
    const stability = Math.max(0, 1 - (standardDeviation / average));
    
    this.currentMetrics.frameRate = {
      current,
      average,
      min,
      max,
      drops,
      stability
    };
    
    // Check for frame rate alerts
    this.checkFrameRateAlerts(current, average);
  }

  private startMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        if (!this.isMonitoring) return;
        
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        const totalMB = memory.totalJSHeapSize / (1024 * 1024);
        const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
        
        this.memoryBuffer.push(usedMB);
        if (this.memoryBuffer.length > this.historyLimit) {
          this.memoryBuffer.shift();
        }
        
        const pressure = usedMB / limitMB;
        const available = limitMB - usedMB;
        
        this.currentMetrics.memory = {
          used: usedMB,
          heap: totalMB,
          textures: 0, // Would need WebGL renderer access
          geometries: 0, // Would need Three.js renderer access
          buffers: 0, // Would need renderer access
          total: limitMB,
          available,
          pressure
        };
        
        // Check for memory alerts
        this.checkMemoryAlerts(usedMB, pressure);
        
        setTimeout(checkMemory, this.sampleInterval);
      };
      
      checkMemory();
    }
  }

  private startRenderTimeMonitoring() {
    // This would integrate with the rendering loop to measure render times
    // For now, we'll simulate it
    const measureRenderTime = () => {
      if (!this.isMonitoring) return;
      
      // Simulate render time measurement
      const renderTime = Math.random() * 16 + 8; // 8-24ms
      
      this.renderTimeBuffer.push(renderTime);
      if (this.renderTimeBuffer.length > 60) {
        this.renderTimeBuffer.shift();
      }
      
      const averageRenderTime = this.renderTimeBuffer.reduce((a, b) => a + b, 0) / this.renderTimeBuffer.length;
      
      this.currentMetrics.rendering.renderTime = averageRenderTime;
      this.currentMetrics.rendering.cpuTime = averageRenderTime * 0.7;
      this.currentMetrics.rendering.gpuTime = averageRenderTime * 0.3;
      
      // Check for render time alerts
      this.checkRenderTimeAlerts(averageRenderTime);
      
      setTimeout(measureRenderTime, this.sampleInterval);
    };
    
    measureRenderTime();
  }

  private startSystemMonitoring() {
    // Monitor viewport changes
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateSystemMetrics();
      });
      this.resizeObserver.observe(document.body);
    }
    
    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      this.updateSystemMetrics();
    });
    
    // Monitor network status
    window.addEventListener('online', () => this.updateSystemMetrics());
    window.addEventListener('offline', () => this.updateSystemMetrics());
  }

  private setupPerformanceObservers() {
    if (typeof PerformanceObserver !== 'undefined') {
      // Navigation timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            // Track page load performance
          } else if (entry.entryType === 'measure') {
            // Track custom measurements
          }
        }
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
      } catch (error) {
        console.warn('Performance observer not fully supported');
      }
    }
  }

  updateRenderingMetrics(renderInfo: {
    drawCalls: number;
    triangles: number;
    vertices: number;
    textureSwitches: number;
    shaderSwitches: number;
  }) {
    this.currentMetrics.rendering = {
      ...this.currentMetrics.rendering,
      ...renderInfo
    };
    
    this.checkRenderingAlerts(renderInfo);
  }

  updateResourceMetrics(resourceInfo: {
    activeObjects: number;
    visibleObjects: number;
    culledObjects: number;
    particleCount: number;
    activeLights: number;
    activeMaterials: number;
  }) {
    this.currentMetrics.resources = {
      ...this.currentMetrics.resources,
      ...resourceInfo
    };
  }

  updateUserMetrics(userInfo: {
    interactions?: number;
    engagement?: number;
    satisfaction?: number;
    motionSickness?: number;
    eyeStrain?: number;
  }) {
    this.currentMetrics.user = {
      ...this.currentMetrics.user,
      ...userInfo,
      sessionDuration: (Date.now() - this.metrics[0]?.timestamp || Date.now()) / 1000
    };
    
    this.checkUserExperienceAlerts(this.currentMetrics.user);
  }

  private checkFrameRateAlerts(current: number, average: number) {
    if (current < this.thresholds.frameRate.critical) {
      this.createAlert({
        type: 'critical',
        category: 'framerate',
        message: `Critical frame rate drop: ${current.toFixed(1)}fps`,
        recommendation: 'Reduce visual complexity immediately',
        severity: 0.9
      });
      this.autoOptimizeFrameRate();
    } else if (average < this.thresholds.frameRate.warning) {
      this.createAlert({
        type: 'warning',
        category: 'framerate',
        message: `Low average frame rate: ${average.toFixed(1)}fps`,
        recommendation: 'Consider reducing particle density and effects',
        severity: 0.6
      });
    }
  }

  private checkMemoryAlerts(used: number, pressure: number) {
    if (pressure > 0.9) {
      this.createAlert({
        type: 'critical',
        category: 'memory',
        message: `Critical memory pressure: ${(pressure * 100).toFixed(1)}%`,
        recommendation: 'Free resources immediately to prevent crashes',
        severity: 0.95
      });
      this.autoOptimizeMemory();
    } else if (used > this.thresholds.memory.warning) {
      this.createAlert({
        type: 'warning',
        category: 'memory',
        message: `High memory usage: ${used.toFixed(0)}MB`,
        recommendation: 'Clean up unused resources',
        severity: 0.7
      });
    }
  }

  private checkRenderTimeAlerts(renderTime: number) {
    if (renderTime > this.thresholds.renderTime.critical) {
      this.createAlert({
        type: 'critical',
        category: 'rendering',
        message: `Critical render time: ${renderTime.toFixed(1)}ms`,
        recommendation: 'Reduce draw calls and complexity',
        severity: 0.85
      });
      this.autoOptimizeRendering();
    } else if (renderTime > this.thresholds.renderTime.warning) {
      this.createAlert({
        type: 'warning',
        category: 'rendering',
        message: `High render time: ${renderTime.toFixed(1)}ms`,
        recommendation: 'Consider optimizing shaders and geometry',
        severity: 0.6
      });
    }
  }

  private checkRenderingAlerts(renderInfo: any) {
    if (renderInfo.drawCalls > this.thresholds.drawCalls.critical) {
      this.createAlert({
        type: 'critical',
        category: 'rendering',
        message: `Too many draw calls: ${renderInfo.drawCalls}`,
        recommendation: 'Implement batching and instancing',
        severity: 0.8
      });
    }
  }

  private checkUserExperienceAlerts(userMetrics: any) {
    if (userMetrics.motionSickness > 0.7) {
      this.createAlert({
        type: 'warning',
        category: 'user',
        message: 'High motion sickness indicators detected',
        recommendation: 'Reduce camera movement and enable comfort settings',
        severity: 0.7
      });
      this.autoAdjustForComfort();
    }
    
    if (userMetrics.eyeStrain > 0.8) {
      this.createAlert({
        type: 'warning',
        category: 'user',
        message: 'High eye strain indicators detected',
        recommendation: 'Adjust brightness and reduce visual complexity',
        severity: 0.6
      });
    }
  }

  private createAlert(alertInfo: Partial<PerformanceAlert>) {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'warning',
      category: 'system',
      message: '',
      recommendation: '',
      timestamp: Date.now(),
      severity: 0.5,
      autoResolved: false,
      ...alertInfo
    };
    
    this.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    }
    
    this.callbacks.onAlert?.(alert);
    
    console.warn('Performance Alert:', alert.message);
  }

  private updateSystemMetrics() {
    this.currentMetrics.system = {
      ...this.currentMetrics.system,
      deviceType: this.detectDeviceType(),
      platform: navigator.platform
    };
  }

  // Auto-optimization methods
  private autoOptimizeFrameRate() {
    this.adjustQuality({
      levelOfDetail: Math.max(0.1, this.qualitySettings.levelOfDetail - 0.2),
      particleDensity: Math.max(0.1, this.qualitySettings.particleDensity - 0.3),
      effectComplexity: Math.max(0.1, this.qualitySettings.effectComplexity - 0.2),
      updateFrequency: Math.max(20, this.qualitySettings.updateFrequency - 10)
    });
  }

  private autoOptimizeMemory() {
    this.adjustQuality({
      textureResolution: Math.max(0.2, this.qualitySettings.textureResolution - 0.3),
      particleDensity: Math.max(0.1, this.qualitySettings.particleDensity - 0.4),
      cullingDistance: Math.max(25, this.qualitySettings.cullingDistance - 50)
    });
  }

  private autoOptimizeRendering() {
    this.adjustQuality({
      shadowQuality: Math.max(0, this.qualitySettings.shadowQuality - 0.5),
      antialiasingLevel: Math.max(0, this.qualitySettings.antialiasingLevel - 1),
      renderScale: Math.max(0.5, this.qualitySettings.renderScale - 0.1)
    });
  }

  private autoAdjustForComfort() {
    this.adjustQuality({
      animationQuality: Math.max(0.2, this.qualitySettings.animationQuality - 0.3),
      effectComplexity: Math.max(0.2, this.qualitySettings.effectComplexity - 0.2)
    });
  }

  adjustQuality(adjustments: Partial<QualitySettings>) {
    const previousSettings = { ...this.qualitySettings };
    
    Object.assign(this.qualitySettings, adjustments);
    
    // Clamp values to valid ranges
    this.qualitySettings.levelOfDetail = Math.max(0, Math.min(1, this.qualitySettings.levelOfDetail));
    this.qualitySettings.particleDensity = Math.max(0, Math.min(1, this.qualitySettings.particleDensity));
    this.qualitySettings.shadowQuality = Math.max(0, Math.min(1, this.qualitySettings.shadowQuality));
    this.qualitySettings.effectComplexity = Math.max(0, Math.min(1, this.qualitySettings.effectComplexity));
    this.qualitySettings.textureResolution = Math.max(0, Math.min(1, this.qualitySettings.textureResolution));
    this.qualitySettings.renderScale = Math.max(0.5, Math.min(1, this.qualitySettings.renderScale));
    this.qualitySettings.antialiasingLevel = Math.max(0, Math.min(4, this.qualitySettings.antialiasingLevel));
    this.qualitySettings.updateFrequency = Math.max(10, Math.min(120, this.qualitySettings.updateFrequency));
    this.qualitySettings.cullingDistance = Math.max(10, Math.min(500, this.qualitySettings.cullingDistance));
    this.qualitySettings.animationQuality = Math.max(0, Math.min(1, this.qualitySettings.animationQuality));
    
    this.callbacks.onQualityAdjustment?.(this.qualitySettings);
    
    console.log('Quality settings adjusted:', {
      previous: previousSettings,
      current: this.qualitySettings
    });
  }

  // Adaptive optimization
  async optimizeBasedOnMetrics(): Promise<void> {
    const metrics = this.getCurrentMetrics();
    
    // Calculate performance score (0-1, higher is better)
    const performanceScore = this.calculatePerformanceScore(metrics);
    
    if (performanceScore < 0.6) {
      // Poor performance - optimize aggressively
      await this.applyOptimizationStrategy('aggressive');
    } else if (performanceScore < 0.8) {
      // Moderate performance - apply targeted optimizations
      await this.applyOptimizationStrategy('moderate');
    } else if (performanceScore > 0.9) {
      // Excellent performance - can increase quality
      await this.applyOptimizationStrategy('enhance');
    }
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const frameScore = Math.min(1, metrics.frameRate.average / this.thresholds.frameRate.target);
    const memoryScore = Math.max(0, 1 - metrics.memory.pressure);
    const renderScore = Math.max(0, 1 - (metrics.rendering.renderTime / this.thresholds.renderTime.warning));
    const stabilityScore = metrics.frameRate.stability;
    
    return (frameScore + memoryScore + renderScore + stabilityScore) / 4;
  }

  private async applyOptimizationStrategy(type: 'aggressive' | 'moderate' | 'enhance'): Promise<void> {
    const strategy = this.optimizationStrategies.get(type);
    if (strategy) {
      await strategy.implementation();
      this.callbacks.onOptimization?.(strategy);
    }
  }

  // System detection methods
  private detectDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'mobile';
    if (/Tablet/.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private detectGPUTier(): number {
    // Simplified GPU tier detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 1;
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    // High-end GPUs
    if (/RTX|GTX|Radeon RX|Pro|Vega/.test(renderer)) return 3;
    
    // Mid-range GPUs
    if (/GPU|Graphics|Intel/.test(renderer)) return 2;
    
    // Low-end or integrated GPUs
    return 1;
  }

  private estimateMemory(): number {
    // Estimate system memory in GB
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
    }
    return 4; // Default assumption
  }

  private detectWebGLVersion(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) return 'WebGL 2.0';
    
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl1) return 'WebGL 1.0';
    
    return 'None';
  }

  private detectCapabilities(): string[] {
    const capabilities = [];
    
    if ('deviceMemory' in navigator) capabilities.push('Device Memory API');
    if ('connection' in navigator) capabilities.push('Network Information API');
    if ('getBattery' in navigator) capabilities.push('Battery API');
    if ('requestIdleCallback' in window) capabilities.push('Request Idle Callback');
    if ('IntersectionObserver' in window) capabilities.push('Intersection Observer');
    if ('PerformanceObserver' in window) capabilities.push('Performance Observer');
    
    return capabilities;
  }

  private initializeOptimizationStrategies() {
    this.optimizationStrategies.set('aggressive', {
      id: 'aggressive',
      name: 'Aggressive Optimization',
      description: 'Significantly reduce quality for performance',
      targetMetric: 'frameRate',
      improvementExpected: 0.4,
      cost: 0.6,
      conditions: ['frameRate < 30', 'memoryPressure > 0.8'],
      implementation: async () => {
        this.adjustQuality({
          levelOfDetail: 0.3,
          particleDensity: 0.2,
          shadowQuality: 0,
          effectComplexity: 0.2,
          textureResolution: 0.3,
          renderScale: 0.7,
          antialiasingLevel: 0,
          updateFrequency: 30
        });
      },
      rollback: async () => {
        this.qualitySettings = this.createDefaultQualitySettings();
        this.callbacks.onQualityAdjustment?.(this.qualitySettings);
      }
    });

    this.optimizationStrategies.set('moderate', {
      id: 'moderate',
      name: 'Moderate Optimization',
      description: 'Balance quality and performance',
      targetMetric: 'overall',
      improvementExpected: 0.2,
      cost: 0.3,
      conditions: ['frameRate < 50', 'memoryPressure > 0.6'],
      implementation: async () => {
        this.adjustQuality({
          levelOfDetail: Math.max(0.4, this.qualitySettings.levelOfDetail - 0.2),
          particleDensity: Math.max(0.4, this.qualitySettings.particleDensity - 0.2),
          effectComplexity: Math.max(0.4, this.qualitySettings.effectComplexity - 0.2)
        });
      },
      rollback: async () => {
        // Partial rollback
      }
    });

    this.optimizationStrategies.set('enhance', {
      id: 'enhance',
      name: 'Quality Enhancement',
      description: 'Increase quality when performance allows',
      targetMetric: 'quality',
      improvementExpected: 0.3,
      cost: -0.2, // Negative cost means quality improvement
      conditions: ['frameRate > 55', 'memoryPressure < 0.5'],
      implementation: async () => {
        this.adjustQuality({
          levelOfDetail: Math.min(1, this.qualitySettings.levelOfDetail + 0.1),
          particleDensity: Math.min(1, this.qualitySettings.particleDensity + 0.1),
          shadowQuality: Math.min(1, this.qualitySettings.shadowQuality + 0.2),
          effectComplexity: Math.min(1, this.qualitySettings.effectComplexity + 0.1)
        });
      },
      rollback: async () => {
        // Enhance rollback
      }
    });
  }

  // Public API
  getCurrentMetrics(): PerformanceMetrics {
    this.currentMetrics.timestamp = Date.now();
    return { ...this.currentMetrics };
  }

  getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  clearAlerts() {
    this.alerts = [];
  }

  exportMetrics(): any {
    return {
      metrics: this.metrics,
      alerts: this.alerts,
      qualityHistory: [], // Would store quality changes over time
      timestamp: Date.now()
    };
  }

  // Event subscription
  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.onMetricsUpdate = callback;
  }

  onQualityAdjustment(callback: (settings: QualitySettings) => void) {
    this.callbacks.onQualityAdjustment = callback;
  }

  onAlert(callback: (alert: PerformanceAlert) => void) {
    this.callbacks.onAlert = callback;
  }

  onOptimization(callback: (strategy: OptimizationStrategy) => void) {
    this.callbacks.onOptimization = callback;
  }

  dispose() {
    this.stopMonitoring();
    this.metrics = [];
    this.alerts = [];
    this.frameTimeBuffer = [];
    this.memoryBuffer = [];
    this.renderTimeBuffer = [];
  }
}

// Utility functions
export function formatMemorySize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function getPerformanceGrade(score: number): string {
  if (score >= 0.9) return 'A+';
  if (score >= 0.8) return 'A';
  if (score >= 0.7) return 'B+';
  if (score >= 0.6) return 'B';
  if (score >= 0.5) return 'C+';
  if (score >= 0.4) return 'C';
  if (score >= 0.3) return 'D';
  return 'F';
}

export function createPerformanceDashboard(analyzer: PerformanceAnalyzer): HTMLElement {
  const dashboard = document.createElement('div');
  dashboard.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    padding: 15px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    font-size: 12px;
    border-radius: 5px;
    z-index: 10000;
  `;
  
  const updateDashboard = () => {
    const metrics = analyzer.getCurrentMetrics();
    const quality = analyzer.getQualitySettings();
    
    dashboard.innerHTML = `
      <h3>Performance Monitor</h3>
      <div>FPS: ${metrics.frameRate.current.toFixed(1)} (avg: ${metrics.frameRate.average.toFixed(1)})</div>
      <div>Memory: ${metrics.memory.used.toFixed(0)}MB (${(metrics.memory.pressure * 100).toFixed(1)}%)</div>
      <div>Render: ${metrics.rendering.renderTime.toFixed(1)}ms</div>
      <div>Draw Calls: ${metrics.rendering.drawCalls}</div>
      <div>LOD: ${(quality.levelOfDetail * 100).toFixed(0)}%</div>
      <div>Particles: ${(quality.particleDensity * 100).toFixed(0)}%</div>
    `;
  };
  
  setInterval(updateDashboard, 1000);
  updateDashboard();
  
  return dashboard;
}

// Global performance analyzer instance
export const performanceAnalyzer = new PerformanceAnalyzer();