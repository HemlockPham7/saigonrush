import Camera from './Camera.jsx';
import Lighting from './Lighting.jsx';
import TrackPool from '../game/TrackPool.jsx';
import Player from '../game/Player.jsx';

/**
 * Main 3D scene holding the game subsystems.
 * Renders camera, lighting, the streaming TrackPool, and the player.
 */
export default function GameScene() {
  return (
    <>
      <Camera />
      <Lighting />
      <TrackPool />
      <Player />
    </>
  );
}
