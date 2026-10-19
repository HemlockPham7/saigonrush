import Camera from './Camera.jsx';
import Lighting from './Lighting.jsx';
import Player from '../game/Player.jsx';
import { LANE_WIDTH } from '../../systems/constants.js';

/**
 * Temporary 3-lane ground plane to verify lane alignment and shadow casting
 * until dynamic TrackChunks arrive in Phase 4.
 */
function TestGround() {
  return (
    <group position={[0, 0, -40]}>
      {/* Asphalt roadbed */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 140]} />
        <meshStandardMaterial color="#2d2b33" roughness={0.9} />
      </mesh>

      {/* Lane divider 1 (Left / Center) at x = -LANE_WIDTH / 2 */}
      <mesh rotation-x={-Math.PI / 2} position={[-LANE_WIDTH / 2, 0, 0]}>
        <planeGeometry args={[0.12, 140]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>

      {/* Lane divider 2 (Center / Right) at x = +LANE_WIDTH / 2 */}
      <mesh rotation-x={-Math.PI / 2} position={[LANE_WIDTH / 2, 0, 0]}>
        <planeGeometry args={[0.12, 140]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>

      {/* Sidewalk curbs */}
      <mesh rotation-x={-Math.PI / 2} position={[-4.5, 0.05, 0]} receiveShadow>
        <planeGeometry args={[1.5, 140]} />
        <meshStandardMaterial color="#8a877d" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[4.5, 0.05, 0]} receiveShadow>
        <planeGeometry args={[1.5, 140]} />
        <meshStandardMaterial color="#8a877d" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Main 3D scene holding the game subsystems.
 */
export default function GameScene() {
  return (
    <>
      <Camera />
      <Lighting />
      <TestGround />
      <Player />
    </>
  );
}
