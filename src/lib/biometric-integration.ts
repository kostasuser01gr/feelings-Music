/**
 * Biometric Integration System for emotion detection, gesture recognition,
 * and physiological monitoring through browser APIs
 */

export interface BiometricData {
  emotions: EmotionData;
  gestures: GestureData;
  physiological: PhysiologicalData;
  attention: AttentionData;
}

export interface EmotionData {
  primary: string;
  intensity: number;
  valence: number; // positive/negative
  arousal: number; // calm/excited
  confidence: number;
  facialExpressions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    neutral: number;
  };
  microExpressions: string[];
}

export interface GestureData {
  hands: {
    left?: HandData;
    right?: HandData;
  };
  pose: PoseData;
  movements: MovementData;
  interactions: InteractionData;
}

export interface HandData {
  landmarks: Array<{ x: number; y: number; z: number }>;
  gestures: string[];
  confidence: number;
  isVisible: boolean;
}

export interface PoseData {
  landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
  posture: string;
  engagement: number;
}

export interface MovementData {
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  patterns: string[];
  energy: number;
}

export interface InteractionData {
  pointing: { target: string | null; confidence: number };
  grabbing: boolean;
  waving: boolean;
  focusing: { x: number; y: number };
}

export interface PhysiologicalData {
  heartRate?: number;
  heartRateVariability?: number;
  breathingRate?: number;
  skinConductance?: number;
  bodyTemperature?: number;
  stressLevel: number;
  relaxationLevel: number;
}

export interface AttentionData {
  gazeDirection: { x: number; y: number };
  blinkRate: number;
  pupilDilation: number;
  focusScore: number;
  drowsinessLevel: number;
}

export class BiometricProcessor {
  private emotionDetector?: EmotionDetector;
  private gestureRecognizer?: GestureRecognizer;
  private physiologicalMonitor?: PhysiologicalMonitor;
  private attentionTracker?: AttentionTracker;
  
  private videoElement?: HTMLVideoElement;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  
  private isInitialized = false;
  private isTracking = false;
  private frameId?: number;
  
  private callbacks: ((data: BiometricData) => void)[] = [];

  constructor() {}

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }
      });

      // Setup video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;

      // Setup canvas for processing
      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.context = this.canvas.getContext('2d')!;

      // Initialize detection modules
      await this.initializeDetectors();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize biometric processor:', error);
      throw error;
    }
  }

  private async initializeDetectors() {
    this.emotionDetector = new EmotionDetector();
    this.gestureRecognizer = new GestureRecognizer();
    this.physiologicalMonitor = new PhysiologicalMonitor();
    this.attentionTracker = new AttentionTracker();

    await Promise.all([
      this.emotionDetector.initialize(),
      this.gestureRecognizer.initialize(),
      this.physiologicalMonitor.initialize(),
      this.attentionTracker.initialize()
    ]);
  }

  start(callback: (data: BiometricData) => void) {
    if (!this.isInitialized) {
      throw new Error('Biometric processor not initialized');
    }

    this.callbacks.push(callback);
    
    if (!this.isTracking) {
      this.isTracking = true;
      this.processFrame();
    }
  }

  stop() {
    this.isTracking = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }

  private processFrame = async () => {
    if (!this.isTracking || !this.videoElement || !this.canvas || !this.context) {
      return;
    }

    // Draw current video frame to canvas
    this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    try {
      // Process all biometric data in parallel
      const [emotions, gestures, physiological, attention] = await Promise.all([
        this.emotionDetector!.detect(imageData),
        this.gestureRecognizer!.recognize(imageData),
        this.physiologicalMonitor!.monitor(imageData),
        this.attentionTracker!.track(imageData)
      ]);

      const biometricData: BiometricData = {
        emotions,
        gestures,
        physiological,
        attention
      };

      // Notify callbacks
      this.callbacks.forEach(callback => callback(biometricData));
    } catch (error) {
      console.warn('Error processing frame:', error);
    }

    // Schedule next frame
    this.frameId = requestAnimationFrame(this.processFrame);
  };

  subscribe(callback: (data: BiometricData) => void) {
    this.callbacks.push(callback);
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  dispose() {
    this.stop();
    
    // Stop video stream
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    this.emotionDetector?.dispose();
    this.gestureRecognizer?.dispose();
    this.physiologicalMonitor?.dispose();
    this.attentionTracker?.dispose();
    
    this.isInitialized = false;
  }
}

