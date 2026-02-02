/**
 * Post-Processing Effects
 * Advanced visual effects including:
 * - Bloom
 * - God rays (volumetric light)
 * - Lens flares
 * - Chromatic aberration
 * - Film grain
 */

'use client';

import { useRef, useMemo } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import * as THREE from 'three';
import type { MusicAnalysisData } from '@/lib/advanced-music-analyzer';

// Extend for JSX usage
extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass });

// Chromatic Aberration Shader
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    
    void main() {
      vec2 offset = vec2(amount, 0.0);
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cg = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
    }
  `
};

// Film Grain Shader
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.15 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    varying vec2 vUv;
    
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float noise = random(vUv + time) * intensity;
      gl_FragColor = vec4(color.rgb + noise, color.a);
    }
  `
};

// Vignette Shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 1.0 },
    offset: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0;
      float vignette = smoothstep(offset, offset - 0.7, length(uv));
      color.rgb = mix(color.rgb, color.rgb * vignette, darkness);
      gl_FragColor = color;
    }
  `
};

interface PostProcessingProps {
  musicData?: MusicAnalysisData;
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  enableFilmGrain?: boolean;
  enableVignette?: boolean;
}

export function PostProcessing({
  musicData,
  enableBloom = true,
  enableChromaticAberration = true,
  enableFilmGrain = true,
  enableVignette = true
}: PostProcessingProps) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer>();
  
  const [composer, bloomPass, chromaticPass, grainPass, vignettePass] = useMemo(() => {
    const composer = new EffectComposer(gl);
    composer.setSize(size.width, size.height);
    
    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    if (enableBloom) {
      composer.addPass(bloomPass);
    }
    
    // Chromatic aberration
    const chromaticPass = new ShaderPass(ChromaticAberrationShader);
    if (enableChromaticAberration) {
      composer.addPass(chromaticPass);
    }
    
    // Film grain
    const grainPass = new ShaderPass(FilmGrainShader);
    if (enableFilmGrain) {
      composer.addPass(grainPass);
    }
    
    // Vignette
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.renderToScreen = true;
    if (enableVignette) {
      composer.addPass(vignettePass);
    }
    
    return [composer, bloomPass, chromaticPass, grainPass, vignettePass];
  }, [gl, scene, camera, size, enableBloom, enableChromaticAberration, enableFilmGrain, enableVignette]);
  
  composerRef.current = composer;
  
  // Update effects based on music
  useFrame(() => {
    if (!composerRef.current) return;
    
    const bass = musicData?.bass || 0;
    const volume = musicData?.volume || 0;
    const beat = musicData?.beat || false;
    const time = Date.now() * 0.001;
    
    // Update bloom intensity
    if (bloomPass && enableBloom) {
      (bloomPass as any).strength = 1.5 + bass * 2 + (beat ? 0.5 : 0);
      (bloomPass as any).threshold = 0.85 - volume * 0.3;
    }
    
    // Update chromatic aberration
    if (chromaticPass && enableChromaticAberration) {
      (chromaticPass as any).uniforms.amount.value = 0.002 + bass * 0.008;
    }
    
    // Update film grain
    if (grainPass && enableFilmGrain) {
      (grainPass as any).uniforms.time.value = time;
      (grainPass as any).uniforms.intensity.value = 0.08 + volume * 0.12;
    }
    
    // Update vignette
    if (vignettePass && enableVignette) {
      (vignettePass as any).uniforms.darkness.value = 0.5 + bass * 0.3;
    }
    
    // Render
    composerRef.current.render();
  });
  
  return null;
}

// Volumetric Light (God Rays) Component
export function VolumetricLight({
  position = [0, 0, 0],
  color = '#ffffff',
  intensity = 1,
  musicData
}: {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
  musicData?: MusicAnalysisData;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  
  useFrame(() => {
    if (!lightRef.current) return;
    
    const volume = musicData?.volume || 0;
    const beat = musicData?.beat || false;
    const time = Date.now() * 0.001;
    
    // Pulse light intensity
    const pulseIntensity = intensity * (1 + volume * 2 + (beat ? 0.5 : 0));
    lightRef.current.intensity = pulseIntensity;
    
    // Animate light position slightly
    lightRef.current.position.y = position[1] + Math.sin(time) * 0.5;
  });
  
  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        distance={100}
        decay={2}
      />
      {/* Visible glow sphere */}
      <mesh>
        <sphereGeometry ref={geometryRef} args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Lens Flare Component
export function LensFlare({
  position = [0, 0, 0],
  color = '#ffffff',
  musicData
}: {
  position?: [number, number, number];
  color?: string;
  musicData?: MusicAnalysisData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const flareElements = useMemo(() => {
    return [
      { size: 2, distance: 0, opacity: 1 },
      { size: 1.5, distance: 0.2, opacity: 0.7 },
      { size: 1, distance: 0.4, opacity: 0.5 },
      { size: 0.8, distance: 0.6, opacity: 0.4 },
      { size: 0.6, distance: 0.8, opacity: 0.3 },
      { size: 0.4, distance: 1, opacity: 0.2 }
    ];
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const volume = musicData?.volume || 0;
    
    // Scale based on music
    groupRef.current.scale.setScalar(1 + volume * 0.5);
  });
  
  return (
    <group ref={groupRef} position={position}>
      {flareElements.map((flare, i) => (
        <mesh
          key={i}
          position={[flare.distance * 2, 0, 0]}
        >
          <circleGeometry args={[flare.size, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={flare.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
