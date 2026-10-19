import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import AudioControls from './AudioControls.jsx';

/**
 * HUD Component
 * In-game heads-up display showing real-time score, distance,
 * coin count, speed, and active power-up countdown rings/bars.
 */
export default function HUD() {
  const score = useGameStore((state) => state.score);
  const coins = useGameStore((state) => state.coins);
  const distance = useGameStore((state) => state.distance);
  const speed = useGameStore((state) => state.speed);
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const pauseGame = useGameStore((state) => state.pauseGame);

  const isMultiplierActive = activePowerUps.multiplier > 0;
  const isCoffeeActive = activePowerUps.coffee > 0;
  const isShieldActive = activePowerUps.shield;
  const isMagnetActive = activePowerUps.magnet > 0;

  return (
    <div className="sr-hud" id="game-hud">
      {/* Top Bar: Score & Coins */}
      <div className="sr-hud-top">
        {/* Top-Left: Score, Multiplier, Distance & Speed */}
        <div className="sr-hud-score-card">
          <div className="sr-score-row">
            <span className="sr-score-value">{score.toLocaleString()}</span>
            {isMultiplierActive && (
              <span className="sr-multiplier-badge">2X SCORE</span>
            )}
          </div>
          <div className="sr-distance-row">
            <span className="sr-distance-tag">{Math.floor(distance)} m</span>
            <span>·</span>
            <span>{Math.round(speed * 3.6)} km/h</span>
          </div>
        </div>

        {/* Top-Right: Coins, Pause, Audio */}
        <div className="sr-hud-top-right">
          <div className="sr-coin-pill">
            <svg className="sr-coin-icon" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#ffd166" stroke="#f4a261" strokeWidth="2" />
              <polygon points="16,6 19,13 26,13 20,18 22,25 16,21 10,25 12,18 6,13 13,13" fill="#ffffff" />
            </svg>
            <span className="sr-coin-count">{coins}</span>
          </div>

          <button
            type="button"
            className="sr-icon-btn"
            onClick={pauseGame}
            title="Pause (P or Esc)"
            aria-label="Pause Game"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>

          <AudioControls />
        </div>
      </div>

      {/* Bottom Row: Active Power-Ups Badges */}
      <div className="sr-hud-bottom">
        {isCoffeeActive && (
          <div className="sr-powerup-badge sr-powerup-badge--coffee">
            <span className="sr-powerup-icon">☕</span>
            <div className="sr-powerup-info">
              <span className="sr-powerup-name">Cà phê</span>
              <span className="sr-powerup-timer">{Math.ceil(activePowerUps.coffee)}s</span>
            </div>
          </div>
        )}

        {isShieldActive && (
          <div className="sr-powerup-badge sr-powerup-badge--shield">
            <span className="sr-powerup-icon">👒</span>
            <div className="sr-powerup-info">
              <span className="sr-powerup-name">Nón lá</span>
              <span className="sr-powerup-timer">1 HIT</span>
            </div>
          </div>
        )}

        {isMagnetActive && (
          <div className="sr-powerup-badge sr-powerup-badge--magnet">
            <span className="sr-powerup-icon">🥖</span>
            <div className="sr-powerup-info">
              <span className="sr-powerup-name">Bánh mì</span>
              <span className="sr-powerup-timer">{Math.ceil(activePowerUps.magnet)}s</span>
            </div>
          </div>
        )}

        {isMultiplierActive && (
          <div className="sr-powerup-badge sr-powerup-badge--multiplier">
            <span className="sr-powerup-icon">🍵</span>
            <div className="sr-powerup-info">
              <span className="sr-powerup-name">Trà đá</span>
              <span className="sr-powerup-timer">{Math.ceil(activePowerUps.multiplier)}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
