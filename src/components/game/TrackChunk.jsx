import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Shophouse, StreetTree, StreetLamp } from './SceneryElements.jsx';
import TrackObstacles from './Obstacles/TrackObstacles.jsx';
import TrackCollectibles from './Collectibles/TrackCollectibles.jsx';
import { CHUNK_LENGTH, LANE_WIDTH } from '../../systems/constants.js';

// Pre-created static materials
const trackMaterials = {
  asphalt: new THREE.MeshStandardMaterial({
    color: '#26242c',
    roughness: 0.88,
    metalness: 0.1,
  }),
  laneDash: new THREE.MeshBasicMaterial({
    color: '#f0ede6',
    transparent: true,
    opacity: 0.75,
  }),
  sidewalk: new THREE.MeshStandardMaterial({
    color: '#706c66',
    roughness: 0.95,
  }),
  curbYellow: new THREE.MeshStandardMaterial({
    color: '#e5ab30',
    roughness: 0.7,
  }),
  curbBlack: new THREE.MeshStandardMaterial({
    color: '#1a1a1c',
    roughness: 0.8,
  }),
  overheadWire: new THREE.MeshBasicMaterial({
    color: '#16161a',
  }),
};

// Facade style presets to randomize shophouses deterministically
const SHOPHOUSE_PRESETS = [
  { wallColor: 'yellow', height: 9.5, signIndex: 0, hasAwning: true },
  { wallColor: 'mint', height: 8.5, signIndex: 1, hasAwning: false },
  { wallColor: 'blue', height: 10.5, signIndex: 2, hasAwning: true },
  { wallColor: 'rose', height: 8.0, signIndex: 3, hasAwning: true },
  { wallColor: 'cream', height: 9.0, signIndex: 4, hasAwning: false },
];

/**
 * TrackChunk component
 * A single 30m segment of the Saigon roadway with sidewalks, shophouses,
 * trees, streetlamps, and overhead wires.
 */
