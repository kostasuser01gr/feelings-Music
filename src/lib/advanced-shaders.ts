/**
 * Advanced Shader System - Premium Visual Effects
 * Volumetric lighting, god rays, atmospheric scattering, HDR, gravitational lensing
 */

import * as THREE from 'three';

export class VolumetricLightShader {
  static vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  static fragmentShader = `
    uniform vec3 lightPosition;
    uniform vec3 lightColor;
    uniform float intensity;
    uniform float scatteringStrength;
    uniform float audioReactivity;
    uniform float time;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    
    // Mie scattering approximation
    float mieScattering(float cosTheta, float g) {
      float g2 = g * g;
      return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
    }
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      vec3 lightDirection = normalize(lightPosition - vWorldPosition);
      
      float distance = length(lightPosition - vWorldPosition);
      float attenuation = 1.0 / (1.0 + distance * distance * 0.001);
      
      // Mie scattering for god rays effect
      float cosTheta = dot(viewDirection, lightDirection);
      float mie = mieScattering(cosTheta, 0.76);
      
      // Audio-reactive pulsing
      float pulse = sin(time * 2.0) * 0.5 + 0.5;
      float audioBoost = 1.0 + audioReactivity * pulse;
      
      // Volumetric light
      float volumetric = mie * attenuation * scatteringStrength * intensity * audioBoost;
      
      vec3 finalColor = lightColor * volumetric;
      float alpha = volumetric * 0.8;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
}

export class AtmosphericScatteringShader {
  static vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vHeight = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  static fragmentShader = `
    uniform vec3 sunPosition;
    uniform vec3 planetCenter;
    uniform float planetRadius;
    uniform float atmosphereRadius;
    uniform vec3 rayleighColor; // Sky color
    uniform float rayleighStrength;
    uniform float mieStrength;
    uniform float audioIntensity;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    const float PI = 3.14159265359;
    const int SAMPLES = 16;
    
    // Rayleigh scattering coefficient
    vec3 rayleigh(float cosTheta) {
      return rayleighColor * rayleighStrength * (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);
    }
    
    // Mie scattering
    float mie(float cosTheta, float g) {
      float g2 = g * g;
      float num = (1.0 - g2) * (1.0 + cosTheta * cosTheta);
      float denom = (2.0 + g2) * pow(abs(1.0 + g2 - 2.0 * g * cosTheta), 1.5);
      return mieStrength * (3.0 / (8.0 * PI)) * num / denom;
    }
    
    void main() {
      vec3 viewDir = normalize(vWorldPosition - cameraPosition);
      vec3 sunDir = normalize(sunPosition - vWorldPosition);
      
      float cosTheta = dot(viewDir, sunDir);
      
      // Calculate scattering
      vec3 rayleighScatter = rayleigh(cosTheta);
      float mieScatter = mie(cosTheta, 0.8);
      
      // Distance-based opacity
      float distToPlanet = length(vWorldPosition - planetCenter);
      float atmosphereDepth = (distToPlanet - planetRadius) / (atmosphereRadius - planetRadius);
      atmosphereDepth = clamp(atmosphereDepth, 0.0, 1.0);
      
      // Fresnel effect
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
      
      // Combine scattering
      vec3 scatter = rayleighScatter + vec3(mieScatter);
      scatter *= (1.0 - atmosphereDepth) * fresnel;
      
      // Audio reactivity
      scatter *= 1.0 + audioIntensity * 0.3;
      
      float alpha = fresnel * (1.0 - atmosphereDepth) * 0.6;
      
      gl_FragColor = vec4(scatter, alpha);
    }
  `;
}

export class GravitationalLensingShader {
  static vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  static fragmentShader = `
    uniform sampler2D tDiffuse;
    uniform vec2 lensCenter;
    uniform float lensStrength;
    uniform float lensMass;
    uniform float audioDistortion;
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    const float G = 6.674;
    const float c = 299792.0;
    
    vec2 gravitationalLens(vec2 uv, vec2 center, float mass) {
      vec2 delta = uv - center;
      float distance = length(delta);
      
      if (distance < 0.001) return uv;
      
      // Schwarzschild radius approximation
      float rs = 2.0 * G * mass / (c * c);
      
      // Deflection angle
      float deflection = 4.0 * G * mass / (c * c * distance);
      deflection *= lensStrength * (1.0 + audioDistortion);
      
      vec2 direction = normalize(delta);
      vec2 offset = direction * deflection;
      
      return uv + offset;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Apply gravitational lensing
      vec2 lensedUV = gravitationalLens(uv, lensCenter, lensMass);
      
      // Chromatic aberration near the lens
      float dist = length(uv - lensCenter);
      float aberration = smoothstep(0.3, 0.0, dist) * 0.01 * lensStrength;
      
      vec4 color;
      if (aberration > 0.001) {
        float r = texture2D(tDiffuse, lensedUV + vec2(aberration, 0.0)).r;
        float g = texture2D(tDiffuse, lensedUV).g;
        float b = texture2D(tDiffuse, lensedUV - vec2(aberration, 0.0)).b;
        color = vec4(r, g, b, 1.0);
      } else {
        color = texture2D(tDiffuse, lensedUV);
      }
      
      // Darkening near the event horizon
      float eventHorizonRadius = 0.05 * lensStrength;
      float darkness = smoothstep(eventHorizonRadius * 1.5, eventHorizonRadius, dist);
      color.rgb *= darkness;
      
      gl_FragColor = color;
    }
  `;
}

export class HDRBloomShader {
  static vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  static fragmentShader = `
    uniform sampler2D tDiffuse;
    uniform float bloomStrength;
    uniform float bloomRadius;
    uniform float bloomThreshold;
    uniform float exposure;
    uniform float audioBoost;
    
