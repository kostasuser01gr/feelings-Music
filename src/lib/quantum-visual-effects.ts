/**
 * Quantum Visual Effects System for advanced cosmic visualization
 * Featuring wormholes, quantum tunnels, multidimensional rifts, and temporal distortions
 */

import * as THREE from 'three';

export interface QuantumEffect {
  id: string;
  type: 'wormhole' | 'quantum_tunnel' | 'dimensional_rift' | 'temporal_distortion' | 'probability_cloud' | 'entanglement_field';
  position: THREE.Vector3;
  intensity: number;
  duration: number;
  startTime: number;
  properties: Record<string, any>;
}

export interface QuantumVisualizationParams {
  complexity: number; // 0-1
  timeFlow: number; // time dilation factor
  dimensionalShift: number; // dimensional distortion
  quantumCoherence: number; // quantum state coherence
  entanglementStrength: number; // particle entanglement
}

export class QuantumVisualEffects {
  private scene: THREE.Scene;
  private effects: Map<string, QuantumEffect> = new Map();
  private shaderMaterials: Map<string, THREE.ShaderMaterial> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private uniforms: Map<string, any> = new Map();
  
  private clock = new THREE.Clock();
  private frameCount = 0;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeShaders();
    this.initializeGeometries();
  }

  private initializeShaders() {
    // Wormhole Shader
    const wormholeUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uRadius: { value: 1 },
      uLength: { value: 10 },
      uDistortion: { value: 0.5 },
      uTunnelTexture: { value: null }
    };

    const wormholeMaterial = new THREE.ShaderMaterial({
      uniforms: wormholeUniforms,
      vertexShader: this.getWormholeVertexShader(),
      fragmentShader: this.getWormholeFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.shaderMaterials.set('wormhole', wormholeMaterial);
    this.uniforms.set('wormhole', wormholeUniforms);

    // Quantum Tunnel Shader
    const quantumTunnelUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uFlow: { value: new THREE.Vector3(0, 0, 1) },
      uCoherence: { value: 0.8 },
      uQuantumNoise: { value: null }
    };

    const quantumTunnelMaterial = new THREE.ShaderMaterial({
      uniforms: quantumTunnelUniforms,
      vertexShader: this.getQuantumTunnelVertexShader(),
      fragmentShader: this.getQuantumTunnelFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.shaderMaterials.set('quantum_tunnel', quantumTunnelMaterial);
    this.uniforms.set('quantum_tunnel', quantumTunnelUniforms);

    // Dimensional Rift Shader
    const dimensionalRiftUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uDimensions: { value: 3.5 },
      uRiftWidth: { value: 0.1 },
      uSpaceDistortion: { value: 1.0 }
    };

    const dimensionalRiftMaterial = new THREE.ShaderMaterial({
      uniforms: dimensionalRiftUniforms,
      vertexShader: this.getDimensionalRiftVertexShader(),
      fragmentShader: this.getDimensionalRiftFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.shaderMaterials.set('dimensional_rift', dimensionalRiftMaterial);
    this.uniforms.set('dimensional_rift', dimensionalRiftUniforms);

    // Temporal Distortion Shader
    const temporalDistortionUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uTimeFlow: { value: 1.0 },
      uCausality: { value: 0.9 },
      uTemporalField: { value: null }
    };

    const temporalDistortionMaterial = new THREE.ShaderMaterial({
      uniforms: temporalDistortionUniforms,
      vertexShader: this.getTemporalDistortionVertexShader(),
      fragmentShader: this.getTemporalDistortionFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.shaderMaterials.set('temporal_distortion', temporalDistortionMaterial);
    this.uniforms.set('temporal_distortion', temporalDistortionUniforms);

    // Probability Cloud Shader
    const probabilityCloudUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uProbability: { value: 0.5 },
      uWaveFunction: { value: new THREE.Vector4(1, 1, 1, 1) },
      uCollapse: { value: 0.0 }
    };

    const probabilityCloudMaterial = new THREE.ShaderMaterial({
      uniforms: probabilityCloudUniforms,
      vertexShader: this.getProbabilityCloudVertexShader(),
      fragmentShader: this.getProbabilityCloudFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    this.shaderMaterials.set('probability_cloud', probabilityCloudMaterial);
    this.uniforms.set('probability_cloud', probabilityCloudUniforms);

    // Entanglement Field Shader
    const entanglementFieldUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uEntanglementStrength: { value: 0.8 },
      uParticle1: { value: new THREE.Vector3(0, 0, 0) },
      uParticle2: { value: new THREE.Vector3(5, 5, 5) },
      uQuantumState: { value: new THREE.Vector4(1, 0, 0, 1) }
    };

    const entanglementFieldMaterial = new THREE.ShaderMaterial({
      uniforms: entanglementFieldUniforms,
      vertexShader: this.getEntanglementFieldVertexShader(),
      fragmentShader: this.getEntanglementFieldFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.shaderMaterials.set('entanglement_field', entanglementFieldMaterial);
    this.uniforms.set('entanglement_field', entanglementFieldUniforms);
  }

  private initializeGeometries() {
    // Wormhole geometry (torus tunnel)
    const wormholeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5),
        new THREE.Vector3(0, 0, -10)
      ]),
      64, // segments
      2,  // radius
      8,  // radial segments
      false
    );
    this.geometries.set('wormhole', wormholeGeometry);

    // Quantum tunnel geometry
    const quantumTunnelGeometry = new THREE.CylinderGeometry(
      0.5, // top radius
      1.5, // bottom radius  
      10,  // height
      32,  // radial segments
      16   // height segments
    );
    this.geometries.set('quantum_tunnel', quantumTunnelGeometry);

    // Dimensional rift geometry (plane with distortion)
    const dimensionalRiftGeometry = new THREE.PlaneGeometry(5, 10, 64, 64);
    this.geometries.set('dimensional_rift', dimensionalRiftGeometry);

    // Temporal distortion geometry (sphere with time warping)
    const temporalDistortionGeometry = new THREE.SphereGeometry(3, 64, 64);
    this.geometries.set('temporal_distortion', temporalDistortionGeometry);

    // Probability cloud geometry (point cloud)
    const probabilityCloudGeometry = new THREE.BufferGeometry();
    const particleCount = 10000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const probabilities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Gaussian distribution for quantum probability
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();

      probabilities[i] = Math.random();
    }

    probabilityCloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    probabilityCloudGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    probabilityCloudGeometry.setAttribute('probability', new THREE.BufferAttribute(probabilities, 1));
    this.geometries.set('probability_cloud', probabilityCloudGeometry);

    // Entanglement field geometry (line connections)
    const entanglementFieldGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(2 * 3); // Two points
    linePositions[0] = 0; linePositions[1] = 0; linePositions[2] = 0;
    linePositions[3] = 5; linePositions[4] = 5; linePositions[5] = 5;
    
    entanglementFieldGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    this.geometries.set('entanglement_field', entanglementFieldGeometry);
  }

  createWormhole(position: THREE.Vector3, intensity: number, duration: number): string {
    const id = `wormhole_${Date.now()}_${Math.random()}`;
    
    const effect: QuantumEffect = {
      id,
      type: 'wormhole',
      position: position.clone(),
      intensity,
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        radius: 2 + intensity * 3,
        length: 10 + intensity * 10,
        distortion: 0.3 + intensity * 0.7,
        rotationSpeed: 0.1 + intensity * 0.5
      }
    };

    const geometry = this.geometries.get('wormhole')!.clone();
    const material = this.shaderMaterials.get('wormhole')!.clone();
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData.quantumEffect = effect;
    
    this.scene.add(mesh);
    this.effects.set(id, effect);
    
    return id;
  }

  createQuantumTunnel(start: THREE.Vector3, end: THREE.Vector3, coherence: number, duration: number): string {
    const id = `quantum_tunnel_${Date.now()}_${Math.random()}`;
    
    const direction = end.clone().sub(start);
    const distance = direction.length();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    
    const effect: QuantumEffect = {
      id,
      type: 'quantum_tunnel',
      position: midpoint,
      intensity: coherence,
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        start: start.clone(),
        end: end.clone(),
        coherence,
        flow: direction.normalize(),
        distance
      }
    };

    const geometry = this.geometries.get('quantum_tunnel')!.clone();
    const material = this.shaderMaterials.get('quantum_tunnel')!.clone();
    
    // Scale geometry to match tunnel length
    geometry.scale(1, distance / 10, 1);
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(midpoint);
    mesh.lookAt(end);
    mesh.userData.quantumEffect = effect;
    
    this.scene.add(mesh);
    this.effects.set(id, effect);
    
    return id;
  }

  createDimensionalRift(position: THREE.Vector3, dimensions: number, width: number, duration: number): string {
    const id = `dimensional_rift_${Date.now()}_${Math.random()}`;
    
    const effect: QuantumEffect = {
      id,
      type: 'dimensional_rift',
      position: position.clone(),
      intensity: dimensions / 10, // Normalize to 0-1
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        dimensions,
        width,
        distortion: 0.5 + dimensions * 0.1,
        oscillation: 1.0 + dimensions * 0.2
      }
    };

    const geometry = this.geometries.get('dimensional_rift')!.clone();
    const material = this.shaderMaterials.get('dimensional_rift')!.clone();
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.userData.quantumEffect = effect;
    
    this.scene.add(mesh);
    this.effects.set(id, effect);
    
    return id;
  }

  createTemporalDistortion(position: THREE.Vector3, timeFlow: number, causality: number, duration: number): string {
    const id = `temporal_distortion_${Date.now()}_${Math.random()}`;
    
    const effect: QuantumEffect = {
      id,
      type: 'temporal_distortion',
      position: position.clone(),
      intensity: Math.abs(timeFlow - 1),
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        timeFlow,
        causality,
        fieldStrength: Math.abs(timeFlow - 1) * 2,
        temporalRadius: 5 + Math.abs(timeFlow - 1) * 10
      }
    };

    const geometry = this.geometries.get('temporal_distortion')!.clone();
    const material = this.shaderMaterials.get('temporal_distortion')!.clone();
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData.quantumEffect = effect;
    
    this.scene.add(mesh);
    this.effects.set(id, effect);
    
    return id;
  }

  createProbabilityCloud(position: THREE.Vector3, waveFunction: THREE.Vector4, collapseRate: number, duration: number): string {
    const id = `probability_cloud_${Date.now()}_${Math.random()}`;
    
    const effect: QuantumEffect = {
      id,
      type: 'probability_cloud',
      position: position.clone(),
      intensity: waveFunction.w, // Use w component as intensity
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        waveFunction: waveFunction.clone(),
        collapseRate,
        uncertainty: 1.0,
        coherenceTime: duration * 0.5
      }
    };

    const geometry = this.geometries.get('probability_cloud')!.clone();
    const material = this.shaderMaterials.get('probability_cloud')!.clone();
    
    const points = new THREE.Points(geometry, material);
    points.position.copy(position);
    points.userData.quantumEffect = effect;
    
    this.scene.add(points);
    this.effects.set(id, effect);
    
    return id;
  }

  createEntanglementField(particle1: THREE.Vector3, particle2: THREE.Vector3, entanglementStrength: number, duration: number): string {
    const id = `entanglement_field_${Date.now()}_${Math.random()}`;
    
    const effect: QuantumEffect = {
      id,
      type: 'entanglement_field',
      position: particle1.clone().add(particle2).multiplyScalar(0.5),
      intensity: entanglementStrength,
      duration,
      startTime: this.clock.getElapsedTime(),
      properties: {
        particle1: particle1.clone(),
        particle2: particle2.clone(),
        entanglementStrength,
        quantumState: new THREE.Vector4(1, 0, 0, 1), // |00⟩ + |11⟩ state
        nonlocality: entanglementStrength
      }
    };

    const geometry = this.geometries.get('entanglement_field')!.clone();
    const material = this.shaderMaterials.get('entanglement_field')!.clone();
    
    const line = new THREE.Line(geometry, material);
    line.userData.quantumEffect = effect;
    
    this.scene.add(line);
    this.effects.set(id, effect);
    
    return id;
  }

  update(params: QuantumVisualizationParams) {
    const time = this.clock.getElapsedTime();
    this.frameCount++;

    // Update all effects
    this.effects.forEach((effect, id) => {
      const elapsed = time - effect.startTime;
      const progress = elapsed / effect.duration;

      if (progress >= 1) {
        // Remove expired effects
        this.removeEffect(id);
        return;
      }

      // Update effect based on type
      this.updateEffect(effect, time, progress, params);
    });

    // Update global uniforms
    this.updateGlobalUniforms(time, params);
  }

  private updateEffect(effect: QuantumEffect, time: number, progress: number, params: QuantumVisualizationParams) {
    const mesh = this.scene.getObjectByName(effect.id) || 
                  this.scene.children.find(child => child.userData.quantumEffect?.id === effect.id);
    
    if (!mesh) return;

    const material = (mesh as THREE.Mesh).material as THREE.ShaderMaterial;
    const uniforms = material.uniforms;

    // Common updates
    if (uniforms.uTime) uniforms.uTime.value = time;
    if (uniforms.uIntensity) {
      // Apply fade in/out
      const fadeIn = Math.min(1, progress * 4);
      const fadeOut = Math.min(1, (1 - progress) * 4);
      uniforms.uIntensity.value = effect.intensity * fadeIn * fadeOut;
    }

    // Type-specific updates
    switch (effect.type) {
      case 'wormhole':
        mesh.rotation.z += effect.properties.rotationSpeed * 0.016;
        if (uniforms.uRadius) uniforms.uRadius.value = effect.properties.radius;
        if (uniforms.uLength) uniforms.uLength.value = effect.properties.length;
        if (uniforms.uDistortion) uniforms.uDistortion.value = effect.properties.distortion;
        break;

      case 'quantum_tunnel':
        if (uniforms.uCoherence) uniforms.uCoherence.value = effect.properties.coherence * params.quantumCoherence;
        if (uniforms.uFlow) uniforms.uFlow.value.copy(effect.properties.flow);
        break;

      case 'dimensional_rift':
        if (uniforms.uDimensions) uniforms.uDimensions.value = effect.properties.dimensions;
        if (uniforms.uRiftWidth) uniforms.uRiftWidth.value = effect.properties.width;
        if (uniforms.uSpaceDistortion) uniforms.uSpaceDistortion.value = effect.properties.distortion * params.dimensionalShift;
        break;

      case 'temporal_distortion':
        if (uniforms.uTimeFlow) uniforms.uTimeFlow.value = effect.properties.timeFlow * params.timeFlow;
        if (uniforms.uCausality) uniforms.uCausality.value = effect.properties.causality;
        break;

      case 'probability_cloud':
        if (uniforms.uProbability) uniforms.uProbability.value = 0.5 + 0.5 * Math.sin(time * 2 + progress * Math.PI);
        if (uniforms.uWaveFunction) uniforms.uWaveFunction.value.copy(effect.properties.waveFunction);
        if (uniforms.uCollapse) uniforms.uCollapse.value = effect.properties.collapseRate * progress;
        
        // Update particle positions for quantum uncertainty
        const geometry = (mesh as THREE.Points).geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.01;
          positions[i + 1] += (Math.random() - 0.5) * 0.01;
          positions[i + 2] += (Math.random() - 0.5) * 0.01;
        }
        geometry.attributes.position.needsUpdate = true;
        break;

      case 'entanglement_field':
        if (uniforms.uEntanglementStrength) {
          uniforms.uEntanglementStrength.value = effect.properties.entanglementStrength * params.entanglementStrength;
        }
        if (uniforms.uParticle1) uniforms.uParticle1.value.copy(effect.properties.particle1);
        if (uniforms.uParticle2) uniforms.uParticle2.value.copy(effect.properties.particle2);
        
        // Quantum entanglement visualization
        const distance = effect.properties.particle1.distanceTo(effect.properties.particle2);
        const entanglementIntensity = Math.exp(-distance * 0.1) * effect.properties.entanglementStrength;
        if (uniforms.uQuantumState) {
          uniforms.uQuantumState.value.w = entanglementIntensity;
        }
        break;
    }
  }

  private updateGlobalUniforms(time: number, params: QuantumVisualizationParams) {
    // Update all shader materials with global parameters
    this.shaderMaterials.forEach((material, type) => {
      const uniforms = material.uniforms;
      
      if (uniforms.uTime) uniforms.uTime.value = time * params.timeFlow;
      
      // Apply global quantum effects
      if (type === 'quantum_tunnel' && uniforms.uCoherence) {
        uniforms.uCoherence.value *= params.quantumCoherence;
      }
      
      if (type === 'dimensional_rift' && uniforms.uSpaceDistortion) {
        uniforms.uSpaceDistortion.value *= params.dimensionalShift;
      }
      
      if (type === 'entanglement_field' && uniforms.uEntanglementStrength) {
        uniforms.uEntanglementStrength.value *= params.entanglementStrength;
      }
    });
  }

  removeEffect(id: string) {
    const effect = this.effects.get(id);
    if (!effect) return;

    const object = this.scene.children.find(child => child.userData.quantumEffect?.id === id);
    if (object) {
      this.scene.remove(object);
      
      // Dispose of geometry and material
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    }

    this.effects.delete(id);
  }

  dispose() {
    // Clean up all effects
    this.effects.forEach((_, id) => this.removeEffect(id));
    
    // Dispose of geometries
    this.geometries.forEach(geometry => geometry.dispose());
    this.geometries.clear();
    
    // Dispose of materials
    this.shaderMaterials.forEach(material => material.dispose());
    this.shaderMaterials.clear();
    
    this.uniforms.clear();
  }

  // Shader source code methods
  private getWormholeVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uDistortion;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normal;
        
        vec3 pos = position;
        
        // Apply wormhole distortion
        float distortionFactor = uDistortion * sin(uTime * 2.0 + pos.z * 0.5) * 0.1;
        pos.x += distortionFactor * sin(pos.z * 2.0 + uTime);
        pos.y += distortionFactor * cos(pos.z * 2.0 + uTime);
        
        vPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getWormholeFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uRadius;
      uniform float uLength;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        vec2 toCenter = vUv - center;
        float distanceFromCenter = length(toCenter);
        
        // Create tunnel effect
        float tunnel = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
        
        // Add time-based spiral
        float angle = atan(toCenter.y, toCenter.x);
        float spiral = sin(angle * 8.0 + uTime * 4.0 + vPosition.z * 2.0) * 0.5 + 0.5;
        
        // Color gradient based on position
        vec3 color1 = vec3(0.1, 0.4, 1.0); // Blue
        vec3 color2 = vec3(1.0, 0.2, 0.8); // Magenta
        vec3 color3 = vec3(0.8, 1.0, 0.2); // Yellow-green
        
        vec3 color = mix(color1, color2, spiral);
        color = mix(color, color3, sin(uTime + vPosition.z * 0.5) * 0.5 + 0.5);
        
        // Apply tunnel mask and intensity
        float alpha = tunnel * uIntensity * (0.5 + spiral * 0.5);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getQuantumTunnelVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uCoherence;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vCoherence;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vCoherence = uCoherence;
        
        vec3 pos = position;
        
        // Quantum uncertainty effect
        float uncertainty = 1.0 - uCoherence;
        pos += normal * sin(uTime * 10.0 + position.x * 20.0 + position.y * 20.0) * uncertainty * 0.05;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getQuantumTunnelFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uFlow;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vCoherence;
      
      // Quantum noise function
      float quantumNoise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float n = dot(i, vec3(1.0, 157.0, 113.0));
        return mix(mix(mix(fract(sin(n) * 43758.5),
                          fract(sin(n + 1.0) * 43758.5), f.x),
                      mix(fract(sin(n + 157.0) * 43758.5),
                          fract(sin(n + 158.0) * 43758.5), f.x), f.y),
                  mix(mix(fract(sin(n + 113.0) * 43758.5),
                          fract(sin(n + 114.0) * 43758.5), f.x),
                      mix(fract(sin(n + 270.0) * 43758.5),
                          fract(sin(n + 271.0) * 43758.5), f.x), f.y), f.z);
      }
      
      void main() {
        vec3 pos = vPosition + uFlow * uTime;
        
        // Quantum field visualization
        float qNoise = quantumNoise(pos * 5.0 + uTime);
        float coherence = vCoherence + qNoise * (1.0 - vCoherence) * 0.5;
        
        // Probability wave
        float wave = sin(pos.z * 2.0 + uTime * 3.0) * cos(pos.x * 3.0 + uTime * 2.0);
        wave = wave * 0.5 + 0.5;
        
        // Color based on quantum state
        vec3 coherentColor = vec3(0.0, 1.0, 1.0); // Cyan
        vec3 decoherentColor = vec3(1.0, 0.5, 0.0); // Orange
        
        vec3 color = mix(decoherentColor, coherentColor, coherence);
        color += vec3(wave * 0.3);
        
        float alpha = uIntensity * (coherence * 0.7 + 0.3);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getDimensionalRiftVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uDimensions;
      uniform float uSpaceDistortion;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        
        vec3 pos = position;
        
        // Dimensional distortion effect
        float distortion = uSpaceDistortion * sin(uTime + pos.x * 0.5) * cos(uTime + pos.y * 0.3);
        pos.z += distortion * 2.0;
        
        // Higher dimensional folding
        if (uDimensions > 3.0) {
          float extraDim = (uDimensions - 3.0) * 0.5;
          pos.x += sin(pos.y * 3.0 + uTime) * extraDim;
          pos.y += cos(pos.x * 3.0 + uTime) * extraDim;
        }
        
        vPosition = pos;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getDimensionalRiftFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uDimensions;
      uniform float uRiftWidth;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float distFromCenter = distance(vUv, center);
        
        // Dimensional rift effect
        float rift = smoothstep(uRiftWidth, 0.0, abs(vUv.y - 0.5));
        
        // Multi-dimensional color cycling
        float dimCycle = uDimensions / 10.0 + uTime * 0.5;
        vec3 color1 = vec3(sin(dimCycle), cos(dimCycle * 1.3), sin(dimCycle * 1.7)) * 0.5 + 0.5;
        vec3 color2 = vec3(cos(dimCycle * 2.0), sin(dimCycle * 2.3), cos(dimCycle * 1.8)) * 0.5 + 0.5;
        
        vec3 color = mix(color1, color2, sin(vPosition.x * 5.0 + uTime) * 0.5 + 0.5);
        
        // Add space-time curvature visualization
        float curvature = sin(vUv.x * 20.0 + uTime * 2.0) * cos(vUv.y * 15.0 + uTime * 1.5);
        color += vec3(curvature * 0.2);
        
        float alpha = rift * uIntensity;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getTemporalDistortionVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uTimeFlow;
      uniform float uCausality;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vTemporalField;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Temporal field strength based on distance from center
        vTemporalField = 1.0 - length(position) / 3.0;
        
        vec3 pos = position;
        
        // Time dilation effect
        float dilationFactor = mix(1.0, uTimeFlow, vTemporalField);
        float localTime = uTime * dilationFactor;
        
        // Causality distortion
        float causalityEffect = (1.0 - uCausality) * vTemporalField;
        pos += sin(localTime * 5.0 + length(pos)) * normal * causalityEffect * 0.1;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getTemporalDistortionFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uTimeFlow;
      uniform float uCausality;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vTemporalField;
      
      void main() {
        float localTime = uTime * mix(1.0, uTimeFlow, vTemporalField);
        
        // Temporal gradient visualization
        float timeGradient = sin(localTime * 3.0) * cos(localTime * 2.0) * vTemporalField;
        
        // Causality violation color
        vec3 normalTime = vec3(0.2, 0.6, 1.0); // Blue
        vec3 distortedTime = vec3(1.0, 0.2, 0.4); // Red
        vec3 causalityColor = vec3(0.8, 0.8, 0.2); // Yellow
        
        vec3 color = mix(normalTime, distortedTime, abs(uTimeFlow - 1.0));
        color = mix(color, causalityColor, 1.0 - uCausality);
        
        // Add temporal ripples
        float ripples = sin(length(vPosition) * 10.0 - localTime * 8.0) * 0.3 + 0.7;
        color *= ripples;
        
        float alpha = vTemporalField * uIntensity;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getProbabilityCloudVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uCollapse;
      
      attribute float probability;
      
      varying float vProbability;
      varying vec3 vColor;
      
      void main() {
        vProbability = probability;
        vColor = color;
        
        vec3 pos = position;
        
        // Wave function collapse effect
        float collapseEffect = 1.0 - uCollapse;
        float waveAmplitude = sin(uTime * 5.0 + length(position) * 2.0) * collapseEffect;
        
        // Quantum superposition visualization
        pos += normal * waveAmplitude * probability * 0.5;
        
        // Uncertainty principle
        pos += (vec3(sin(uTime * 10.0), cos(uTime * 12.0), sin(uTime * 8.0)) * 0.01) * (1.0 - probability);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (probability * 5.0 + 1.0) * (300.0 / -mvPosition.z);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
  }

  private getProbabilityCloudFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uProbability;
      uniform vec4 uWaveFunction;
      
      varying float vProbability;
      varying vec3 vColor;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float distFromCenter = distance(gl_PointCoord, center);
        
        // Gaussian probability distribution visualization
        float gaussian = exp(-distFromCenter * distFromCenter / 0.1);
        
        // Wave function interference
        float interference = sin(uTime * 3.0 + vProbability * 10.0) * 0.5 + 0.5;
        
        // Quantum state color
        vec3 color = vColor * uWaveFunction.xyz;
        color += vec3(interference * 0.3);
        
        float alpha = gaussian * vProbability * uIntensity * uProbability;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }

  private getEntanglementFieldVertexShader(): string {
    return `
      uniform float uTime;
      uniform float uEntanglementStrength;
      uniform vec3 uParticle1;
      uniform vec3 uParticle2;
      
      varying float vEntanglement;
      varying vec3 vPosition;
      
      void main() {
        vPosition = position;
        
        // Calculate entanglement field strength
        float distance = length(uParticle2 - uParticle1);
        vEntanglement = uEntanglementStrength * exp(-distance * 0.1);
        
        vec3 pos = position;
        
        // Quantum field fluctuations
        pos += sin(uTime * 8.0 + length(pos) * 5.0) * normal * vEntanglement * 0.02;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
  }

  private getEntanglementFieldFragmentShader(): string {
    return `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec4 uQuantumState;
      
      varying float vEntanglement;
      varying vec3 vPosition;
      
      void main() {
        // Entanglement visualization
        float entanglementPattern = sin(vPosition.x * 10.0 + uTime * 2.0) * 
                                   cos(vPosition.y * 8.0 + uTime * 1.5) * 
                                   sin(vPosition.z * 12.0 + uTime * 3.0);
        
        // Quantum state color
        vec3 stateColor = uQuantumState.xyz;
        
        // Bell state visualization (entangled particles)
        vec3 entangledColor = vec3(1.0, 0.0, 1.0); // Magenta
        vec3 separableColor = vec3(0.0, 1.0, 0.0); // Green
        
        vec3 color = mix(separableColor, entangledColor, vEntanglement);
        color = mix(color, stateColor, 0.5);
        
        // Add quantum correlation pattern
        color += vec3(entanglementPattern * 0.2);
        
        float alpha = vEntanglement * uIntensity * uQuantumState.w;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
  }
}

// Helper functions for quantum effect creation
export function createQuantumWormhole(
  effects: QuantumVisualEffects,
  from: THREE.Vector3,
  to: THREE.Vector3,
  intensity: number = 0.8,
  duration: number = 10
): string {
  const midpoint = from.clone().add(to).multiplyScalar(0.5);
  return effects.createWormhole(midpoint, intensity, duration);
}

export function createQuantumEntanglement(
  effects: QuantumVisualEffects,
  positions: THREE.Vector3[],
  entanglementStrength: number = 0.9,
  duration: number = 15
): string[] {
  const entanglements: string[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const id = effects.createEntanglementField(
        positions[i],
        positions[j],
        entanglementStrength,
        duration
      );
      entanglements.push(id);
    }
  }
  
  return entanglements;
}

export function createQuantumSuperposition(
  effects: QuantumVisualEffects,
  position: THREE.Vector3,
  states: THREE.Vector4[],
  duration: number = 8
): string[] {
  const clouds: string[] = [];
  
  states.forEach((state, index) => {
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    const cloudPosition = position.clone().add(offset);
    
    const id = effects.createProbabilityCloud(
      cloudPosition,
      state,
      0.1 + index * 0.1,
      duration
    );
    clouds.push(id);
  });
  
  return clouds;
}