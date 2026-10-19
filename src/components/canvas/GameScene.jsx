import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Camera from './Camera.jsx';
import Lighting from './Lighting.jsx';

/**
 * Phase 1 placeholder: a floating nón lá (conical hat) at the player origin,
 * used to verify camera framing, lighting and shadow casting.
 * Replaced by the Player / Track systems in Phases 3–4.
 */
function TestNonLa() {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.8;
    ref.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });

  return (
    <group ref={ref} position={[0, 1.2, 0]}>
      {/* hat cone */}
      <mesh castShadow>
        <coneGeometry args={[0.9, 0.55, 48, 1, true]} />
        <meshStandardMaterial color="#f2d27a" roughness={0.75} side={2} />
      </mesh>
      {/* red rim band */}
      <mesh position={[0, -0.27, 0]} rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[0.88, 0.025, 8, 64]} />
        <meshStandardMaterial color="#da291c" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Temporary ground so shadows have something to land on (Phase 4 adds real track chunks). */
function TestGround() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]} receiveShadow>
      <planeGeometry args={[9, 120]} />
      <meshStandardMaterial color="#3b3a40" roughness={0.95} />
    </mesh>
  );
}

/** Main 3D scene holding the game subsystems. */
export default function GameScene() {
  return (
    <>
      <Camera />
      <Lighting />
      <TestGround />
      <TestNonLa />
    </>
  );
}
