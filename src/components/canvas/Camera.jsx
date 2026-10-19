import { useLayoutEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

// Values from TECH_ARCHITECTURE.md §4.2 (moved to systems/constants.js in Phase 2)
const CAMERA_POSITION = [0, 3.8, 6.5];
const CAMERA_LOOK_AT = [0, 1.4, -4.0];
const CAMERA_FOV = 60;

/**
 * Third-person chase camera. Static in Phase 1; lane-follow sway,
 * FOV dilation (cà phê rush) and screen shake are added in later phases.
 */
export default function Camera() {
  const cameraRef = useRef();

  useLayoutEffect(() => {
    cameraRef.current.lookAt(...CAMERA_LOOK_AT);
  }, []);

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
