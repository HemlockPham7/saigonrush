import React from 'react';
import * as THREE from 'three';

const materials = {
  // Coffee (Cà phê sữa đá)
  glass: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
  }),
  condensedMilk: new THREE.MeshStandardMaterial({
    color: '#fff8e7',
    roughness: 0.5,
  }),
  coffeeLiquid: new THREE.MeshStandardMaterial({
    color: '#3e2723',
    roughness: 0.4,
  }),
  phinMetal: new THREE.MeshStandardMaterial({
    color: '#cfd8dc',
    metalness: 0.9,
    roughness: 0.25,
  }),

  // Conical Hat (Nón lá shield)
  strawHat: new THREE.MeshStandardMaterial({
    color: '#f4d58d',
    roughness: 0.7,
    side: THREE.DoubleSide,
  }),
  redRibbon: new THREE.MeshStandardMaterial({
    color: '#da291c',
    roughness: 0.5,
  }),

  // Baguette (Bánh mì magnet)
  breadCrust: new THREE.MeshStandardMaterial({
    color: '#d48b38',
    roughness: 0.7,
  }),
  paperSleeve: new THREE.MeshStandardMaterial({
    color: '#ede0d4',
    roughness: 0.9,
  }),
  chiliGarnish: new THREE.MeshStandardMaterial({
    color: '#2e7d32',
    roughness: 0.6,
  }),

  // Iced Tea (Trà đá multiplier)
  teaAmber: new THREE.MeshStandardMaterial({
    color: '#e6a122',
    transparent: true,
    opacity: 0.75,
    roughness: 0.2,
  }),
  strawStriped: new THREE.MeshStandardMaterial({
    color: '#ff3366',
    roughness: 0.4,
  }),
  iceCube: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
  }),
};

export default function ProceduralPowerUp({ type }) {
  switch (type) {
    case 'coffee':
      return (
        <group>
          {/* Glass tumbler */}
          <mesh material={materials.glass}>
            <cylinderGeometry args={[0.22, 0.18, 0.55, 16]} />
          </mesh>
          {/* Condensed milk bottom layer */}
          <mesh position={[0, -0.18, 0]} material={materials.condensedMilk}>
            <cylinderGeometry args={[0.19, 0.18, 0.15, 16]} />
          </mesh>
          {/* Dark drip coffee middle layer */}
          <mesh position={[0, 0.05, 0]} material={materials.coffeeLiquid}>
            <cylinderGeometry args={[0.21, 0.19, 0.32, 16]} />
          </mesh>
          {/* Aluminum Phin Filter on top */}
          <group position={[0, 0.38, 0]}>
            <mesh material={materials.phinMetal}>
              <cylinderGeometry args={[0.28, 0.28, 0.03, 16]} />
            </mesh>
            <mesh position={[0, 0.12, 0]} material={materials.phinMetal}>
              <cylinderGeometry args={[0.2, 0.2, 0.22, 16]} />
            </mesh>
            <mesh position={[0, 0.24, 0]} material={materials.phinMetal}>
              <cylinderGeometry args={[0.21, 0.21, 0.02, 16]} />
            </mesh>
          </group>
        </group>
      );

    case 'shield':
      return (
        <group rotation-x={-0.3}>
          {/* Conical straw hat */}
          <mesh material={materials.strawHat}>
            <coneGeometry args={[0.55, 0.38, 20, 1, true]} />
          </mesh>
          {/* Hat rim ring */}
          <mesh rotation-x={Math.PI / 2} material={materials.strawHat}>
            <torusGeometry args={[0.55, 0.02, 8, 20]} />
          </mesh>
          {/* Red silk ribbon ties */}
          <mesh position={[0, -0.15, 0]} material={materials.redRibbon}>
            <torusGeometry args={[0.3, 0.015, 6, 16, Math.PI]} />
          </mesh>
        </group>
      );

    case 'magnet':
      return (
        <group rotation-z={0.35}>
          {/* Crispy baguette body */}
          <mesh rotation-z={Math.PI / 2} material={materials.breadCrust}>
            <cylinderGeometry args={[0.13, 0.15, 0.65, 10]} />
          </mesh>
          {/* Tapered bread ends */}
          <mesh position={[-0.32, 0, 0]} material={materials.breadCrust}>
            <sphereGeometry args={[0.13, 8, 8]} />
          </mesh>
          <mesh position={[0.32, 0, 0]} material={materials.breadCrust}>
            <sphereGeometry args={[0.13, 8, 8]} />
          </mesh>
          {/* Paper sleeve wrapper */}
          <mesh rotation-z={Math.PI / 2} material={materials.paperSleeve}>
            <cylinderGeometry args={[0.16, 0.16, 0.24, 12]} />
          </mesh>
          {/* Cilantro / green chili garnish */}
          <mesh position={[0.08, 0.12, 0]} rotation-z={0.4} material={materials.chiliGarnish}>
            <boxGeometry args={[0.12, 0.04, 0.04]} />
          </mesh>
        </group>
      );

    case 'multiplier':
      return (
        <group>
          {/* Glass cup */}
          <mesh material={materials.glass}>
            <cylinderGeometry args={[0.2, 0.15, 0.6, 16]} />
          </mesh>
          {/* Amber iced tea */}
          <mesh position={[0, -0.04, 0]} material={materials.teaAmber}>
            <cylinderGeometry args={[0.19, 0.15, 0.5, 16]} />
          </mesh>
          {/* Clear ice cubes */}
          <mesh position={[0.04, 0.12, 0]} rotation={[0.4, 0.3, 0.2]} material={materials.iceCube}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
          </mesh>
          <mesh position={[-0.05, 0.08, 0.03]} rotation={[0.2, 0.6, 0.4]} material={materials.iceCube}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
          </mesh>
          {/* Straw */}
          <mesh position={[0.06, 0.18, 0]} rotation-z={-0.2} material={materials.strawStriped}>
            <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}
