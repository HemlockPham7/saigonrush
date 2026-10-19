import React from 'react';
import * as THREE from 'three';

const materials = {
  stainlessSteel: new THREE.MeshStandardMaterial({
    color: '#e0e0e0',
    roughness: 0.3,
    metalness: 0.85,
  }),
  glassShowcase: new THREE.MeshStandardMaterial({
    color: '#b0bec5',
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
  }),
  cartCanopy: new THREE.MeshStandardMaterial({
    color: '#da291c',
    roughness: 0.5,
  }),
  canopyYellow: new THREE.MeshStandardMaterial({
    color: '#ffd166',
    roughness: 0.5,
  }),
  wheelRubber: new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.9,
  }),
  breadGolden: new THREE.MeshStandardMaterial({
    color: '#e69a3d',
    roughness: 0.7,
  }),
  soupPot: new THREE.MeshStandardMaterial({
    color: '#f5f5f5',
    roughness: 0.2,
    metalness: 0.95,
  }),
};

export default function ProceduralFoodCart({ type = 'banhmi' }) {
  return (
    <group>
      {/* Lower Stainless Steel Cabinet Body */}
      <mesh position={[0, 0.72, 0]} castShadow material={materials.stainlessSteel}>
        <boxGeometry args={[1.1, 0.85, 1.4]} />
      </mesh>

      {/* 2 Main Wheels */}
      <mesh position={[-0.58, 0.35, 0.2]} rotation-z={Math.PI / 2} castShadow material={materials.wheelRubber}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
      </mesh>
      <mesh position={[0.58, 0.35, 0.2]} rotation-z={Math.PI / 2} castShadow material={materials.wheelRubber}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
      </mesh>

      {/* Front Small Caster Wheels */}
      <mesh position={[-0.5, 0.15, -0.55]} rotation-z={Math.PI / 2} material={materials.wheelRubber}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 12]} />
      </mesh>
      <mesh position={[0.5, 0.15, -0.55]} rotation-z={Math.PI / 2} material={materials.wheelRubber}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 12]} />
      </mesh>

      {/* Glass Display Showcase */}
      <mesh position={[0, 1.5, -0.05]} material={materials.glassShowcase}>
        <boxGeometry args={[1.0, 0.7, 1.2]} />
      </mesh>

      {/* Contents inside glass */}
      {type === 'banhmi' ? (
        <group position={[0, 1.35, -0.05]}>
          {[-0.25, 0, 0.25].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation-z={0.3} material={materials.breadGolden}>
              <cylinderGeometry args={[0.07, 0.07, 0.35, 8]} />
            </mesh>
          ))}
        </group>
      ) : (
        <mesh position={[0, 1.35, -0.05]} material={materials.soupPot}>
          <cylinderGeometry args={[0.25, 0.22, 0.35, 16]} />
        </mesh>
      )}

      {/* Striped Canopy / Awning Roof */}
      <group position={[0, 2.3, 0]}>
        <mesh castShadow material={materials.cartCanopy}>
          <boxGeometry args={[1.25, 0.06, 1.6]} />
        </mesh>
        {/* Yellow decorative stripes */}
        {[-0.4, 0, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.035, 0]} material={materials.canopyYellow}>
            <boxGeometry args={[0.18, 0.02, 1.62]} />
          </mesh>
        ))}
      </group>

      {/* Canopy Support Poles */}
      {[
        [-0.5, 1.7, -0.65],
        [0.5, 1.7, -0.65],
        [-0.5, 1.7, 0.65],
        [0.5, 1.7, 0.65],
      ].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]} material={materials.stainlessSteel}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        </mesh>
      ))}

      {/* Push Handle on back */}
      <mesh position={[0, 1.05, 0.8]} material={materials.stainlessSteel}>
        <boxGeometry args={[0.9, 0.04, 0.2]} />
      </mesh>
    </group>
  );
}
