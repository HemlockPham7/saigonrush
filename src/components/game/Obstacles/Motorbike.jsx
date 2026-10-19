import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore.js';
import { GAME_STATE } from '../../../systems/constants.js';

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

/**
 * Motorbike Obstacle (Xe máy)
 * Modeled after iconic Saigon Honda Wave/Cub motorbikes.
 * Moving variant drives forward in the lane.
 */
function Motorbike({
  position = [0, 0, 0],
  isMoving = false,
  color = 'red',
  hasCargo = true,
}) {
  const bikeRef = useRef();
  const frontWheelRef = useRef();
  const rearWheelRef = useRef();

  const bodyMat = color === 'blue' ? materials.bodyBlue : materials.bodyRed;

  // Local movement for moving motorbikes
  useFrame((state, delta) => {
    if (!bikeRef.current) return;

    if (isMoving && useGameStore.getState().gameState === GAME_STATE.PLAYING) {
      // Motorbike drives along positive Z (same direction as traffic, slower than runner)
      const forwardSpeed = 6.0; // m/s forward relative to track
      bikeRef.current.position.z += forwardSpeed * delta;

      // Wheel spin
      const spin = delta * 18.0;
      if (frontWheelRef.current) frontWheelRef.current.rotation.x += spin;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x += spin;
    }
  });

  return (
    <group ref={bikeRef} position={position} name="obstacle-motorbike">
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
      <mesh position={[0, 0.98, -0.52]} material={materials.headlight}>
        <sphereGeometry args={[0.08, 8, 8]} />
      </mesh>
      {/* Rear Taillight */}
      <mesh position={[0, 0.68, 0.62]} material={materials.taillight}>
        <boxGeometry args={[0.16, 0.08, 0.04]} />
      </mesh>

      {/* Long Black Vinyl Seat */}
      <mesh position={[0, 0.76, 0.15]} castShadow material={materials.seatBlack}>
        <boxGeometry args={[0.28, 0.1, 0.75]} />
      </mesh>

      {/* Exhaust Pipe (Chrome) */}
      <mesh position={[0.22, 0.28, 0.25]} rotation-x={0.1} material={materials.chrome}>
        <cylinderGeometry args={[0.04, 0.05, 0.8, 8]} />
      </mesh>

      {/* Delivery Cargo Basket / Box on Rear Rack */}
      {hasCargo && (
        <group position={[0, 0.98, 0.6]}>
          <mesh castShadow material={materials.cargoBox}>
            <boxGeometry args={[0.48, 0.36, 0.44]} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow material={materials.tireRubber}>
            <boxGeometry args={[0.42, 0.12, 0.38]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default React.memo(Motorbike);
