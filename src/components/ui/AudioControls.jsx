import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';

/**
 * AudioControls Component
 * Audio mute/unmute toggle button with SVG icons and local storage persistence.
 * Also listens to 'KeyM' globally.
 */
export default function AudioControls({ className = '' }) {
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleMute = useGameStore((state) => state.toggleMute);

  // Global 'M' shortcut for audio mute toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyM' && !e.repeat) {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  return (
    <button
      type="button"
      className={`sr-icon-btn ${className}`}
      onClick={toggleMute}
      title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
      aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
    >
      {isMuted ? (
        /* Muted Icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        /* Speaker On Icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
