import { create } from 'zustand';
import {
  GAME_STATE,
  BASE_SPEED,
  MAX_SPEED,
  SPEED_INCREMENT,
  SPEED_INCREMENT_INTERVAL,
  POWERUP_CONFIG,
  COIN_SCORE_BASE,
  STORAGE_KEYS,
} from '../systems/constants.js';

// Helper to safely read from localStorage
const getStoredNumber = (key, fallback = 0) => {
  try {
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) || fallback : fallback;
  } catch {
    return fallback;
  }
};

const getStoredBoolean = (key, fallback = false) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val === 'true' : fallback;
  } catch {
    return fallback;
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore private browsing quota errors
  }
};

import { resetHitStates } from '../systems/CollisionSystem.js';

export const useGameStore = create((set, get) => ({
  // Game Flow State
  gameState: GAME_STATE.MENU,

  // Real-time Metrics
  score: 0,
  highScore: getStoredNumber(STORAGE_KEYS.HIGH_SCORE, 0),
  coins: 0,
  distance: 0,
  speed: BASE_SPEED,

  // Active Power-Ups
  activePowerUps: {
    coffee: 0, // seconds remaining
    shield: false, // active boolean
    magnet: 0, // seconds remaining
    multiplier: 0, // seconds remaining
  },

  // Audio / Settings
  isMuted: getStoredBoolean(STORAGE_KEYS.MUTED, false),

  // Actions
  startGame: () => {
    resetHitStates();
    set({
      gameState: GAME_STATE.PLAYING,
      score: 0,
      coins: 0,
      distance: 0,
      speed: BASE_SPEED,
      activePowerUps: {
        coffee: 0,
        shield: false,
        magnet: 0,
        multiplier: 0,
      },
    });
  },

  pauseGame: () => {
    set((state) => {
      if (state.gameState === GAME_STATE.PLAYING) {
        return { gameState: GAME_STATE.PAUSED };
      }
      if (state.gameState === GAME_STATE.PAUSED) {
        return { gameState: GAME_STATE.PLAYING };
      }
      return state;
    });
  },

  resumeGame: () => {
    set((state) => (state.gameState === GAME_STATE.PAUSED ? { gameState: GAME_STATE.PLAYING } : state));
  },

  gameOver: () => {
    const { score, highScore } = get();
    const newHigh = Math.max(score, highScore);
    safeSetStorage(STORAGE_KEYS.HIGH_SCORE, newHigh);

    set({
      gameState: GAME_STATE.GAME_OVER,
      highScore: newHigh,
    });
  },

  resetToMenu: () => {
    resetHitStates();
    set({
      gameState: GAME_STATE.MENU,
      score: 0,
      coins: 0,
      distance: 0,
      speed: BASE_SPEED,
      activePowerUps: {
        coffee: 0,
        shield: false,
        magnet: 0,
        multiplier: 0,
      },
    });
  },

  // Coin Collection (+1 coin, adds score with active multiplier)
  addCoin: (amount = 1) => {
    set((state) => {
      const isMultiplierActive = state.activePowerUps.multiplier > 0;
      const multiplierFactor = isMultiplierActive ? POWERUP_CONFIG.multiplier.multiplier : 1;
      const addedScore = COIN_SCORE_BASE * amount * multiplierFactor;

      return {
        coins: state.coins + amount,
        score: state.score + addedScore,
      };
    });
  },

  // Distance & Speed Progression
  addDistance: (deltaMeters) => {
    set((state) => {
      if (state.gameState !== GAME_STATE.PLAYING) return state;

      const newDistance = state.distance + deltaMeters;
      const isMultiplierActive = state.activePowerUps.multiplier > 0;
      const multiplierFactor = isMultiplierActive ? POWERUP_CONFIG.multiplier.multiplier : 1;
      
      // Score adds 1 point per meter run (multiplied if active)
      const newScore = state.score + Math.round(deltaMeters * multiplierFactor);

      // Speed increases every 100 meters
      const speedIncrements = Math.floor(newDistance / SPEED_INCREMENT_INTERVAL);
      const calculatedSpeed = Math.min(
        MAX_SPEED,
        BASE_SPEED + speedIncrements * SPEED_INCREMENT
      );

      return {
        distance: newDistance,
        score: newScore,
        speed: calculatedSpeed,
      };
    });
  },

  // Power-Up Management
  activatePowerUp: (type, duration = null) => {
    set((state) => {
      const nextPowerUps = { ...state.activePowerUps };

      switch (type) {
        case 'coffee':
          nextPowerUps.coffee = duration ?? POWERUP_CONFIG.coffee.duration;
          break;
        case 'shield':
          nextPowerUps.shield = true;
          break;
        case 'magnet':
          nextPowerUps.magnet = duration ?? POWERUP_CONFIG.magnet.duration;
          break;
        case 'multiplier':
          nextPowerUps.multiplier = duration ?? POWERUP_CONFIG.multiplier.duration;
          break;
        default:
          break;
      }

      return { activePowerUps: nextPowerUps };
    });
  },

  // Break shield on impact
  consumeShield: () => {
    const { activePowerUps } = get();
    if (activePowerUps.shield) {
      set({
        activePowerUps: {
          ...activePowerUps,
          shield: false,
        },
      });
      return true;
    }
    return false;
  },

  // Decrement power-up timers by delta seconds
  tickPowerUps: (deltaSeconds) => {
    set((state) => {
      if (state.gameState !== GAME_STATE.PLAYING) return state;

      const coffee = Math.max(0, state.activePowerUps.coffee - deltaSeconds);
      const magnet = Math.max(0, state.activePowerUps.magnet - deltaSeconds);
      const multiplier = Math.max(0, state.activePowerUps.multiplier - deltaSeconds);

      // Avoid creating a new object if none were active
      if (
        coffee === state.activePowerUps.coffee &&
        magnet === state.activePowerUps.magnet &&
        multiplier === state.activePowerUps.multiplier
      ) {
        return state;
      }

      return {
        activePowerUps: {
          ...state.activePowerUps,
          coffee,
          magnet,
          multiplier,
        },
      };
    });
  },

  // Audio mute toggle
  toggleMute: () => {
    set((state) => {
      const nextMuted = !state.isMuted;
      safeSetStorage(STORAGE_KEYS.MUTED, nextMuted);
      return { isMuted: nextMuted };
    });
  },

  setMuted: (isMuted) => {
    safeSetStorage(STORAGE_KEYS.MUTED, isMuted);
    set({ isMuted });
  },
}));
