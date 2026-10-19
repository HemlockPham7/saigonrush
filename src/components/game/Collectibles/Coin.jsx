import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore.js';
import { GAME_STATE, COIN_RADIUS, POWERUP_CONFIG } from '../../../systems/constants.js';
import { soundSystem } from '../../../systems/SoundSystem.js';

// Shared materials for coins
const coinMaterials = {
  goldFace: new THREE.MeshStandardMaterial({
    color: '#ffd166',
    metalness: 0.85,
    roughness: 0.2,
  }),
  goldRim: new THREE.MeshStandardMaterial({
    color: '#f4a261',
    metalness: 0.9,
    roughness: 0.25,
  }),
  starEmboss: new THREE.MeshBasicMaterial({
    color: '#ffffff',
  }),
};

// Reusable vectors for zero-allocation math
const _coinWorldPos = new THREE.Vector3();
const _playerPos = new THREE.Vector3();

/**
 * Animated Spinning Golden Dong / Star Coin
 * Supports Bánh Mì Magnet pull and collision collection
 */
function Coin({
  position = [0, 0.5, 0],
  onCollect,
  isCollected = false,
}) {
  const coinRef = useRef();
  const collectedRef = useRef(isCollected);
  const localPosRef = useRef(new THREE.Vector3(...position));

  useFrame((state, delta) => {
    if (!coinRef.current || collectedRef.current) return;

    // Continuous spin
    coinRef.current.rotation.y += delta * 3.5;

    // Floating subtle bob
    coinRef.current.position.y =
      localPosRef.current.y + Math.sin(state.clock.elapsedTime * 4.0 + position[2]) * 0.06;

    if (useGameStore.getState().gameState !== GAME_STATE.PLAYING) return;

    // Get coin world position
    coinRef.current.getWorldPosition(_coinWorldPos);

    // Get player state from global store or player userData
    const playerGroup = state.scene.getObjectByName('player-root');
    const playerCurrentX = playerGroup?.position.x ?? 0;
    const playerPosY = playerGroup?.position.y ?? 0;
    _playerPos.set(playerCurrentX, playerPosY + 0.8, 0);

    const distance = _coinWorldPos.distanceTo(_playerPos);

    // 1. Bánh Mì Magnet Attraction (pulls all coins within 12m)
    const magnetActive = useGameStore.getState().activePowerUps.magnet > 0;
    const magnetRadius = POWERUP_CONFIG.magnet.radius || 12;

    if (magnetActive && distance < magnetRadius && Math.abs(_coinWorldPos.z) < 15.0) {
      // Interpolate coin toward player
      const magnetStrength = 16.0 * delta;
      coinRef.current.position.x = THREE.MathUtils.damp(
        coinRef.current.position.x,
        playerCurrentX,
        magnetStrength,
        delta
      );
      coinRef.current.position.y = THREE.MathUtils.damp(
        coinRef.current.position.y,
        playerPosY + 0.8,
        magnetStrength,
        delta
      );
    }

    // 2. Collection Hit Detection
    if (distance < COIN_RADIUS + 0.45) {
      collectedRef.current = true;
      coinRef.current.visible = false;
      useGameStore.getState().addCoin(1);
      soundSystem.playCoinSound();
      onCollect?.();
    }
  });

  if (collectedRef.current) return null;

  return (
    <group ref={coinRef} position={position} name="coin">
      {/* Outer Coin Disc */}
      <mesh rotation-x={Math.PI / 2} castShadow material={coinMaterials.goldFace}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
      </mesh>
      {/* Embossed Outer Rim */}
      <mesh rotation-x={Math.PI / 2} material={coinMaterials.goldRim}>
        <torusGeometry args={[0.24, 0.02, 8, 16]} />
      </mesh>
      {/* Center Star Emblem */}
      <mesh position={[0, 0, 0.027]} material={coinMaterials.starEmboss}>
        <planeGeometry args={[0.16, 0.16]} />
      </mesh>
      <mesh position={[0, 0, -0.027]} rotation-y={Math.PI} material={coinMaterials.starEmboss}>
        <planeGeometry args={[0.16, 0.16]} />
      </mesh>
    </group>
  );
}

export default React.memo(Coin);