function TrackChunk({ chunkIndex = 0, position = [0, 0, 0] }) {
  // Generate 7 dash positions for the 30m chunk (z = -12, -8, -4, 0, 4, 8, 12)
  const dashes = useMemo(() => {
    const list = [];
    for (let z = -CHUNK_LENGTH / 2 + 2.5; z <= CHUNK_LENGTH / 2 - 2.5; z += 4.5) {
      list.push(z);
    }
    return list;
  }, []);

  // Deterministic scenery variants based on chunkIndex
  const leftHouses = useMemo(() => {
    return [
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 0) % SHOPHOUSE_PRESETS.length],
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 1) % SHOPHOUSE_PRESETS.length],
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 2) % SHOPHOUSE_PRESETS.length],
    ];
  }, [chunkIndex]);

  const rightHouses = useMemo(() => {
    return [
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 3) % SHOPHOUSE_PRESETS.length],
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 4) % SHOPHOUSE_PRESETS.length],
      SHOPHOUSE_PRESETS[(chunkIndex * 3 + 5) % SHOPHOUSE_PRESETS.length],
    ];
  }, [chunkIndex]);

  return (
    <group position={position}>
      {/* ===================================================================
          1. ROADWAY (3 LANES: x = -2.5, 0, +2.5)
          =================================================================== */}
      {/* Main Asphalt Roadbed (Width: 8m, Length: 30m) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow material={trackMaterials.asphalt}>
        <planeGeometry args={[8.0, CHUNK_LENGTH]} />
      </mesh>

      {/* Left Lane Divider Dashes (at x = -1.25) */}
      {dashes.map((z, i) => (
        <mesh
          key={`ld-${i}`}
          rotation-x={-Math.PI / 2}
          position={[-LANE_WIDTH / 2, 0.005, z]}
          material={trackMaterials.laneDash}
        >
          <planeGeometry args={[0.15, 2.2]} />
        </mesh>
      ))}

      {/* Right Lane Divider Dashes (at x = +1.25) */}
      {dashes.map((z, i) => (
        <mesh
          key={`rd-${i}`}
          rotation-x={-Math.PI / 2}
          position={[LANE_WIDTH / 2, 0.005, z]}
          material={trackMaterials.laneDash}
        >
          <planeGeometry args={[0.15, 2.2]} />
        </mesh>
      ))}

      {/* Solid White Outer Shoulder Lines */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[-3.85, 0.005, 0]}
        material={trackMaterials.laneDash}
      >
        <planeGeometry args={[0.12, CHUNK_LENGTH]} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[3.85, 0.005, 0]}
        material={trackMaterials.laneDash}
      >
        <planeGeometry args={[0.12, CHUNK_LENGTH]} />
      </mesh>

      {/* ===================================================================
          2. SIDEWALKS & PAINTED CURBS
          =================================================================== */}
      {/* Left Sidewalk Slab */}
      <mesh
        position={[-5.8, 0.1, 0]}
        receiveShadow
        material={trackMaterials.sidewalk}
      >
        <boxGeometry args={[3.6, 0.2, CHUNK_LENGTH]} />
      </mesh>

      {/* Right Sidewalk Slab */}
      <mesh
        position={[5.8, 0.1, 0]}
        receiveShadow
        material={trackMaterials.sidewalk}
      >
        <boxGeometry args={[3.6, 0.2, CHUNK_LENGTH]} />
      </mesh>

      {/* Left Yellow/Black Striped Curb */}
      <mesh position={[-4.0, 0.11, 0]} material={trackMaterials.curbYellow}>
        <boxGeometry args={[0.2, 0.22, CHUNK_LENGTH]} />
      </mesh>

      {/* Right Yellow/Black Striped Curb */}
      <mesh position={[4.0, 0.11, 0]} material={trackMaterials.curbYellow}>
        <boxGeometry args={[0.2, 0.22, CHUNK_LENGTH]} />
      </mesh>

      {/* ===================================================================
          3. SHOPHOUSES (LEFT & RIGHT FLANKS)
          =================================================================== */}
      {/* Left Shophouses (3 buildings along z = -10, 0, +10) */}
      <Shophouse
        width={9.2}
        height={leftHouses[0].height}
        wallColor={leftHouses[0].wallColor}
        signIndex={leftHouses[0].signIndex}
        hasAwning={leftHouses[0].hasAwning}
        position={[-10.2, 0.2, -10]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Shophouse
        width={9.2}
        height={leftHouses[1].height}
        wallColor={leftHouses[1].wallColor}
        signIndex={leftHouses[1].signIndex}
        hasAwning={leftHouses[1].hasAwning}
        position={[-10.2, 0.2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Shophouse
        width={9.2}
        height={leftHouses[2].height}
        wallColor={leftHouses[2].wallColor}
        signIndex={leftHouses[2].signIndex}
        hasAwning={leftHouses[2].hasAwning}
        position={[-10.2, 0.2, 10]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Right Shophouses (3 buildings along z = -10, 0, +10) */}
      <Shophouse
        width={9.2}
        height={rightHouses[0].height}
        wallColor={rightHouses[0].wallColor}
        signIndex={rightHouses[0].signIndex}
        hasAwning={rightHouses[0].hasAwning}
        position={[10.2, 0.2, -10]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Shophouse
        width={9.2}
        height={rightHouses[1].height}
        wallColor={rightHouses[1].wallColor}
        signIndex={rightHouses[1].signIndex}
        hasAwning={rightHouses[1].hasAwning}
        position={[10.2, 0.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Shophouse
        width={9.2}
        height={rightHouses[2].height}
        wallColor={rightHouses[2].wallColor}
        signIndex={rightHouses[2].signIndex}
        hasAwning={rightHouses[2].hasAwning}
        position={[10.2, 0.2, 10]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* ===================================================================
          4. TREES & STREET LAMPS
          =================================================================== */}
      {/* Left Sidewalk Trees & Lamps */}
      <StreetTree position={[-4.7, 0.2, -7.5]} />
      <StreetLamp position={[-4.7, 0.2, 5.0]} pointsTowardsRoad={1} />

      {/* Right Sidewalk Trees & Lamps */}
      <StreetLamp position={[4.7, 0.2, -5.0]} pointsTowardsRoad={-1} />
      <StreetTree position={[4.7, 0.2, 7.5]} />

      {/* ===================================================================
          6. ROAD OBSTACLES (Procedural patterns per chunk)
          =================================================================== */}
      <TrackObstacles chunkIndex={chunkIndex} />

      {/* ===================================================================
          7. COLLECTIBLES & VIETNAMESE POWER-UPS
          =================================================================== */}
      <TrackCollectibles chunkIndex={chunkIndex} />
    </group>
  );
}

export default React.memo(TrackChunk);
