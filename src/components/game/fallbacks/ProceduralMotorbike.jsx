import React from 'react';
import * as THREE from 'three';

const materials = {
  bodyRed: new THREE.MeshStandardMaterial({ color: '#c62828', roughness: 0.4 }),
  bodyBlue: new THREE.MeshStandardMaterial({ color: '#1565c0', roughness: 0.4 }),
  tireRubber: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }),
  wheelRim: new THREE.MeshStandardMaterial({ color: '#dcdcdc', roughness: 0.3, metalness: 0.8 }),
  chrome: new THREE.MeshStandardMaterial({ color: '#f0f0f0', roughness: 0.2, metalness: 0.9 }),
  seatBlack: new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.8 }),
  headlight: new THREE.MeshBasicMaterial({ color: '#fff9c4' }),
  taillight: new THREE.MeshBasicMaterial({ color: '#ff1744' }),
  cargoBox: new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.8 }),
};

export default function ProceduralMotorbike({
  color = 'red',
  hasCargo = true,
  frontWheelRef,
  rearWheelRef,
}) {
  const bodyMat = color === 'blue' ? materials.bodyBlue : materials.bodyRed;

  return (
    <group>
      {/* Front Wheel */}
      <group ref={frontWheelRef} position={[0, 0.32, -0.65]}>
        <mesh rotation-z={Math.PI / 2} castShadow material={materials.tireRubber}>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        </mesh>
        <mesh rotation-z={Math.PI / 2} material={materials.wheelRim}>
          <cylinderGeometry args={[0.22, 0.22, 0.11, 12]} />
        </mesh>
      </group>

      {/* Rear Wheel */}
      <group ref={rearWheelRef} position={[0, 0.32, 0.65]}>
        <mesh rotation-z={Math.PI / 2} castShadow material={materials.tireRubber}>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        </mesh>
        <mesh rotation-z={Math.PI / 2} material={materials.wheelRim}>
          <cylinderGeometry args={[0.22, 0.22, 0.11, 12]} />
        </mesh>
      </group>

      {/* Main Body Chassis & Fairing */}
      <mesh position={[0, 0.55, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[0.34, 0.38, 1.1]} />
      </mesh>

      {/* Front Leg Shield & Sloped Fairing */}
      <mesh position={[0, 0.72, -0.45]} rotation-x={0.4} castShadow material={bodyMat}>
        <boxGeometry args={[0.42, 0.45, 0.12]} />
      </mesh>

      {/* Handlebars & Grips */}
      <mesh position={[0, 1.05, -0.42]} material={materials.chrome}>
        <boxGeometry args={[0.7, 0.04, 0.06]} />
      </mesh>

      {/* Headlight */}
      <mesh position={[0, 0.98, -0.56]} material={materials.headlight}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 12]} />
      </mesh>

      {/* Black Vinyl Seat */}
      <mesh position={[0, 0.78, 0.15]} material={materials.seatBlack}>
        <boxGeometry args={[0.36, 0.12, 0.65]} />
      </mesh>

      {/* Chrome Exhaust Pipe */}
      <mesh position={[0.22, 0.28, 0.35]} rotation-x={Math.PI / 2} material={materials.chrome}>
        <cylinderGeometry args={[0.035, 0.045, 0.65, 8]} />
      </mesh>

      {/* Rear Cargo Box or Market Crate */}
      {hasCargo && (
        <mesh position={[0, 0.95, 0.62]} castShadow material={materials.cargoBox}>
          <boxGeometry args={[0.42, 0.32, 0.35]} />
        </mesh>
      )}

      {/* Rear Taillight */}
      <mesh position={[0, 0.68, 0.8]} material={materials.taillight}>
        <boxGeometry args={[0.16, 0.08, 0.04]} />
      </mesh>
    </group>
  );
}
