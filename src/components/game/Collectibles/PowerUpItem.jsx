import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore.js';
import { GAME_STATE } from '../../../systems/constants.js';
import { soundSystem } from '../../../systems/SoundSystem.js';
import ModelLoader from '../ModelLoader.jsx';
import { MODEL_PATHS, USE_GLTF_MODELS } from '../modelRegistry.js';
import ProceduralPowerUp from '../fallbacks/ProceduralPowerUp.jsx';

const auraMaterials = {
  glowCoffee: new THREE.MeshBasicMaterial({
    color: '#ffb300',
    transparent: true,
    opacity: 0.25,
    wireframe: true,
  }),
  glowShield: new THREE.MeshBasicMaterial({
    color: '#ffd166',
    transparent: true,
    opacity: 0.6,
  }),
  glowMagnet: new THREE.MeshBasicMaterial({
    color: '#4cc9f0',
    transparent: true,
    opacity: 0.7,
  }),
  glowMultiplier: new THREE.MeshBasicMaterial({
    color: '#06d6a0',
    transparent: true,
    opacity: 0.7,
  }),
};

// Zero-allocation vector caches
const _itemWorldPos = new THREE.Vector3();
const _playerWorldPos = new THREE.Vector3();

/**
 * 3D Collectible Power-Up Item
 * Supports Cà Phê, Nón Lá, Bánh Mì, and Trà Đá pickups.
 * Loads external GLB model when available with procedural fallback.
 */
function PowerUpItem({
  type = 'coffee',
  position = [0, 1.0, 0],
  onCollect,
}) {
  const itemGroupRef = useRef();
  const auraRef = useRef();
  const [collected, setCollected] = useState(false);
  const basePosY = position[1];

  useFrame((state, delta) => {
    if (!itemGroupRef.current || collected) return;

    // Continuous smooth hover & rotation
    itemGroupRef.current.rotation.y += delta * 2.2;
    itemGroupRef.current.position.y =
      basePosY + Math.sin(state.clock.elapsedTime * 3.5 + position[2]) * 0.12;

    // Pulse aura if present
    if (auraRef.current) {
      const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 5.0) * 0.1;
      auraRef.current.scale.set(pulse, pulse, pulse);
    }

    if (useGameStore.getState().gameState !== GAME_STATE.PLAYING) return;

    // Hit-testing with player
    itemGroupRef.current.getWorldPosition(_itemWorldPos);
    const playerGroup = state.scene.getObjectByName('player-root');
    const px = playerGroup?.position.x ?? 0;
    const py = playerGroup?.position.y ?? 0;
    _playerWorldPos.set(px, py + 0.9, 0);

    const dist = _itemWorldPos.distanceTo(_playerWorldPos);

    if (dist < 1.1) {
      setCollected(true);
      itemGroupRef.current.visible = false;
      useGameStore.getState().activatePowerUp(type);
      soundSystem.playPowerUpSound();
      onCollect?.(type);
    }
  });

  if (collected) return null;

  return (
    <group ref={itemGroupRef} position={position} name={`powerup-${type}`}>
      {/* 1. CÀ PHÊ SỮA ĐÁ (Speed Rush) */}
      {type === 'coffee' && (
        <group>
          <ModelLoader
            url={MODEL_PATHS.coffee}
            enabled={USE_GLTF_MODELS.coffee}
            scale={1}
            fallback={<ProceduralPowerUp type="coffee" />}
          />
          <mesh ref={auraRef} material={auraMaterials.glowCoffee}>
            <sphereGeometry args={[0.55, 12, 12]} />
          </mesh>
        </group>
      )}

      {/* 2. NÓN LÁ (Protective Shield) */}
      {type === 'shield' && (
        <group>
          <ModelLoader
            url={MODEL_PATHS.shield}
            enabled={USE_GLTF_MODELS.shield}
            scale={1}
            fallback={<ProceduralPowerUp type="shield" />}
          />
          <mesh ref={auraRef} rotation-x={Math.PI / 2} material={auraMaterials.glowShield}>
            <torusGeometry args={[0.65, 0.06, 8, 24]} />
          </mesh>
        </group>
      )}

      {/* 3. BÁNH MÌ (Coin Magnet) */}
      {type === 'magnet' && (
        <group rotation={[0.2, 0, 0.4]}>
          <ModelLoader
            url={MODEL_PATHS.banhmi}
            enabled={USE_GLTF_MODELS.banhmi}
            scale={1}
            fallback={<ProceduralPowerUp type="magnet" />}
          />
          <mesh ref={auraRef} rotation-x={Math.PI / 2} material={auraMaterials.glowMagnet}>
            <torusGeometry args={[0.62, 0.05, 8, 24]} />
          </mesh>
        </group>
      )}

      {/* 4. TRÀ ĐÁ (2X Multiplier) */}
      {type === 'multiplier' && (
        <group>
          <ModelLoader
            url={MODEL_PATHS.icedtea}
            enabled={USE_GLTF_MODELS.icedtea}
            scale={1}
            fallback={<ProceduralPowerUp type="multiplier" />}
          />
          <mesh ref={auraRef} material={auraMaterials.glowMultiplier}>
            <torusGeometry args={[0.55, 0.05, 8, 24]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default React.memo(PowerUpItem);
