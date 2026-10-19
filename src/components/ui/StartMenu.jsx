import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import AudioControls from './AudioControls.jsx';

/**
 * StartMenu Component (Title Screen)
 * Displays vibrant Cyberpunk-Saigon branding, all-time high score,
 * keyboard controls guide, Vietnamese power-up lore, and Play action.
 */
export default function StartMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const highScore = useGameStore((state) => state.highScore);

  return (
    <div className="sr-start-menu" id="start-menu">
      {/* Top Bar with High Score & Audio */}
      <header className="sr-start-header">
        <div className="sr-highscore-badge">
          <span>🏆 KỶ LỤC:</span>
          <span>{highScore.toLocaleString()} PTS</span>
        </div>
        <AudioControls />
      </header>

      {/* Main Title Block */}
      <div className="sr-title-block">
        <svg className="sr-star-emblem" viewBox="0 0 100 100" fill="none">
          <polygon
            points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
            fill="#ffd166"
            stroke="#da291c"
            strokeWidth="3"
          />
        </svg>
        <h1 className="sr-main-title">SAIGON RUSH</h1>
        <p className="sr-sub-title">ĐƯỜNG PHỐ SÀI GÒN · ENDLESS RUNNER</p>
      </div>

      {/* Controls Guide Preview */}
      <div className="sr-controls-guide" aria-label="Keyboard controls">
        <div className="sr-control-item">
          <span className="sr-keycap">A</span>
          <span className="sr-keycap">D</span>
          <span className="sr-control-desc">Chuyển Làn</span>
        </div>
        <div className="sr-control-item">
          <span className="sr-keycap">W</span>
          <span className="sr-keycap">Space</span>
          <span className="sr-control-desc">Nhảy</span>
        </div>
        <div className="sr-control-item">
          <span className="sr-keycap">S</span>
          <span className="sr-control-desc">Trượt / Hạ Nhanh</span>
        </div>
        <div className="sr-control-item">
          <span className="sr-keycap">P</span>
          <span className="sr-control-desc">Tạm Dừng</span>
        </div>
      </div>

      {/* Vietnamese Power-Ups Legend */}
      <div className="sr-powerup-legend" aria-label="Vietnamese Power-ups">
        <span className="sr-legend-item">☕ Cà phê (Tốc độ & Húc đổ)</span>
        <span className="sr-legend-item">👒 Nón lá (Khiên đỡ 1 đòn)</span>
        <span className="sr-legend-item">🥖 Bánh mì (Hút xu)</span>
        <span className="sr-legend-item">🍵 Trà đá (Nhân đôi 2X điểm)</span>
      </div>

      {/* Primary Action Button */}
      <div className="sr-start-action">
        <button
          type="button"
          className="sr-btn sr-btn--primary"
          id="btn-start-run"
          onClick={startGame}
        >
          CHẠY NGAY (PLAY)
        </button>
        <span className="sr-play-prompt">NHẤN [SPACE] HOẶC CLICK ĐỂ BẮT ĐẦU</span>
      </div>
    </div>
  );
}
