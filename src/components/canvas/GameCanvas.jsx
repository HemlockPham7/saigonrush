import { Canvas } from '@react-three/fiber';
import GameScene from './GameScene.jsx';

/**
 * Top-level R3F Canvas and WebGL renderer settings.
 * - shadows="percentage": soft PCF shadows without the PCFSoft deprecation warning
 * - dpr clamped to [1, 1.5] to avoid rendering huge buffers on high-DPI screens
 */
export default function GameCanvas() {
  return (
    <Canvas
      id="game-canvas"
      shadows="percentage"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <GameScene />
    </Canvas>
  );
}
