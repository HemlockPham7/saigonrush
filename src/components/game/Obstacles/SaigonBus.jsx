import React from 'react';
import * as THREE from 'three';

const materials = {
  busGreen: new THREE.MeshStandardMaterial({
    color: '#2d9a5b',
    roughness: 0.4,
  }),
  busWhite: new THREE.MeshStandardMaterial({
    color: '#f0f2f5',
    roughness: 0.4,
  }),
  busRoof: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.6,
  }),
  busGlass: new THREE.MeshStandardMaterial({
    color: '#1a365d',
    roughness: 0.1,
    metalness: 0.7,
  }),
  busTire: new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.9,
  }),
  busRim: new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.3,
    metalness: 0.8,
  }),
  routeDisplay: new THREE.MeshBasicMaterial({
    color: '#ffeb3b',
  }),
  rampWedge: new THREE.MeshStandardMaterial({
    color: '#e5ab30',
    roughness: 0.7,
  }),
  rampChevrons: new THREE.MeshBasicMaterial({
    color: '#1a1a1a',
  }),
};

/**
 * Saigon City Bus Obstacle (Xe Buýt Sài Gòn)
 * Large green bus occupying an entire lane.
 * Equipped with a front climbable sloped ramp allowing the player
 * to run onto the bus roof (height y = 2.5m) to collect elevated coin arcs.
 */
function SaigonBus({ position = [0, 0, 0], hasRamp = true }) {
  const busLength = 8.5;
  const busWidth = 2.1;
  const busHeight = 2.4;

  return (
    <group position={position} name="obstacle-bus">
      {/* ===================================================================
          1. MAIN BUS BODY (Green & White Saigon City Bus)
          =================================================================== */}
      {/* Lower White Body Stripe */}
      <mesh position={[0, 0.65, 0]} castShadow material={materials.busWhite}>
        <boxGeometry args={[busWidth, 0.6, busLength]} />
      </mesh>

      {/* Upper Green Body */}
      <mesh position={[0, 1.6, 0]} castShadow material={materials.busGreen}>
        <boxGeometry args={[busWidth, 1.3, busLength]} />
      </mesh>

      {/* Reinforced Walkable Roof Surface (y = 2.45m) */}
      <mesh position={[0, 2.45, 0]} receiveShadow material={materials.busRoof}>
        <boxGeometry args={[busWidth - 0.05, 0.1, busLength - 0.1]} />
      </mesh>

      {/* Front Windshield (Facing +Z towards oncoming runner) */}
      <mesh position={[0, 1.65, busLength / 2 + 0.01]} material={materials.busGlass}>
        <planeGeometry args={[busWidth * 0.88, 0.95]} />
      </mesh>

      {/* Route LED Header Display ("01 BẾN THÀNH - CHỢ LỚN") */}
      <mesh position={[0, 2.22, busLength / 2 + 0.02]} material={materials.routeDisplay}>
        <planeGeometry args={[1.4, 0.22]} />
      </mesh>

      {/* Rear Window (Facing -Z) */}
      <mesh position={[0, 1.65, -busLength / 2 - 0.01]} rotation-y={Math.PI} material={materials.busGlass}>
        <planeGeometry args={[busWidth * 0.88, 0.95]} />
      </mesh>

      {/* Side Passenger Windows */}
      {/* Left Windows */}
      <mesh position={[-busWidth / 2 - 0.01, 1.65, 0]} rotation-y={-Math.PI / 2} material={materials.busGlass}>
        <planeGeometry args={[busLength * 0.75, 0.85]} />
      </mesh>
      {/* Right Windows */}
      <mesh position={[busWidth / 2 + 0.01, 1.65, 0]} rotation-y={Math.PI / 2} material={materials.busGlass}>
        <planeGeometry args={[busLength * 0.75, 0.85]} />
      </mesh>

      {/* ===================================================================
          2. WHEELS (4 Large Bus Tires)
          =================================================================== */}
      {/* Front Wheels (closer to +Z) */}
      {[-busWidth / 2 - 0.02, busWidth / 2 + 0.02].map((x, i) => (
        <group key={`fw-${i}`} position={[x, 0.45, 2.6]}>
          <mesh rotation-z={Math.PI / 2} castShadow material={materials.busTire}>
            <cylinderGeometry args={[0.45, 0.45, 0.18, 16]} />
          </mesh>
          <mesh rotation-z={Math.PI / 2} material={materials.busRim}>
            <cylinderGeometry args={[0.26, 0.26, 0.19, 12]} />
          </mesh>
        </group>
      ))}

      {/* Rear Dual Wheels (closer to -Z) */}
      {[-busWidth / 2 - 0.02, busWidth / 2 + 0.02].map((x, i) => (
        <group key={`rw-${i}`} position={[x, 0.45, -2.4]}>
          <mesh rotation-z={Math.PI / 2} castShadow material={materials.busTire}>
            <cylinderGeometry args={[0.45, 0.45, 0.22, 16]} />
          </mesh>
          <mesh rotation-z={Math.PI / 2} material={materials.busRim}>
            <cylinderGeometry args={[0.26, 0.26, 0.23, 12]} />
          </mesh>
        </group>
      ))}

      {/* ===================================================================
          3. FRONT CLIMBABLE ROAD RAMP
          Sloped wedge from y = 0 to y = 2.45 over 4.2m length.
          Faces +Z so runner runs up the ramp onto the bus roof!
          =================================================================== */}
      {hasRamp && (
        <group position={[0, 0, busLength / 2 + 2.1]}>
          {/* Sloped ramp surface */}
          {/* Angle: +0.53 rad pitches +Z down to road level, -Z meets bus roof */}
          <group position={[0, 1.22, 0]} rotation-x={0.53}>
            <mesh receiveShadow castShadow material={materials.rampWedge}>
              <boxGeometry args={[busWidth - 0.1, 0.12, 4.8]} />
            </mesh>
            {/* Speed chevron stripes on ramp surface */}
            {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
              <mesh key={`chev-${i}`} position={[0, 0.07, z]} material={materials.rampChevrons}>
                <planeGeometry args={[1.2, 0.2]} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
}

export default React.memo(SaigonBus);
