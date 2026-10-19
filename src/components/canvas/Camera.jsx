import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import {
  CAMERA_POSITION,
  CAMERA_LOOK_AT,
  CAMERA_FOV,
  CAMERA_FOV_BOOST,
} from '../../systems/constants.js';

/**
 * Third-person chase camera controller.
 * Features:
 * - Smooth horizontal sway following runner lane changes
 * - Visceral FOV dilation during Cà phê speed rush (60° -> 72°)
 */
export default function Camera() {
  const cameraRef = useRef();

  useLayoutEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(...CAMERA_LOOK_AT);
    }
  }, []);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    const dt = Math.min(delta, 0.1);
    const store = useGameStore.getState();

    // 1. FOV Dilation during Cà phê Speed Rush
    const isCoffeeActive = store.activePowerUps.coffee > 0;
    const targetFov = isCoffeeActive ? CAMERA_FOV_BOOST : CAMERA_FOV;

    if (Math.abs(cameraRef.current.fov - targetFov) > 0.05) {
      cameraRef.current.fov = THREE.MathUtils.damp(
        cameraRef.current.fov,
        targetFov,
        6.0,
        dt
      );
      cameraRef.current.updateProjectionMatrix();
    }

    // 2. Horizontal Camera Sway following player lane
    const playerGroup = state.scene.getObjectByName('player-root');
    const playerX = playerGroup?.position.x ?? 0;
    const targetCamX = playerX * 0.35; // gentle follow

    cameraRef.current.position.x = THREE.MathUtils.damp(
      cameraRef.current.position.x,
      targetCamX,
      5.0,
      dt
    );

    // Keep camera focused on horizon target
    cameraRef.current.lookAt(
      targetCamX * 0.2,
      CAMERA_LOOK_AT[1],
      CAMERA_LOOK_AT[2]
    );
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={CAMERA_POSITION}
      fov={CAMERA_FOV}
      near={0.1}
      far={200}
    />
  );
}
