import React, { useMemo } from 'react';
import * as THREE from 'three';

// Shared materials for low barriers
const materials = {
  chairRed: new THREE.MeshStandardMaterial({ color: '#da291c', roughness: 0.5 }),
  chairBlue: new THREE.MeshStandardMaterial({ color: '#1e88e5', roughness: 0.5 }),
  chairTable: new THREE.MeshStandardMaterial({ color: '#da291c', roughness: 0.5 }),
  bambooLight: new THREE.MeshStandardMaterial({ color: '#d4a373', roughness: 0.8 }),
  bambooDark: new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.9 }),
  fruitGreen: new THREE.MeshStandardMaterial({ color: '#7cb342', roughness: 0.6 }),
  fruitYellow: new THREE.MeshStandardMaterial({ color: '#fbc02d', roughness: 0.5 }),
  fruitRed: new THREE.MeshStandardMaterial({ color: '#e53935', roughness: 0.6 }),
  barrierYellow: new THREE.MeshStandardMaterial({ color: '#fbc02d', roughness: 0.6 }),
  barrierBlack: new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.7 }),
};

/**
 * Low Barrier Obstacle (Must Jump over or Dodge)
 * Variant 0: Saigon Plastic Cafe Stools & Low Table (Ghế nhựa vỉa hè)
 * Variant 1: Street Vendor Bamboo Fruit Baskets (Gánh hàng rong)
 * Variant 2: Road Repair Construction Barrier
 */
function LowBarrier({ variant = 0, position = [0, 0, 0] }) {
  // Height: ~0.6m, cleanly jumpable (player jump apex is 2.8m)
  const obstacleType = variant % 3;

  return (
    <group position={position} name="obstacle-low">
      {obstacleType === 0 && (
        /* Saigon Plastic Stools Cluster (Ghế nhựa) */
        <group position={[0, 0, 0]}>
          {/* Small plastic table */}
          <group position={[0, 0.25, 0]}>
            {/* Table top */}
            <mesh position={[0, 0.22, 0]} castShadow material={materials.chairRed}>
              <boxGeometry args={[0.55, 0.04, 0.55]} />
            </mesh>
            {/* Table 4 legs */}
            {[-0.22, 0.22].map((x) =>
              [-0.22, 0.22].map((z) => (
                <mesh key={`tleg-${x}-${z}`} position={[x, 0, z]} castShadow material={materials.chairRed}>
                  <cylinderGeometry args={[0.02, 0.02, 0.44, 6]} />
                </mesh>
              ))
            )}
          </group>

          {/* Red stool left */}
          <group position={[-0.42, 0, 0]}>
            <mesh position={[0, 0.28, 0]} castShadow material={materials.chairRed}>
              <boxGeometry args={[0.3, 0.04, 0.3]} />
            </mesh>
            {[-0.11, 0.11].map((x) =>
              [-0.11, 0.11].map((z) => (
                <mesh key={`sleg1-${x}-${z}`} position={[x, 0.14, z]} castShadow material={materials.chairRed}>
                  <cylinderGeometry args={[0.015, 0.015, 0.28, 6]} />
                </mesh>
              ))
            )}
          </group>

          {/* Blue stool right */}
          <group position={[0.42, 0, 0]}>
            <mesh position={[0, 0.28, 0]} castShadow material={materials.chairBlue}>
              <boxGeometry args={[0.3, 0.04, 0.3]} />
            </mesh>
            {[-0.11, 0.11].map((x) =>
              [-0.11, 0.11].map((z) => (
                <mesh key={`sleg2-${x}-${z}`} position={[x, 0.14, z]} castShadow material={materials.chairBlue}>
                  <cylinderGeometry args={[0.015, 0.015, 0.28, 6]} />
                </mesh>
              ))
            )}
          </group>
        </group>
      )}

      {obstacleType === 1 && (
        /* Street Vendor Bamboo Baskets (Gánh hàng rong) */
        <group position={[0, 0, 0]}>
          {/* Bamboo carrying pole (Đòn gánh) resting across baskets */}
          <mesh position={[0, 0.52, 0]} rotation-z={Math.PI / 2} castShadow material={materials.bambooDark}>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
          </mesh>

          {/* Left basket */}
          <group position={[-0.45, 0, 0]}>
            {/* Basket rim & base */}
            <mesh position={[0, 0.22, 0]} castShadow material={materials.bambooLight}>
              <cylinderGeometry args={[0.32, 0.22, 0.36, 16, 1, true]} />
            </mesh>
            <mesh position={[0, 0.04, 0]} material={materials.bambooLight}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            </mesh>
            {/* Fruits pile */}
            <mesh position={[0, 0.35, 0]} castShadow material={materials.fruitYellow}>
              <sphereGeometry args={[0.22, 8, 8]} />
            </mesh>
            <mesh position={[0.1, 0.42, 0.05]} castShadow material={materials.fruitGreen}>
              <sphereGeometry args={[0.14, 8, 8]} />
            </mesh>
          </group>

          {/* Right basket */}
          <group position={[0.45, 0, 0]}>
            <mesh position={[0, 0.22, 0]} castShadow material={materials.bambooLight}>
              <cylinderGeometry args={[0.32, 0.22, 0.36, 16, 1, true]} />
            </mesh>
            <mesh position={[0, 0.04, 0]} material={materials.bambooLight}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            </mesh>
            {/* Fruits pile */}
            <mesh position={[0, 0.35, 0]} castShadow material={materials.fruitRed}>
              <sphereGeometry args={[0.22, 8, 8]} />
            </mesh>
            <mesh position={[-0.08, 0.42, -0.05]} castShadow material={materials.fruitGreen}>
              <sphereGeometry args={[0.14, 8, 8]} />
            </mesh>
          </group>
        </group>
      )}

      {obstacleType === 2 && (
        /* Yellow & Black Construction Barrier */
        <group position={[0, 0, 0]}>
          {/* Main striped bar */}
          <mesh position={[0, 0.46, 0]} castShadow material={materials.barrierYellow}>
            <boxGeometry args={[1.3, 0.18, 0.08]} />
          </mesh>
          {/* Black warning stripes */}
          {[-0.4, 0, 0.4].map((x, i) => (
            <mesh key={`stripe-${i}`} position={[x, 0.46, 0.042]} material={materials.barrierBlack}>
              <boxGeometry args={[0.16, 0.18, 0.01]} />
            </mesh>
          ))}
          {/* A-frame support legs */}
          <mesh position={[-0.55, 0.24, 0]} rotation-z={0.2} castShadow material={materials.barrierBlack}>
            <cylinderGeometry args={[0.03, 0.03, 0.52, 6]} />
          </mesh>
          <mesh position={[0.55, 0.24, 0]} rotation-z={-0.2} castShadow material={materials.barrierBlack}>
            <cylinderGeometry args={[0.03, 0.03, 0.52, 6]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default React.memo(LowBarrier);
