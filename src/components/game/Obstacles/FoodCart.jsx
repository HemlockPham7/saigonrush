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

/**
 * Street Food Cart Obstacle (Xe Hủ Tiếu / Xe Bánh Mì)
 * Large street food cart blocking a single lane. Must switch lanes to avoid.
 */
function FoodCart({ position = [0, 0, 0], type = 'banhmi' }) {
  return (
    <group position={position} name="obstacle-foodcart">
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

      {/* Upper Glass Showcase Counter */}
      <mesh position={[0, 1.45, -0.1]} material={materials.glassShowcase}>
        <boxGeometry args={[1.05, 0.65, 1.15]} />
      </mesh>

      {/* Display Shelf Contents (Baguettes / Meat) */}
      <mesh position={[-0.25, 1.35, -0.1]} castShadow material={materials.breadGolden}>
        <cylinderGeometry args={[0.07, 0.08, 0.35, 8]} />
      </mesh>
      <mesh position={[0, 1.35, -0.1]} castShadow material={materials.breadGolden}>
        <cylinderGeometry args={[0.07, 0.08, 0.35, 8]} />
      </mesh>
      <mesh position={[0.25, 1.35, -0.1]} castShadow material={materials.breadGolden}>
        <cylinderGeometry args={[0.07, 0.08, 0.35, 8]} />
      </mesh>

      {/* Steaming Broth Soup Pot on Counter Rear */}
      <mesh position={[0, 1.25, 0.48]} castShadow material={materials.soupPot}>
        <cylinderGeometry args={[0.2, 0.18, 0.32, 16]} />
      </mesh>

      {/* Metal Canopy Posts */}
      {[-0.52, 0.52].map((x) =>
        [-0.65, 0.65].map((z) => (
          <mesh key={`cpost-${x}-${z}`} position={[x, 1.6, z]} material={materials.stainlessSteel}>
            <cylinderGeometry args={[0.025, 0.025, 0.95, 6]} />
          </mesh>
        ))
      )}

      {/* Roof Canopy Overhang */}
      <group position={[0, 2.05, 0]}>
        <mesh castShadow material={materials.cartCanopy}>
          <boxGeometry args={[1.25, 0.08, 1.55]} />
        </mesh>
        {/* Yellow header signboard flap */}
        <mesh position={[0, -0.1, -0.76]} material={materials.canopyYellow}>
          <boxGeometry args={[1.2, 0.18, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}

export default React.memo(FoodCart);
