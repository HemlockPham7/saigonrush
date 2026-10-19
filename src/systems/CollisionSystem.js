import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATE, POWERUP_CONFIG } from './constants.js';

// Global obstacle registry: Map of obstacleId -> { id, type, box, position, laneIndex, isHit }
const activeObstacles = new Map();

// Invincibility state (after shield break)
let invincibilityTimer = 0;

/**
 * Register an active obstacle in the collision world
 */
export function registerObstacle(id, obstacleData) {
  activeObstacles.set(id, obstacleData);
}

/**
 * Update an obstacle's world bounding box and position
 */
export function updateObstacleBox(id, worldBox, worldPos) {
  const item = activeObstacles.get(id);
  if (item) {
    item.box.copy(worldBox);
    item.position.copy(worldPos);
  }
}

/**
 * Remove an obstacle from collision registry
 */
export function unregisterObstacle(id) {
  activeObstacles.delete(id);
}

/**
 * Clear all registered obstacles (e.g. on game restart)
 */
export function clearObstacles() {
  activeObstacles.clear();
  invincibilityTimer = 0;
}

/**
 * Check if player is currently in temporary invincibility frames
 */
export function isInvincible() {
  return invincibilityTimer > 0;
}

export function getInvincibilityTime() {
  return invincibilityTimer;
}

/**
 * Main Collision Detection Loop
 * Called every frame in useFrame from a collision controller or player.
 *
 * @param {THREE.Box3} playerBox - Current player bounding box in world space
 * @param {Object} playerData - { posY, isJumping, isSliding, currentX, laneIndex }
 * @param {number} delta - Frame delta in seconds
 * @returns {Object|null} Collision event details or null
 */
export function checkCollisions(playerBox, playerData, delta) {
  const store = useGameStore.getState();
  if (store.gameState !== GAME_STATE.PLAYING) return null;

  // Tick temporary invincibility frames
  if (invincibilityTimer > 0) {
    invincibilityTimer = Math.max(0, invincibilityTimer - delta);
  }

  const coffeeActive = store.activePowerUps.coffee > 0;
  const shieldActive = store.activePowerUps.shield;

  // Broad-phase: Player is at Z = 0 in world space
  // Only test obstacles within |z_obstacle| < 4.5m
  for (const [id, obstacle] of activeObstacles.entries()) {
    if (obstacle.isHit) continue;

    const zDist = Math.abs(obstacle.position.z);
    if (zDist > 5.0) continue;

    // Narrow-phase AABB test
    if (playerBox.intersectsBox(obstacle.box)) {
      // 1. Special check: If obstacle is OverheadWires and player is sliding
      if (obstacle.type === 'overhead' && playerData.isSliding) {
        // Player is sliding low (height 0.6m) and safely clears the overhead cables!
        continue;
      }

      // 2. Special check: If obstacle is SaigonBus and player is on the roof
      if (obstacle.type === 'bus') {
        // Bus roof is at y = 2.45m. If player is running on roof (y >= 2.35m), safe!
        if (playerData.posY >= 2.35) {
          continue;
        }
      }

      // 3. Special check: If obstacle is LowBarrier and player is jumping above it
      if (obstacle.type === 'low') {
        // Low barrier max height is ~0.65m. If player is jumping above 0.7m, safe!
        if (playerData.posY > 0.68) {
          continue;
        }
      }

      // --- HIT DETECTED ---
      // Case A: Cà phê speed rush is active -> smash obstacle!
      if (coffeeActive) {
        obstacle.isHit = true;
        // Obstacle smashed, player continues unhindered
        return {
          type: 'SMASH_OBSTACLE',
          obstacleId: id,
          obstacleType: obstacle.type,
        };
      }

      // Case B: Invincibility frames active -> ignore hit
      if (invincibilityTimer > 0) {
        continue;
      }

      // Case C: Nón lá shield is active -> absorb hit!
      if (shieldActive) {
        obstacle.isHit = true;
        store.consumeShield();
        invincibilityTimer = POWERUP_CONFIG.shield.invincibilityFrames || 1.5;

        return {
          type: 'SHIELD_ABSORB',
          obstacleId: id,
          obstacleType: obstacle.type,
        };
      }

      // Case D: Fatal crash -> Game Over!
      obstacle.isHit = true;
      store.gameOver();

      return {
        type: 'FATAL_CRASH',
        obstacleId: id,
        obstacleType: obstacle.type,
      };
    }
  }

  return null;
}
