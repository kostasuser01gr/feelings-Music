/**
 * React Three Fiber type definitions for Three.js JSX elements
 */

import type * as THREE from 'three';
import type { Object3DNode, MaterialNode, Node } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Object3D elements
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      points: Object3DNode<THREE.Points, typeof THREE.Points>;
      instancedMesh: Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>;
      line: Object3DNode<THREE.Line, typeof THREE.Line>;
      lineSegments: Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>;
      
      // Geometry elements
      sphereGeometry: Node<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      ringGeometry: Node<THREE.RingGeometry, typeof THREE.RingGeometry>;
      dodecahedronGeometry: Node<THREE.DodecahedronGeometry, typeof THREE.DodecahedronGeometry>;
      boxGeometry: Node<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      planeGeometry: Node<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      bufferGeometry: Node<THREE.BufferGeometry, typeof THREE.BufferGeometry>;
      
      // Material elements
      meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      meshStandardMaterial: MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshPhysicalMaterial: MaterialNode<THREE.MeshPhysicalMaterial, typeof THREE.MeshPhysicalMaterial>;
      lineBasicMaterial: MaterialNode<THREE.LineBasicMaterial, typeof THREE.LineBasicMaterial>;
      pointsMaterial: MaterialNode<THREE.PointsMaterial, typeof THREE.PointsMaterial>;
      shaderMaterial: MaterialNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
      
      // Special element for passing objects directly
      primitive: { object: any; [key: string]: any };
    }
  }
}