class EmotionDetector {
  private model?: any; // Face detection model
  
  async initialize() {
    try {
      // In a real implementation, this would load a pre-trained model
      // like TensorFlow.js face-api or MediaPipe Face Mesh
      this.model = {
        detect: (imageData: ImageData) => this.mockEmotionDetection(imageData)
      };
    } catch (error) {
      console.warn('Could not load emotion detection model:', error);
    }
  }

  async detect(imageData: ImageData): Promise<EmotionData> {
    if (!this.model) {
      return this.getDefaultEmotionData();
    }

    try {
      return await this.model.detect(imageData);
    } catch (error) {
      console.warn('Emotion detection failed:', error);
      return this.getDefaultEmotionData();
    }
  }

  private mockEmotionDetection(imageData: ImageData): EmotionData {
    // Mock emotion detection - replace with actual ML model
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral'];
    const primary = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      primary,
      intensity: Math.random(),
      valence: Math.random() * 2 - 1, // -1 to 1
      arousal: Math.random(),
      confidence: 0.7 + Math.random() * 0.3,
      facialExpressions: {
        joy: primary === 'joy' ? 0.8 : Math.random() * 0.3,
        sadness: primary === 'sadness' ? 0.8 : Math.random() * 0.3,
        anger: primary === 'anger' ? 0.8 : Math.random() * 0.3,
        fear: primary === 'fear' ? 0.8 : Math.random() * 0.3,
        surprise: primary === 'surprise' ? 0.8 : Math.random() * 0.3,
        disgust: primary === 'disgust' ? 0.8 : Math.random() * 0.3,
        neutral: primary === 'neutral' ? 0.8 : Math.random() * 0.3
      },
      microExpressions: []
    };
  }

  private getDefaultEmotionData(): EmotionData {
    return {
      primary: 'neutral',
      intensity: 0.5,
      valence: 0,
      arousal: 0.3,
      confidence: 0,
      facialExpressions: {
        joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, neutral: 1
      },
      microExpressions: []
    };
  }

  dispose() {
    this.model = undefined;
  }
}

class GestureRecognizer {
  private handModel?: any;
  private poseModel?: any;
  
  async initialize() {
    try {
      // In a real implementation, this would load MediaPipe Hands/Pose
      this.handModel = { detect: this.mockHandDetection.bind(this) };
      this.poseModel = { detect: this.mockPoseDetection.bind(this) };
    } catch (error) {
      console.warn('Could not load gesture models:', error);
    }
  }

  async recognize(imageData: ImageData): Promise<GestureData> {
    const hands = await this.detectHands(imageData);
    const pose = await this.detectPose(imageData);
    const movements = this.analyzeMovements();
    const interactions = this.detectInteractions(hands);

    return { hands, pose, movements, interactions };
  }

  private async detectHands(imageData: ImageData) {
    if (!this.handModel) return {};

    const leftHand = this.mockHandDetection();
    const rightHand = this.mockHandDetection();

    return {
      left: leftHand.isVisible ? leftHand : undefined,
      right: rightHand.isVisible ? rightHand : undefined
    };
  }

  private mockHandDetection(): HandData {
    const landmarks = [];
    for (let i = 0; i < 21; i++) {
      landmarks.push({
        x: Math.random(),
        y: Math.random(),
        z: (Math.random() - 0.5) * 0.1
      });
    }

    const gestures = ['open', 'closed', 'pointing', 'peace', 'thumbs_up'];
    
    return {
      landmarks,
      gestures: [gestures[Math.floor(Math.random() * gestures.length)]],
      confidence: Math.random(),
      isVisible: Math.random() > 0.3
    };
  }

