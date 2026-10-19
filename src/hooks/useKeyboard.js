import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATE } from '../systems/constants.js';

// Key mappings
const KEY_ACTIONS = {
  // Left lane
  KeyA: 'MOVE_LEFT',
  ArrowLeft: 'MOVE_LEFT',

  // Right lane
  KeyD: 'MOVE_RIGHT',
  ArrowRight: 'MOVE_RIGHT',

  // Jump
  KeyW: 'JUMP',
  ArrowUp: 'JUMP',
  Space: 'JUMP',

  // Slide / Fast-fall
  KeyS: 'SLIDE',
  ArrowDown: 'SLIDE',

  // Pause
  KeyP: 'PAUSE',
  Escape: 'PAUSE',

  // Start / Restart
  Enter: 'CONFIRM',
};

// Keys to prevent default browser scroll behavior
const PREVENT_DEFAULT_KEYS = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

// Shared action listeners for component subscriptions
const actionListeners = new Set();

export function subscribeToKeyboardAction(callback) {
  actionListeners.add(callback);
  return () => {
    actionListeners.delete(callback);
  };
}

/**
 * useKeyboard hook
 * Listens to keyboard input and manages single-shot action triggers.
 *
 * @param {Object} callbacks - Optional action callbacks { onMoveLeft, onMoveRight, onJump, onSlide, onPause }
 * @returns {Object} { lastAction, consumeAction, isKeyPressed }
 */
export function useKeyboard(callbacks = {}) {
  const gameState = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);

  // Queue of pending actions
  const pendingActionRef = useRef(null);
  const keysDownRef = useRef(new Set());
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref fresh
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Consumer for game loop (e.g., Player component reading discrete inputs)
  const consumeAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    return action;
  }, []);

  const isKeyPressed = useCallback((code) => {
    return keysDownRef.current.has(code);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default page scroll on arrow keys & Space
      if (PREVENT_DEFAULT_KEYS.has(event.code)) {
        event.preventDefault();
      }

      // Ignore OS key repeats (holding down key should not repeatedly switch lanes)
      if (event.repeat) {
        return;
      }

      keysDownRef.current.add(event.code);

      const action = KEY_ACTIONS[event.code];
      if (!action) return;

      const currentGameState = useGameStore.getState().gameState;

      // Handle Menu / Game Over confirmation to start or replay
      if (
        (currentGameState === GAME_STATE.MENU || currentGameState === GAME_STATE.GAME_OVER) &&
        (action === 'JUMP' || action === 'CONFIRM')
      ) {
        startGame();
        return;
      }

      // Handle Pause
      if (action === 'PAUSE') {
        pauseGame();
        callbacksRef.current.onPause?.();
        return;
      }

      // Gameplay movement actions (only active during PLAYING)
      if (currentGameState === GAME_STATE.PLAYING) {
        pendingActionRef.current = action;

        // Broadcast to component listeners
        actionListeners.forEach((listener) => {
          try {
            listener(action);
          } catch (err) {
            console.error('Error in keyboard action listener:', err);
          }
        });

        switch (action) {
          case 'MOVE_LEFT':
            callbacksRef.current.onMoveLeft?.();
            break;
          case 'MOVE_RIGHT':
            callbacksRef.current.onMoveRight?.();
            break;
          case 'JUMP':
            callbacksRef.current.onJump?.();
            break;
          case 'SLIDE':
            callbacksRef.current.onSlide?.();
            break;
          default:
            break;
        }
      }
    };

    const handleKeyUp = (event) => {
      keysDownRef.current.delete(event.code);
    };

    const handleBlur = () => {
      // Clear all keys when window loses focus to prevent stuck keys
      keysDownRef.current.clear();
      pendingActionRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [startGame, pauseGame]);

  return {
    consumeAction,
    isKeyPressed,
    lastActionRef: pendingActionRef,
  };
}
