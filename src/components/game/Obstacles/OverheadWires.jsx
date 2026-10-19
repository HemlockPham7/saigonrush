import React from 'react';
import * as THREE from 'three';

const materials = {
  wireBundle: new THREE.MeshBasicMaterial({ color: '#111114' }),
  metalPole: new THREE.MeshStandardMaterial({ color: '#383c44', roughness: 0.6, metalness: 0.7 }),
  meterBox: new THREE.MeshStandardMaterial({ color: '#757575', roughness: 0.7 }),
  warningSign: new THREE.MeshStandardMaterial({ color: '#e53935', roughness: 0.4 }),
  awningFabric: new THREE.MeshStandardMaterial({ color: '#2d9a5b', roughness: 0.7 }),
  awningStripe: new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.7 }),
};

/**
 * Overhead Hazard Obstacle (Must Slide / Duck under)
 * Bottom clearance is at y ≈ 1.15m.
 * Standing player (height 1.8m) hits it; sliding player (height 0.6m) passes safely underneath.
 */
function OverheadWires({ position = [0, 0, 0], variant = 0 }) {
  const isAwning = variant % 2 === 1;

  return (
    <group position={position} name="obstacle-overhead">
      {!isAwning ? (
        /* Tangled Saigon Electrical Cable Bundle (Mạng nhện dây điện) */
        <group position={[0, 0, 0]}>
          {/* Side support wooden/concrete utility posts */}
          <mesh position={[-1.25, 1.8, 0]} castShadow material={materials.metalPole}>
            <cylinderGeometry args={[0.07, 0.09, 3.6, 8]} />
          </mesh>
          <mesh position={[1.25, 1.8, 0]} castShadow material={materials.metalPole}>
            <cylinderGeometry args={[0.07, 0.09, 3.6, 8]} />
          </mesh>

          {/* Crossbar frame */}
          <mesh position={[0, 2.4, 0]} material={materials.metalPole}>
            <boxGeometry args={[2.6, 0.08, 0.08]} />
          </mesh>

          {/* Lower tangled cable sag (lowest point reaches y = 1.15m) */}
          <group position={[0, 1.35, 0]}>
            {/* Main thick cable bundle */}
            <mesh rotation-z={Math.PI / 2} castShadow material={materials.wireBundle}>
              <cylinderGeometry args={[0.09, 0.09, 2.4, 8]} />
            </mesh>
            {/* Secondary looping cables */}
            <mesh position={[0, -0.08, 0.04]} rotation-z={Math.PI / 2} material={materials.wireBundle}>
              <cylinderGeometry args={[0.04, 0.04, 2.2, 6]} />
            </mesh>
            <mesh position={[0, 0.08, -0.04]} rotation-z={Math.PI / 2} material={materials.wireBundle}>
              <cylinderGeometry args={[0.04, 0.04, 2.3, 6]} />
            </mesh>
          </group>

          {/* Electrical meter box attached to side pole */}
          <mesh position={[-1.12, 1.6, 0.08]} castShadow material={materials.meterBox}>
            <boxGeometry args={[0.22, 0.35, 0.16]} />
          </mesh>

          {/* High Voltage red warning plate */}
          <mesh position={[0, 1.7, 0.06]} material={materials.warningSign}>
            <boxGeometry args={[0.45, 0.22, 0.02]} />
          </mesh>
        </group>
      ) : (
        /* Low Roadside Awning (Mái hiên hạ thấp) */
        <group position={[0, 0, 0]}>
          {/* Support framework */}
          <mesh position={[-1.25, 1.6, 0]} castShadow material={materials.metalPole}>
            <cylinderGeometry args={[0.05, 0.05, 3.2, 8]} />
          </mesh>
          <mesh position={[1.25, 1.6, 0]} castShadow material={materials.metalPole}>
            <cylinderGeometry args={[0.05, 0.05, 3.2, 8]} />
          </mesh>

          {/* Sloped canvas awning reaching down to y = 1.18m */}
          <group position={[0, 1.55, 0]} rotation={[0.45, 0, 0]}>
            <mesh castShadow material={materials.awningFabric}>
              <boxGeometry args={[2.5, 0.04, 1.4]} />
            </mesh>
            {/* Scalloped hanging flap at the bottom edge */}
            <mesh position={[0, -0.15, 0.7]} material={materials.awningStripe}>
              <boxGeometry args={[2.5, 0.25, 0.02]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

export default React.memo(OverheadWires);