  private async detectPose(imageData: ImageData): Promise<PoseData> {
    const landmarks = [];
    for (let i = 0; i < 33; i++) {
      landmarks.push({
        x: Math.random(),
        y: Math.random(),
        z: (Math.random() - 0.5) * 0.2,
        visibility: Math.random()
      });
    }

    const postures = ['sitting', 'standing', 'leaning_forward', 'leaning_back'];
    
    return {
      landmarks,
      posture: postures[Math.floor(Math.random() * postures.length)],
      engagement: Math.random()
    };
  }

  private analyzeMovements(): MovementData {
    return {
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      },
      acceleration: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      },
      patterns: ['rhythmic', 'erratic', 'smooth'][Math.floor(Math.random() * 3)] as any,
      energy: Math.random()
    };
  }

  private detectInteractions(hands: any): InteractionData {
    return {
      pointing: {
        target: Math.random() > 0.7 ? 'star_' + Math.floor(Math.random() * 100) : null,
        confidence: Math.random()
      },
      grabbing: Math.random() > 0.8,
      waving: Math.random() > 0.9,
      focusing: {
        x: Math.random(),
        y: Math.random()
      }
    };
  }

  dispose() {
    this.handModel = undefined;
    this.poseModel = undefined;
  }
}

class PhysiologicalMonitor {
  private lastFrameTime = 0;
  private heartRateBuffer: number[] = [];
  
  async initialize() {
    // Initialize physiological monitoring
  }

  async monitor(imageData: ImageData): Promise<PhysiologicalData> {
    // Extract physiological signals from video
    const heartRate = this.estimateHeartRate(imageData);
    const breathingRate = this.estimateBreathingRate(imageData);
    const stressLevel = this.calculateStressLevel();
    
    return {
      heartRate,
      heartRateVariability: this.calculateHRV(),
      breathingRate,
      stressLevel,
      relaxationLevel: 1 - stressLevel
    };
  }

  private estimateHeartRate(imageData: ImageData): number {
    // Extract color variations for pulse detection
    // This is a simplified version - real implementation would use PPG
    const data = imageData.data;
    let redSum = 0;
    let greenSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];
      greenSum += data[i + 1];
    }
    
    const avgRed = redSum / (data.length / 4);
    const avgGreen = greenSum / (data.length / 4);
    const colorRatio = avgRed / (avgGreen + 1);
    
    this.heartRateBuffer.push(colorRatio);
    if (this.heartRateBuffer.length > 150) { // 5 seconds at 30fps
      this.heartRateBuffer.shift();
    }
    
    // Simple peak detection for heart rate
    if (this.heartRateBuffer.length >= 30) {
      const peaks = this.detectPeaks(this.heartRateBuffer);
      const bpm = (peaks.length / this.heartRateBuffer.length) * 30 * 60;
      return Math.max(50, Math.min(180, bpm));
    }
    
    return 75; // Default heart rate
  }

  private detectPeaks(signal: number[]): number[] {
    const peaks = [];
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  private estimateBreathingRate(imageData: ImageData): number {
    // Simplified breathing rate estimation
    return 12 + Math.sin(Date.now() / 5000) * 4;
  }

  private calculateStressLevel(): number {
    // Combine various indicators for stress level
    return Math.random() * 0.5 + 0.2; // 0.2 to 0.7
  }

  private calculateHRV(): number {
    if (this.heartRateBuffer.length < 10) return 50;
    
    let variance = 0;
    const mean = this.heartRateBuffer.reduce((a, b) => a + b, 0) / this.heartRateBuffer.length;
    
    for (const value of this.heartRateBuffer) {
      variance += Math.pow(value - mean, 2);
    }
    
    return Math.sqrt(variance / this.heartRateBuffer.length) * 1000; // Convert to ms
  }

  dispose() {
    this.heartRateBuffer = [];
  }
}

