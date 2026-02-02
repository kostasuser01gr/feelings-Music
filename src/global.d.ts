/**
 * Global type declarations for the application
 */

import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Object3D types
      group: any;
      mesh: any;
      points: any;
      line: any;
      lineLoop: any;
      lineSegments: any;
      sprite: any;
      instancedMesh: any;
      
      // Geometry types
      sphereGeometry: any;
      boxGeometry: any;
      planeGeometry: any;
      circleGeometry: any;
      coneGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      torusGeometry: any;
      dodecahedronGeometry: any;
      icosahedronGeometry: any;
      bufferGeometry: any;
      
      // Material types
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshPhongMaterial: any;
      lineBasicMaterial: any;
      lineDashedMaterial: any;
      pointsMaterial: any;
      shaderMaterial: any;
      
      // Light types
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
      
      // Other
      primitive: any;
    }
  }
}

export {};
