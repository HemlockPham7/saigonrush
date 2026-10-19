import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATE } from '../systems/constants.js';
import { soundSystem } from '../systems/SoundSystem.js';

/**
 * useAudio Hook
 * Manages background music lifecycle, user gesture audio unlocking,
 * and mute synchronization with the global game store.
 */
export function useAudio() {
  const gameState = useGameStore((state) => state.gameState);
  const isMuted = useGameStore((state) => state.isMuted);

  // 1. Unlock AudioContext on first user interaction
  useEffect(() => {
    const handleGesture = () => {
      soundSystem.unlock();
    };

    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // 2. Synchronize Mute status
  useEffect(() => {
    soundSystem.setMuted(isMuted);
  }, [isMuted]);

  // 3. Drive Background Music based on Game Flow
  useEffect(() => {
    switch (gameState) {
      case GAME_STATE.PLAYING:
        soundSystem.startMusic();
        break;

      case GAME_STATE.PAUSED:
        soundSystem.pauseMusic();
        break;

      case GAME_STATE.GAME_OVER:
        soundSystem.stopMusic();
        break;

      case GAME_STATE.MENU:
        soundSystem.stopMusic();
        break;

      default:
        break;
    }
  }, [gameState]);

  return soundSystem;
}
