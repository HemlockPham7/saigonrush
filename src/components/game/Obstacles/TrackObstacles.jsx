import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LowBarrier from './LowBarrier.jsx';
import OverheadWires from './OverheadWires.jsx';
import Motorbike from './Motorbike.jsx';
import FoodCart from './FoodCart.jsx';
import SaigonBus from './SaigonBus.jsx';
import { LANES, LANE_VALUES, GAME_STATE } from '../../../systems/constants.js';
import {
  registerObstacle,
  updateObstacleBox,
  unregisterObstacle,
} from '../../../systems/CollisionSystem.js';
import { useGameStore } from '../../../store/useGameStore.js';

// Pre-allocated vectors & boxes for zero-allocation useFrame updates
const _tempWorldPos = new THREE.Vector3();
const _tempBox = new THREE.Box3();

// Preset patterns for deterministic, balanced generation (at least 1 safe path always guaranteed!)
const OBSTACLE_PATTERNS = [
  // Pattern 0: Low Stools in Left, Motorbike in Right (Center is safe)
  [
    { type: 'low', lane: 0, zOffset: -7.5, variant: 0, size: [1.1, 0.6, 0.7], yOffset: 0.3 },
    { type: 'motorbike', lane: 2, zOffset: 7.5, isMoving: true, size: [0.8, 1.3, 1.6], yOffset: 0.65 },
  ],
  // Pattern 1: Overhead Wires in Center (slide under), Food Cart in Left (Right is open)
  [
    { type: 'overhead', lane: 1, zOffset: -6.0, variant: 0, size: [2.0, 1.2, 0.6], yOffset: 1.6 },
    { type: 'foodcart', lane: 0, zOffset: 8.0, size: [1.0, 1.8, 1.5], yOffset: 0.9 },
  ],
  // Pattern 2: Saigon Bus with Ramp in Right, Low Barrier in Center (Left is open)
  [
    { type: 'bus', lane: 2, zOffset: -3.0, hasRamp: true, size: [2.0, 2.4, 8.5], yOffset: 1.2 },
    { type: 'low', lane: 1, zOffset: 8.5, variant: 1, size: [1.1, 0.6, 0.7], yOffset: 0.3 },
  ],
  // Pattern 3: Motorbike in Center, Overhead Awning in Left (slide under, Right is open)
  [
    { type: 'motorbike', lane: 1, zOffset: -7.0, isMoving: false, size: [0.8, 1.3, 1.6], yOffset: 0.65 },
    { type: 'overhead', lane: 0, zOffset: 7.5, variant: 1, size: [2.0, 1.2, 0.6], yOffset: 1.6 },
  ],
  // Pattern 4: Food Cart in Center, Low Barrier in Right (Left is open)
  [
    { type: 'foodcart', lane: 1, zOffset: -6.5, size: [1.0, 1.8, 1.5], yOffset: 0.9 },
    { type: 'low', lane: 2, zOffset: 7.5, variant: 2, size: [1.1, 0.6, 0.7], yOffset: 0.3 },
  ],
  // Pattern 5: Saigon Bus with Ramp in Left, Motorbike in Center (Right is open)
  [
    { type: 'bus', lane: 0, zOffset: -4.0, hasRamp: true, size: [2.0, 2.4, 8.5], yOffset: 1.2 },
    { type: 'motorbike', lane: 1, zOffset: 7.0, isMoving: true, size: [0.8, 1.3, 1.6], yOffset: 0.65 },
  ],
];

/**
 * TrackObstacles component
 * Renders the obstacle set for a specific track chunk and registers their
 * 3D bounding boxes into the CollisionSystem.
 */
function TrackObstacles({ chunkIndex = 0 }) {
  const obstacleGroupRefs = useRef([]);
  const movingOffsetsRef = useRef([]);

  // First chunk has no obstacles so the runner begins with an open track
  const pattern =
    chunkIndex === 0
      ? []
      : OBSTACLE_PATTERNS[(chunkIndex - 1) % OBSTACLE_PATTERNS.length];

  // Register obstacles in CollisionSystem
  useEffect(() => {
    const ids = [];
    movingOffsetsRef.current = pattern.map(() => 0);

    pattern.forEach((obs, idx) => {
      const id = `chunk-${chunkIndex}-obs-${idx}`;
      ids.push(id);

      const laneX = LANE_VALUES[obs.lane];
      const yPos = obs.yOffset || obs.size[1] / 2;
      const initialPos = new THREE.Vector3(laneX, yPos, obs.zOffset);

      const hx = obs.size[0] / 2;
      const hy = obs.size[1] / 2;
      const hz = obs.size[2] / 2;
      const initialBox = new THREE.Box3(
        new THREE.Vector3(laneX - hx, yPos - hy, obs.zOffset - hz),
        new THREE.Vector3(laneX + hx, yPos + hy, obs.zOffset + hz)
      );

      registerObstacle(id, {
        id,
        type: obs.type,
        laneIndex: obs.lane,
        hasRamp: obs.hasRamp || false,
        size: obs.size,
        box: initialBox,
        position: initialPos,
        isHit: false,
      });
    });

    return () => {
      ids.forEach((id) => unregisterObstacle(id));
    };
  }, [chunkIndex, pattern]);

  // Update world bounding boxes every frame as the chunk moves
  useFrame((_, delta) => {
    const isPlaying = useGameStore.getState().gameState === GAME_STATE.PLAYING;

    pattern.forEach((obs, idx) => {
      const group = obstacleGroupRefs.current[idx];
      if (!group) return;

      // Advance moving motorbikes along Z
      if (obs.isMoving && isPlaying) {
        movingOffsetsRef.current[idx] = (movingOffsetsRef.current[idx] || 0) + 5.0 * delta;
        group.position.z = obs.zOffset + movingOffsetsRef.current[idx];
      }

      const id = `chunk-${chunkIndex}-obs-${idx}`;
      group.updateWorldMatrix(true, false);
      group.getWorldPosition(_tempWorldPos);

      // Adjust box center based on obstacle type
      const yCenter = obs.yOffset || obs.size[1] / 2;
      _tempWorldPos.y = yCenter;

      const hx = obs.size[0] / 2;
      const hy = obs.size[1] / 2;
      const hz = obs.size[2] / 2;

      _tempBox.min.set(_tempWorldPos.x - hx, _tempWorldPos.y - hy, _tempWorldPos.z - hz);
      _tempBox.max.set(_tempWorldPos.x + hx, _tempWorldPos.y + hy, _tempWorldPos.z + hz);

      updateObstacleBox(id, _tempBox, _tempWorldPos, obs);
    });
  });

  if (pattern.length === 0) return null;

  return (
    <group name="chunk-obstacles">
      {pattern.map((obs, idx) => {
        const laneX = LANE_VALUES[obs.lane];
        const pos = [laneX, 0, obs.zOffset];

        return (
          <group
            key={`obs-${chunkIndex}-${idx}`}
            ref={(el) => (obstacleGroupRefs.current[idx] = el)}
            position={pos}
          >
            {obs.type === 'low' && <LowBarrier variant={obs.variant} />}
            {obs.type === 'overhead' && <OverheadWires variant={obs.variant} />}
            {obs.type === 'motorbike' && <Motorbike isMoving={obs.isMoving} />}
            {obs.type === 'foodcart' && <FoodCart />}
            {obs.type === 'bus' && <SaigonBus hasRamp={obs.hasRamp} />}
          </group>
        );
      })}
    </group>
  );
}

export default React.memo(TrackObstacles);
