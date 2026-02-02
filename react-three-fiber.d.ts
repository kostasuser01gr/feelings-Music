/**
 * React Three Fiber JSX type extensions
 */

import * as React from 'react';

declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any>;
    type ElementClass = React.Component<any>;
    
    interface IntrinsicElements {
      // Object3D
      group: any;
      mesh: any;
      points: any;
      line: any;
      lineLoop: any;
      lineSegments: any;
      sprite: any;
      instancedMesh: any;
      scene: any;
      
      // Geometries
      sphereGeometry: any;
      boxGeometry: any;
      planeGeometry: any;
      circleGeometry: any;
      coneGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      torusGeometry: any;
      torusKnotGeometry: any;
      dodecahedronGeometry: any;
      icosahedronGeometry: any;
      octahedronGeometry: any;
      tetrahedronGeometry: any;
      bufferGeometry: any;
      
      // Materials
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshPhongMaterial: any;
      meshLambertMaterial: any;
      meshMatcapMaterial: any;
      meshNormalMaterial: any;
      meshToonMaterial: any;
      lineBasicMaterial: any;
      lineDashedMaterial: any;
      pointsMaterial: any;
      shaderMaterial: any;
      rawShaderMaterial: any;
      spriteMaterial: any;
      
      // Lights
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
      rectAreaLight: any;
      
      // Other
      primitive: any;
    }
  }
}

export {};
