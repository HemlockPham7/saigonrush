import { useLayoutEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

import {
  CAMERA_POSITION,
  CAMERA_LOOK_AT,
  CAMERA_FOV,
} from '../../systems/constants.js';

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