    varying vec2 vUv;
    
    vec3 Uncharted2Tonemap(vec3 x) {
      float A = 0.15;
      float B = 0.50;
      float C = 0.10;
      float D = 0.20;
      float E = 0.02;
      float F = 0.30;
      return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
    }
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;
      
      // HDR tone mapping
      color *= exposure * (1.0 + audioBoost);
      color = Uncharted2Tonemap(color * 2.0);
      vec3 whiteScale = 1.0 / Uncharted2Tonemap(vec3(11.2));
      color *= whiteScale;
      
      // Bloom extraction
      float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
      vec3 bloom = vec3(0.0);
      
      if (brightness > bloomThreshold) {
        bloom = color * bloomStrength;
      }
      
      gl_FragColor = vec4(color + bloom, texel.a);
    }
  `;
}

export class QuantumWaveShader {
  static vertexShader = `
    uniform float time;
    uniform float waveAmplitude;
    uniform float waveFrequency;
    uniform float audioInfluence;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;
    
    // 3D Perlin noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Multi-octave noise for quantum effect
      float noise = 0.0;
      float amplitude = waveAmplitude;
      float frequency = waveFrequency;
      
      for (int i = 0; i < 4; i++) {
        noise += snoise(position * frequency + time * 0.5) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      // Audio-reactive displacement
      noise *= 1.0 + audioInfluence;
      
      vec3 displaced = position + normal * noise;
      vDisplacement = noise;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `;
  
  static fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDisplacement;
    
    void main() {
      // Quantum interference pattern
      float pattern = sin(vDisplacement * 10.0 + time) * 0.5 + 0.5;
      
      // Multi-color gradient based on displacement
      vec3 color;
      if (vDisplacement < 0.0) {
        color = mix(color1, color2, abs(vDisplacement) * 2.0);
      } else {
        color = mix(color2, color3, vDisplacement * 2.0);
      }
      
      // Fresnel glow
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
      
      color += vec3(fresnel) * 0.3;
      color *= pattern;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

export class CosmicDustShader {
  static uniforms = {
    time: { value: 0 },
    color: { value: new THREE.Color(0xffffff) },
    density: { value: 1.0 },
    audioIntensity: { value: 0 },
  };
  
  static vertexShader = `
    uniform float time;
    uniform float audioIntensity;
    
    attribute float size;
    attribute float randomPhase;
    
    varying float vAlpha;
    
    void main() {
      vAlpha = 0.3 + audioIntensity * 0.3;
      
      vec3 pos = position;
      pos.y += sin(time + randomPhase) * audioIntensity * 2.0;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + audioIntensity);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  static fragmentShader = `
    uniform vec3 color;
    varying float vAlpha;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      float alpha = (1.0 - dist * 2.0) * vAlpha;
      gl_FragColor = vec4(color, alpha);
    }
  `;
}

/**
 * Shader Manager - Centralized shader creation and management
 */
export class AdvancedShaderManager {
  private scene: THREE.Scene;
  private volumetricLights: THREE.Mesh[] = [];
  private atmospheres: THREE.Mesh[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  createVolumetricLight(lightPosition: THREE.Vector3, color: THREE.Color, intensity: number): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: lightPosition },
        lightColor: { value: color },
        intensity: { value: intensity },
        scatteringStrength: { value: 0.5 },
        audioReactivity: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: VolumetricLightShader.vertexShader,
      fragmentShader: VolumetricLightShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(lightPosition);
    this.volumetricLights.push(mesh);
    this.scene.add(mesh);
    
    return mesh;
  }
  
  createAtmosphere(planetCenter: THREE.Vector3, planetRadius: number, atmosphereRadius: number): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(atmosphereRadius, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        planetCenter: { value: planetCenter },
        planetRadius: { value: planetRadius },
        atmosphereRadius: { value: atmosphereRadius },
        rayleighColor: { value: new THREE.Color(0x87CEEB) },
        rayleighStrength: { value: 1.0 },
        mieStrength: { value: 0.5 },
        audioIntensity: { value: 0 },
      },
      vertexShader: AtmosphericScatteringShader.vertexShader,
      fragmentShader: AtmosphericScatteringShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(planetCenter);
    this.atmospheres.push(mesh);
    this.scene.add(mesh);
    
    return mesh;
  }
  
  update(deltaTime: number, audioData: { bass: number; mid: number; treble: number; overall: number }): void {
    this.volumetricLights.forEach(light => {
      if (light.material instanceof THREE.ShaderMaterial) {
        light.material.uniforms.time.value += deltaTime;
        light.material.uniforms.audioReactivity.value = audioData.overall;
      }
    });
    
    this.atmospheres.forEach(atmosphere => {
      if (atmosphere.material instanceof THREE.ShaderMaterial) {
        atmosphere.material.uniforms.audioIntensity.value = audioData.mid;
      }
    });
  }
  
  dispose(): void {
    [...this.volumetricLights, ...this.atmospheres].forEach(mesh => {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    
    this.volumetricLights = [];
    this.atmospheres = [];
  }
}