class AttentionTracker {
  private gazeHistory: Array<{ x: number; y: number; time: number }> = [];
  private blinkHistory: number[] = [];
  
  async initialize() {
    // Initialize attention tracking
  }

  async track(imageData: ImageData): Promise<AttentionData> {
    const gazeDirection = this.estimateGaze(imageData);
    const blinkRate = this.detectBlinks(imageData);
    const pupilDilation = this.estimatePupilDilation(imageData);
    const focusScore = this.calculateFocusScore();
    
    return {
      gazeDirection,
      blinkRate,
      pupilDilation,
      focusScore,
      drowsinessLevel: this.estimateDrowsiness()
    };
  }

  private estimateGaze(imageData: ImageData): { x: number; y: number } {
    // Simplified gaze estimation
    const gaze = {
      x: 0.5 + (Math.random() - 0.5) * 0.4,
      y: 0.5 + (Math.random() - 0.5) * 0.4
    };
    
    this.gazeHistory.push({ ...gaze, time: Date.now() });
    if (this.gazeHistory.length > 100) {
      this.gazeHistory.shift();
    }
    
    return gaze;
  }

  private detectBlinks(imageData: ImageData): number {
    // Simplified blink detection
    const currentTime = Date.now();
    if (Math.random() > 0.95) { // Random blink
      this.blinkHistory.push(currentTime);
    }
    
    // Remove old blinks (older than 1 minute)
    this.blinkHistory = this.blinkHistory.filter(time => currentTime - time < 60000);
    
    return this.blinkHistory.length; // Blinks per minute
  }

  private estimatePupilDilation(imageData: ImageData): number {
    // Simplified pupil dilation estimation
    return 0.3 + Math.random() * 0.4; // 0.3 to 0.7
  }

  private calculateFocusScore(): number {
    if (this.gazeHistory.length < 10) return 0.5;
    
    // Calculate gaze stability for focus score
    let stability = 0;
    const recent = this.gazeHistory.slice(-10);
    
    for (let i = 1; i < recent.length; i++) {
      const distance = Math.sqrt(
        Math.pow(recent[i].x - recent[i - 1].x, 2) +
        Math.pow(recent[i].y - recent[i - 1].y, 2)
      );
      stability += 1 - Math.min(1, distance * 10);
    }
    
    return stability / (recent.length - 1);
  }

  private estimateDrowsiness(): number {
    const slowBlinkRate = Math.max(0, 1 - this.blinkHistory.length / 20);
    const lowFocus = 1 - this.calculateFocusScore();
    return (slowBlinkRate + lowFocus) / 2;
  }

  dispose() {
    this.gazeHistory = [];
    this.blinkHistory = [];
  }
}

// Utility function to map biometric data to cosmic elements
export function mapBiometricsToCosmicElements(biometric: BiometricData) {
  return {
    cameraMovement: {
      x: biometric.gestures.movements.velocity.x * 0.1,
      y: biometric.gestures.movements.velocity.y * 0.1,
      z: biometric.attention.focusScore * 0.2
    },
    emotionalColoring: {
      intensity: biometric.emotions.intensity,
      hue: biometric.emotions.valence * 180 + 180, // Map -1,1 to 0,360
      saturation: biometric.emotions.arousal
    },
    physiologicalEffects: {
      heartRateInfluence: biometric.physiological.heartRate ? 
        (biometric.physiological.heartRate - 60) / 120 : 0.5,
      stressVisualization: biometric.physiological.stressLevel,
      relaxationField: biometric.physiological.relaxationLevel
    },
    gestureInteractions: {
      pointing: biometric.gestures.interactions.pointing,
      handPositions: {
        left: biometric.gestures.hands.left?.landmarks[9], // Middle finger tip
        right: biometric.gestures.hands.right?.landmarks[9]
      }
    }
  };
}

// Global instance
export const biometricProcessor = new BiometricProcessor();