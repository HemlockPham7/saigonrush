import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore.js';
import { GAME_STATE } from '../../../systems/constants.js';
import ModelLoader from '../ModelLoader.jsx';
import { MODEL_PATHS, USE_GLTF_MODELS } from '../modelRegistry.js';
import ProceduralMotorbike from '../fallbacks/ProceduralMotorbike.jsx';

/**
 * Motorbike Obstacle (Xe máy)
 * Modeled after iconic Saigon Honda Wave/Cub motorbikes.
 * Renders GLB model when available or falls back to procedural meshes.
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

  // Wheel spin animation for moving motorbikes (when procedural fallback is active)
  useFrame((state, delta) => {
    if (isMoving && useGameStore.getState().gameState === GAME_STATE.PLAYING) {
      const spin = delta * 18.0;
      if (frontWheelRef.current) frontWheelRef.current.rotation.x += spin;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x += spin;
    }
  });

  return (
    <group ref={bikeRef} position={position} name="obstacle-motorbike">
      <ModelLoader
        url={MODEL_PATHS.motorbike}
        enabled={USE_GLTF_MODELS.motorbike}
        scale={1}
        fallback={
          <ProceduralMotorbike
            color={color}
            hasCargo={hasCargo}
            frontWheelRef={frontWheelRef}
            rearWheelRef={rearWheelRef}
          />
        }
      />
    </group>
  );
}

export default React.memo(Motorbike);
