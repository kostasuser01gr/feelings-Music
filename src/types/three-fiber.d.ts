import { ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      instancedMesh: ReactThreeFiber.Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>;
      points: ReactThreeFiber.Object3DNode<THREE.Points, typeof THREE.Points>;
      line: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
      lineLoop: ReactThreeFiber.Object3DNode<THREE.LineLoop, typeof THREE.LineLoop>;
      lineSegments: ReactThreeFiber.Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>;
      sprite: ReactThreeFiber.Object3DNode<THREE.Sprite, typeof THREE.Sprite>;
      
      // Geometries
      boxGeometry: ReactThreeFiber.Node<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: ReactThreeFiber.Node<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      cylinderGeometry: ReactThreeFiber.Node<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>;
      coneGeometry: ReactThreeFiber.Node<THREE.ConeGeometry, typeof THREE.ConeGeometry>;
      planeGeometry: ReactThreeFiber.Node<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      ringGeometry: ReactThreeFiber.Node<THREE.RingGeometry, typeof THREE.RingGeometry>;
      torusGeometry: ReactThreeFiber.Node<THREE.TorusGeometry, typeof THREE.TorusGeometry>;
      dodecahedronGeometry: ReactThreeFiber.Node<THREE.DodecahedronGeometry, typeof THREE.DodecahedronGeometry>;
      icosahedronGeometry: ReactThreeFiber.Node<THREE.IcosahedronGeometry, typeof THREE.IcosahedronGeometry>;
      octahedronGeometry: ReactThreeFiber.Node<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>;
      tetrahedronGeometry: ReactThreeFiber.Node<THREE.TetrahedronGeometry, typeof THREE.TetrahedronGeometry>;
      
      // Materials
      meshBasicMaterial: ReactThreeFiber.MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      meshStandardMaterial: ReactThreeFiber.MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshPhysicalMaterial: ReactThreeFiber.MaterialNode<THREE.MeshPhysicalMaterial, typeof THREE.MeshPhysicalMaterial>;
      meshLambertMaterial: ReactThreeFiber.MaterialNode<THREE.MeshLambertMaterial, typeof THREE.MeshLambertMaterial>;
      meshPhongMaterial: ReactThreeFiber.MaterialNode<THREE.MeshPhongMaterial, typeof THREE.MeshPhongMaterial>;
      meshMatcapMaterial: ReactThreeFiber.MaterialNode<THREE.MeshMatcapMaterial, typeof THREE.MeshMatcapMaterial>;
      meshNormalMaterial: ReactThreeFiber.MaterialNode<THREE.MeshNormalMaterial, typeof THREE.MeshNormalMaterial>;
      meshToonMaterial: ReactThreeFiber.MaterialNode<THREE.MeshToonMaterial, typeof THREE.MeshToonMaterial>;
      pointsMaterial: ReactThreeFiber.MaterialNode<THREE.PointsMaterial, typeof THREE.PointsMaterial>;
      lineBasicMaterial: ReactThreeFiber.MaterialNode<THREE.LineBasicMaterial, typeof THREE.LineBasicMaterial>;
      lineDashedMaterial: ReactThreeFiber.MaterialNode<THREE.LineDashedMaterial, typeof THREE.LineDashedMaterial>;
      shaderMaterial: ReactThreeFiber.MaterialNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
      rawShaderMaterial: ReactThreeFiber.MaterialNode<THREE.RawShaderMaterial, typeof THREE.RawShaderMaterial>;
      spriteMaterial: ReactThreeFiber.MaterialNode<THREE.SpriteMaterial, typeof THREE.SpriteMaterial>;
      shadowMaterial: ReactThreeFiber.MaterialNode<THREE.ShadowMaterial, typeof THREE.ShadowMaterial>;
      
      // Lights
      ambientLight: ReactThreeFiber.LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: ReactThreeFiber.LightNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
      pointLight: ReactThreeFiber.LightNode<THREE.PointLight, typeof THREE.PointLight>;
      spotLight: ReactThreeFiber.LightNode<THREE.SpotLight, typeof THREE.SpotLight>;
      hemisphereLight: ReactThreeFiber.LightNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>;
      rectAreaLight: ReactThreeFiber.LightNode<THREE.RectAreaLight, typeof THREE.RectAreaLight>;
      
      // Helpers
      axesHelper: ReactThreeFiber.Node<THREE.AxesHelper, typeof THREE.AxesHelper>;
      gridHelper: ReactThreeFiber.Node<THREE.GridHelper, typeof THREE.GridHelper>;
      polarGridHelper: ReactThreeFiber.Node<THREE.PolarGridHelper, typeof THREE.PolarGridHelper>;
      
      // Other
      primitive: { object: any; [key: string]: any };
      scene: ReactThreeFiber.Object3DNode<THREE.Scene, typeof THREE.Scene>;
      perspectiveCamera: ReactThreeFiber.CameraNode<THREE.PerspectiveCamera, typeof THREE.PerspectiveCamera>;
      orthographicCamera: ReactThreeFiber.CameraNode<THREE.OrthographicCamera, typeof THREE.OrthographicCamera>;
    }
  }
}