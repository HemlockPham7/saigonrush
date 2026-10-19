import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';

/**
 * GameOver Modal Component
 * Displays run summary statistics, new record celebration,
 * and quick restart or main menu navigation.
 */
export default function GameOver() {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => state.distance);
  const coins = useGameStore((state) => state.coins);
  const startGame = useGameStore((state) => state.startGame);
  const resetToMenu = useGameStore((state) => state.resetToMenu);

  const isNewRecord = score >= highScore && score > 0;

  // Space or Enter to restart run quickly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame]);

  return (
    <div className="sr-modal-backdrop" id="game-over-modal">
      <div className="sr-modal-card sr-gameover-card">
        <h2 className="sr-gameover-title">GAME OVER</h2>

        {isNewRecord && (
          <div className="sr-new-record-badge">
            <span>🎉</span>
            <span>KỶ LỤC MỚI! NEW HIGH SCORE!</span>
            <span>🎉</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="sr-stats-grid">
          <div className="sr-stat-box">
            <span className="sr-stat-label">Điểm Số (Score)</span>
            <span className="sr-stat-val sr-stat-val--highlight">{score.toLocaleString()}</span>
          </div>

          <div className="sr-stat-box">
            <span className="sr-stat-label">Kỷ Lục (Best)</span>
            <span className="sr-stat-val">{highScore.toLocaleString()}</span>
          </div>

          <div className="sr-stat-box">
            <span className="sr-stat-label">Khoảng Cách</span>
            <span className="sr-stat-val">{Math.floor(distance)} m</span>
          </div>

          <div className="sr-stat-box">
            <span className="sr-stat-label">Tiền Vàng</span>
            <span className="sr-stat-val">{coins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sr-modal-actions">
          <button
            type="button"
            className="sr-btn sr-btn--primary"
            id="btn-play-again"
            onClick={startGame}
          >
            CHƠI LẠI (SPACE)
          </button>
          <button
            type="button"
            className="sr-btn sr-btn--secondary"
            id="btn-main-menu"
            onClick={resetToMenu}
          >
            MENU CHÍNH
          </button>
        </div>
      </div>
    </div>
  );
}
