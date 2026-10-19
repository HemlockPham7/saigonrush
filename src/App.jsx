import GameCanvas from './components/canvas/GameCanvas.jsx';
import { useGameStore } from './store/useGameStore.js';
import { useKeyboard } from './hooks/useKeyboard.js';
import { GAME_STATE } from './systems/constants.js';
import StartMenu from './components/ui/StartMenu.jsx';
import HUD from './components/ui/HUD.jsx';
import GameOver from './components/ui/GameOver.jsx';
import PauseModal from './components/ui/PauseModal.jsx';
import './components/ui/UIOverlay.css';

/**
 * Layout wrapper: a letterboxed 16:9 stage holding the R3F canvas
 * with the reactive 2D DOM UI layer stacked on top.
 */
export default function App() {
  const gameState = useGameStore((state) => state.gameState);

  // Initialize keyboard input listener globally
  useKeyboard();

  return (
    <main className="app-shell">
      <h1 className="visually-hidden">Saigon Rush - Trò Chơi Chạy Vô Tận Đường Phố Sài Gòn</h1>
      <section className="game-stage" id="game-stage" aria-label="Saigon Rush game">
        {/* 3D WebGL Canvas */}
        <GameCanvas />

        {/* 2D Overlay Layer */}
        <div className="ui-layer" id="ui-layer">
          {gameState === GAME_STATE.MENU && <StartMenu />}
          {gameState === GAME_STATE.PLAYING && <HUD />}
          {gameState === GAME_STATE.PAUSED && (
            <>
              <HUD />
              <PauseModal />
            </>
          )}
          {gameState === GAME_STATE.GAME_OVER && <GameOver />}
        </div>
      </section>
    </main>
  );
}

