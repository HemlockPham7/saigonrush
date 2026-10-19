import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATE, POWERUP_CONFIG } from './constants.js';
import { soundSystem } from './SoundSystem.js';

// Global obstacle registry: Map of obstacleId -> { id, type, box, position, laneIndex, isHit, hasRamp, size }
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
 * Update an obstacle's world bounding box and position.
 * If obstacle was not previously registered (e.g. after pool reset),
 * automatically registers it with its metadata so it is never dropped.
 */
export function updateObstacleBox(id, worldBox, worldPos, obstacleData) {
  let item = activeObstacles.get(id);
  if (!item) {
    if (!obstacleData) return;
    item = {
      id,
      type: obstacleData.type,
      laneIndex: obstacleData.lane,
      hasRamp: obstacleData.hasRamp || false,
      size: obstacleData.size,
      box: new THREE.Box3().copy(worldBox),
      position: new THREE.Vector3().copy(worldPos),
      isHit: false,
    };
    activeObstacles.set(id, item);
    return;
  }
  item.box.copy(worldBox);
  item.position.copy(worldPos);
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
 * Reset hit states on active obstacles (for replay without unmounting)
 */
export function resetHitStates() {
  for (const obstacle of activeObstacles.values()) {
    obstacle.isHit = false;
  }
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
 * Compute the walkable ground height at player position (Z = 0)
 * Allows player to run up SaigonBus ramps smoothly onto the bus roof (y = 2.45m)
 *
 * @param {number} playerX - Current lateral X position of player
 * @returns {number} Surface height in meters (0 for asphalt, up to 2.45 for bus roof)
 */
export function getGroundHeight(playerX) {
  let highestGround = 0;

  for (const obstacle of activeObstacles.values()) {
    if (obstacle.type !== 'bus') continue;

    // Bus width is ~2.1m. Check if player X is within the bus lane
    const xDist = Math.abs(playerX - obstacle.position.x);
    if (xDist > 1.1) continue;

    const busZ = obstacle.position.z;
    const busHalfLength = 4.25; // Bus body length: 8.5m
    const rampLength = 4.2;

    if (obstacle.hasRamp) {
      // Ramp extends in front (+Z direction) from busZ + 4.25 to busZ + 8.45
      const rampEnd = busZ + busHalfLength + rampLength; // z where ramp touches road (y = 0)
      const rampStart = busZ + busHalfLength; // z where ramp meets roof (y = 2.45)

      // Player is at Z = 0 in world coordinates
      if (0 >= rampStart && 0 <= rampEnd) {
        // Player is climbing the ramp!
        const progress = (rampEnd - 0) / rampLength; // 0.0 at road, 1.0 at roof
        const rampY = THREE.MathUtils.clamp(progress, 0, 1) * 2.45;
        if (rampY > highestGround) highestGround = rampY;
        continue;
      }
    }

    // Bus Roof Surface: z is between [busZ - 4.25, busZ + 4.25]
    if (0 >= (busZ - busHalfLength) && 0 <= (busZ + busHalfLength)) {
      if (2.45 > highestGround) highestGround = 2.45;
    }
  }

  return highestGround;
}

/**
 * Main Collision Detection Loop
 * Called every frame in useFrame from Player.
 *
 * @param {THREE.Box3} playerBox - Current player bounding box in world space
 * @param {Object} playerData - { posY, isJumping, isSliding, currentX, laneIndex, groundY }
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
  for (const [id, obstacle] of activeObstacles.entries()) {
    if (obstacle.isHit) continue;

    // Generous broad-phase proximity: only check obstacles within 5m of player
    if (obstacle.box.min.z > 5.0 || obstacle.box.max.z < -5.0) {
      continue;
    }

    // 1. Special check: SaigonBus with Ramp
    if (obstacle.type === 'bus') {
      // If player is on the roof or climbing the ramp (posY >= 2.2m), player is safe!
      if (playerData.posY >= 2.2 || playerData.groundY > 0.1) {
        continue;
      }
    }

    // 2. Special check: OverheadWires & Sliding
    if (obstacle.type === 'overhead') {
      // If player is sliding, they duck safely under overhead cables (clearance > 1.15m)
      if (playerData.isSliding) {
        continue;
      }
    }

    // 3. Special check: LowBarrier & Jumping
    if (obstacle.type === 'low') {
      // Low barrier height is ~0.6m. If player jump clearance is above 0.58m, safe!
      if (playerData.posY > 0.58) {
        continue;
      }
    }

    // Narrow-phase AABB test
    if (playerBox.intersectsBox(obstacle.box)) {
      // --- HIT DETECTED ---

      // Case A: Cà phê speed rush active -> smash obstacle!
      if (coffeeActive) {
        obstacle.isHit = true;
        soundSystem.playSmashSound();
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

      // Case C: Nón lá shield active -> absorb hit!
      if (shieldActive) {
        obstacle.isHit = true;
        store.consumeShield();
        invincibilityTimer = POWERUP_CONFIG.shield.invincibilityFrames || 1.5;
        soundSystem.playShieldBreakSound();

        return {
          type: 'SHIELD_ABSORB',
          obstacleId: id,
          obstacleType: obstacle.type,
        };
      }

      // Case D: Fatal crash -> Game Over!
      obstacle.isHit = true;
      soundSystem.playCrashSound();
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

