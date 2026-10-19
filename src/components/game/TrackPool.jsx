import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import TrackChunk from './TrackChunk.jsx';
import { useGameStore } from '../../store/useGameStore.js';
import {
  CHUNK_LENGTH,
  CHUNK_COUNT,
  DESPAWN_Z,
  GAME_STATE,
  BASE_SPEED,
} from '../../systems/constants.js';
import { resetHitStates } from '../../systems/CollisionSystem.js';

// Number of chunks in the pool (6 chunks * 30m = 180m view distance)
const POOL_SIZE = 6;

/**
 * TrackPool component
 * Manages an infinite streaming object pool of 30-meter track chunks.
 * Recycles chunks seamlessly as the world moves forward at game speed.
 */
export default function TrackPool() {
  const gameState = useGameStore((state) => state.gameState);
  const addDistance = useGameStore((state) => state.addDistance);

  // Chunk group refs for direct 60 FPS matrix updates without React re-renders
  const chunkRefs = useRef([]);

  // Mutable chunk simulation data
  const poolState = useRef(
    Array.from({ length: POOL_SIZE }, (_, i) => ({
      z: -i * CHUNK_LENGTH,
      chunkIndex: i,
    }))
  );

  // Force re-render only when chunkIndex changes for a recycled chunk
  const [chunkVariants, setChunkVariants] = useState(() =>
    Array.from({ length: POOL_SIZE }, (_, i) => i)
  );

  // Track chunk recycling counter
  const nextVariantIndex = useRef(POOL_SIZE);

  // Reset track pool when starting a fresh game or returning to menu
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.MENU) {
      // Check if pool is not in initial alignment
      if (useGameStore.getState().distance === 0) {
        for (let i = 0; i < POOL_SIZE; i++) {
          poolState.current[i].z = -i * CHUNK_LENGTH;
          poolState.current[i].chunkIndex = i;
          if (chunkRefs.current[i]) {
            chunkRefs.current[i].position.z = -i * CHUNK_LENGTH;
          }
        }
        nextVariantIndex.current = POOL_SIZE;
        setChunkVariants(Array.from({ length: POOL_SIZE }, (_, i) => i));
        resetHitStates();
      }
    }
  }, [gameState]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const currentState = useGameStore.getState().gameState;

    // Determine forward speed
    let currentSpeed = 0;
    if (currentState === GAME_STATE.PLAYING) {
      const baseSpd = useGameStore.getState().speed || BASE_SPEED;
      const coffeeActive = useGameStore.getState().activePowerUps.coffee > 0;
      currentSpeed = baseSpd * (coffeeActive ? 1.4 : 1.0);

      // Decrement power-up timers
      useGameStore.getState().tickPowerUps(dt);

      // Progress distance and score
      addDistance(currentSpeed * dt);
    } else if (currentState === GAME_STATE.MENU) {
      // Gentle ambient drift on title screen
      currentSpeed = 4.0;
    }

    if (currentSpeed <= 0) return;

    const moveZ = currentSpeed * dt;
    let needsVariantUpdate = false;
    const nextVariants = [...chunkVariants];

    // 1. Move all chunks forward (positive Z)
    for (let i = 0; i < POOL_SIZE; i++) {
      poolState.current[i].z += moveZ;

      // 2. Check if chunk has passed behind player camera
      if (poolState.current[i].z > DESPAWN_Z) {
        // Find the farthest chunk ahead (minimum Z)
        let minZ = 0;
        for (let j = 0; j < POOL_SIZE; j++) {
          if (poolState.current[j].z < minZ) {
            minZ = poolState.current[j].z;
          }
        }

        // Reposition at the front of the queue
        poolState.current[i].z = minZ - CHUNK_LENGTH;

        // Assign next procedural scenery variant
        const nextIdx = nextVariantIndex.current++;
        poolState.current[i].chunkIndex = nextIdx;
        nextVariants[i] = nextIdx;
        needsVariantUpdate = true;
      }

      // Apply Z position directly to Three.js Object3D
      if (chunkRefs.current[i]) {
        chunkRefs.current[i].position.z = poolState.current[i].z;
      }
    }

    if (needsVariantUpdate) {
      setChunkVariants(nextVariants);
    }
  });

  return (
    <group name="track-pool">
      {poolState.current.map((item, i) => (
        <group
          key={`chunk-group-${i}`}
          ref={(el) => (chunkRefs.current[i] = el)}
          position={[0, 0, item.z]}
        >
          <TrackChunk chunkIndex={chunkVariants[i]} />
        </group>
      ))}
    </group>
  );
}
