/**
 * Saigon Rush - Core Game Constants
 * Sourced from TECH_ARCHITECTURE.md and PRD.md
 */

// Track & Lanes
export const LANE_WIDTH = 2.5; // meters
export const LANES = {
  LEFT: -LANE_WIDTH,
  CENTER: 0.0,
  RIGHT: LANE_WIDTH,
};
export const LANE_VALUES = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
export const LANE_INDEX = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
};

// Player Physics & Dynamics
export const PLAYER_HEIGHT = 1.8;
export const SLIDE_HEIGHT = 0.6;
export const SLIDE_DURATION = 0.8; // seconds
export const JUMP_APEX = 2.8; // meters
export const JUMP_GRAVITY = 36; // m/s^2
export const JUMP_INITIAL_VELOCITY = Math.sqrt(2 * JUMP_GRAVITY * JUMP_APEX); // ~14.2 m/s
export const FAST_FALL_VELOCITY = -18; // m/s
export const LANE_SWITCH_SPEED = 18; // dampening factor (~180ms transition)
export const LANE_TILT_ANGLE = 0.15; // radians

// Speed Progression
export const BASE_SPEED = 18; // m/s
export const MAX_SPEED = 38; // m/s
export const SPEED_INCREMENT = 0.5; // m/s per 100m
export const SPEED_INCREMENT_INTERVAL = 100; // meters

// World & Chunk Pooling
export const CHUNK_LENGTH = 30; // meters
export const CHUNK_COUNT = 5; // active chunks
export const CHUNK_RENDER_DISTANCE = 150; // meters ahead
export const SPAWN_Z = -120; // meters
export const DESPAWN_Z = 25; // meters behind player

// Camera
export const CAMERA_POSITION = [0, 3.8, 6.5];
export const CAMERA_LOOK_AT = [0, 1.4, -4.0];
export const CAMERA_FOV = 60; // degrees
export const CAMERA_FOV_BOOST = 72; // degrees during Cà phê rush

// Vietnamese Power-Ups
export const POWERUP_CONFIG = {
  coffee: {
    id: 'coffee',
    name: 'Cà phê',
    duration: 6, // seconds
    speedMultiplier: 1.4,
  },
  shield: {
    id: 'shield',
    name: 'Nón lá',
    invincibilityFrames: 1.5, // seconds after break
  },
  magnet: {
    id: 'magnet',
    name: 'Bánh mì',
    duration: 8, // seconds
    radius: 12, // meters
  },
  multiplier: {
    id: 'multiplier',
    name: 'Trà đá',
    duration: 10, // seconds
    multiplier: 2,
  },
};

// Coin Configuration
export const COIN_VALUE = 1;
export const COIN_SCORE_BASE = 10;
export const COIN_RADIUS = 0.6; // meters

// Game States
export const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

// Storage Keys
export const STORAGE_KEYS = {
  HIGH_SCORE: 'saigonrush_highscore',
  MUTED: 'saigonrush_muted',
};
