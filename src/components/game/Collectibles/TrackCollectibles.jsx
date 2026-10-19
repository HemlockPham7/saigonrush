import React, { useMemo } from 'react';
import Coin from './Coin.jsx';
import PowerUpItem from './PowerUpItem.jsx';
import { LANE_VALUES } from '../../../systems/constants.js';

// Pre-configured collectible layouts per chunk variant
const COLLECTIBLE_PATTERNS = [
  // Pattern 0: Ground trail in Center lane, Coffee pickup
  {
    coins: [
      { lane: 1, z: -10, y: 0.5 },
      { lane: 1, z: -8, y: 0.5 },
      { lane: 1, z: -6, y: 0.5 },
      { lane: 1, z: -4, y: 0.5 },
      { lane: 1, z: -2, y: 0.5 },
    ],
    powerUp: { type: 'coffee', lane: 1, z: 3.0, y: 1.0 },
  },
  // Pattern 1: Jump arc over low obstacle, Bánh Mì magnet pickup
  {
    coins: [
      { lane: 1, z: 6.0, y: 0.6 },
      { lane: 1, z: 7.2, y: 1.4 },
      { lane: 1, z: 8.5, y: 2.1 }, // apex over stool
      { lane: 1, z: 9.8, y: 1.4 },
      { lane: 1, z: 11.0, y: 0.6 },
    ],
    powerUp: { type: 'magnet', lane: 2, z: -3.0, y: 1.0 },
  },
  // Pattern 2: Rooftop coins on Saigon Bus (Lane 2), Trà Đá multiplier
  {
    coins: [
      { lane: 2, z: -6.0, y: 2.95 },
      { lane: 2, z: -4.5, y: 2.95 },
      { lane: 2, z: -3.0, y: 2.95 },
      { lane: 2, z: -1.5, y: 2.95 },
      { lane: 2, z: 0.0, y: 2.95 },
      { lane: 2, z: 1.5, y: 2.95 },
    ],
    powerUp: { type: 'multiplier', lane: 0, z: 5.0, y: 1.0 },
  },
  // Pattern 3: Ground trail in Right lane, Nón Lá shield pickup
  {
    coins: [
      { lane: 2, z: -8, y: 0.5 },
      { lane: 2, z: -6, y: 0.5 },
      { lane: 2, z: -4, y: 0.5 },
      { lane: 2, z: -2, y: 0.5 },
      { lane: 2, z: 0, y: 0.5 },
    ],
    powerUp: { type: 'shield', lane: 0, z: 2.0, y: 1.0 },
  },
  // Pattern 4: Rooftop coins on Saigon Bus (Lane 0), Coffee pickup
  {
    coins: [
      { lane: 0, z: -6.5, y: 2.95 },
      { lane: 0, z: -5.0, y: 2.95 },
      { lane: 0, z: -3.5, y: 2.95 },
      { lane: 0, z: -2.0, y: 2.95 },
      { lane: 0, z: -0.5, y: 2.95 },
    ],
    powerUp: { type: 'coffee', lane: 2, z: -2.0, y: 1.0 },
  },
  // Pattern 5: Jump arc over low obstacle in Lane 2, Bánh Mì magnet
  {
    coins: [
      { lane: 2, z: 5.0, y: 0.6 },
      { lane: 2, z: 6.2, y: 1.4 },
      { lane: 2, z: 7.5, y: 2.1 }, // apex over barrier
      { lane: 2, z: 8.8, y: 1.4 },
      { lane: 2, z: 10.0, y: 0.6 },
    ],
    powerUp: { type: 'magnet', lane: 0, z: 3.0, y: 1.0 },
  },
];

// Initial welcoming coin trail on Chunk 0
const CHUNK_0_COINS = [
  { lane: 1, z: -10, y: 0.5 },
  { lane: 1, z: -7.5, y: 0.5 },
  { lane: 1, z: -5.0, y: 0.5 },
  { lane: 1, z: -2.5, y: 0.5 },
  { lane: 1, z: 0.0, y: 0.5 },
  { lane: 1, z: 2.5, y: 0.5 },
  { lane: 1, z: 5.0, y: 0.5 },
  { lane: 1, z: 7.5, y: 0.5 },
];

/**
 * TrackCollectibles component
 * Spawns coins in ground lines, jump arcs, rooftop trails, and floating Vietnamese power-ups.
 */
function TrackCollectibles({ chunkIndex = 0 }) {
  const layout = useMemo(() => {
    if (chunkIndex === 0) {
      return {
        coins: CHUNK_0_COINS,
        powerUp: { type: 'coffee', lane: 1, z: 11.0, y: 1.0 },
      };
    }
    return COLLECTIBLE_PATTERNS[(chunkIndex - 1) % COLLECTIBLE_PATTERNS.length];
  }, [chunkIndex]);

  return (
    <group name="chunk-collectibles">
      {/* Coins */}
      {layout.coins.map((coin, idx) => {
        const laneX = LANE_VALUES[coin.lane];
        return (
          <Coin
            key={`coin-${chunkIndex}-${idx}`}
            position={[laneX, coin.y, coin.z]}
          />
        );
      })}

      {/* Vietnamese Power-Up Item */}
      {layout.powerUp && (
        <PowerUpItem
          key={`powerup-${chunkIndex}-${layout.powerUp.type}`}
          type={layout.powerUp.type}
          position={[
            LANE_VALUES[layout.powerUp.lane],
            layout.powerUp.y,
            layout.powerUp.z,
          ]}
        />
      )}
    </group>
  );
}

export default React.memo(TrackCollectibles);
