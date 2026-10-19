import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import AudioControls from './AudioControls.jsx';

/**
 * PauseModal Component
 * Suspends game loop when paused via P or Escape and displays
 * resume, restart, main menu, and audio preference toggles.
 */
export default function PauseModal() {
  const resumeGame = useGameStore((state) => state.resumeGame);
  const startGame = useGameStore((state) => state.startGame);
  const resetToMenu = useGameStore((state) => state.resetToMenu);

  return (
    <div className="sr-modal-backdrop" id="pause-modal">
      <div className="sr-modal-card sr-pause-card">
        <h2 className="sr-pause-title">TẠM DỪNG (PAUSED)</h2>
        <p style={{ color: 'var(--sr-text-dim)', fontSize: '13px' }}>
          Nhấn [P] hoặc [ESC] để tiếp tục chơi
        </p>

        {/* Audio Toggle Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Âm thanh:</span>
          <AudioControls />
        </div>

        {/* Actions */}
        <div className="sr-modal-actions" style={{ flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="sr-btn sr-btn--primary"
            id="btn-resume"
            onClick={resumeGame}
          >
            TIẾP TỤC (RESUME)
          </button>
          <button
            type="button"
            className="sr-btn sr-btn--secondary"
            id="btn-restart-pause"
            onClick={startGame}
          >
            CHƠI LẠI (RESTART)
          </button>
          <button
            type="button"
            className="sr-btn sr-btn--secondary"
            id="btn-menu-pause"
            onClick={resetToMenu}
          >
            MENU CHÍNH (MAIN MENU)
          </button>
        </div>
      </div>
    </div>
  );
}
