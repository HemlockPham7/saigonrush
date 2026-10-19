import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore.js';
import { GAME_STATE } from '../../../systems/constants.js';
import { soundSystem } from '../../../systems/SoundSystem.js';

const materials = {
  // Coffee (Cà phê sữa đá)
  glass: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
  }),
  condensedMilk: new THREE.MeshStandardMaterial({
    color: '#fff8e7',
    roughness: 0.5,
  }),
  coffeeLiquid: new THREE.MeshStandardMaterial({
    color: '#3e2723',
    roughness: 0.4,
  }),
  phinMetal: new THREE.MeshStandardMaterial({
    color: '#cfd8dc',
    metalness: 0.9,
    roughness: 0.25,
  }),

  // Conical Hat (Nón lá shield)
  strawHat: new THREE.MeshStandardMaterial({
    color: '#f4d58d',
    roughness: 0.7,
    side: THREE.DoubleSide,
  }),
  redRibbon: new THREE.MeshStandardMaterial({
    color: '#da291c',
    roughness: 0.5,
  }),

  // Baguette (Bánh mì magnet)
  breadCrust: new THREE.MeshStandardMaterial({
    color: '#d48b38',
    roughness: 0.7,
  }),
  paperSleeve: new THREE.MeshStandardMaterial({
    color: '#ede0d4',
    roughness: 0.9,
  }),
  chiliGarnish: new THREE.MeshStandardMaterial({
    color: '#2e7d32',
    roughness: 0.6,
  }),

  // Iced Tea (Trà đá multiplier)
  teaAmber: new THREE.MeshStandardMaterial({
    color: '#e6a122',
    transparent: true,
    opacity: 0.75,
    roughness: 0.2,
  }),
  iceCube: new THREE.MeshStandardMaterial({
    color: '#e0f7fa',
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
  }),
  greenStraw: new THREE.MeshStandardMaterial({
    color: '#43a047',
    roughness: 0.5,
  }),

  // Auras
  glowCoffee: new THREE.MeshBasicMaterial({ color: '#ff9800', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
  glowShield: new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
  glowMagnet: new THREE.MeshBasicMaterial({ color: '#3be8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
  glowMultiplier: new THREE.MeshBasicMaterial({ color: '#76ff03', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
};

const _itemWorldPos = new THREE.Vector3();
const _playerWorldPos = new THREE.Vector3();

/**
 * 3D Vietnamese Themed Power-Up Pickup Item
 * Types:
 * - 'coffee': Cà phê sữa đá (Speed Rush)
 * - 'shield': Nón lá (1-hit shield)
 * - 'magnet': Bánh mì (Coin magnet)
 * - 'multiplier': Trà đá (2x score)
 */
function PowerUpItem({
  type = 'coffee',
  position = [0, 1.2, 0],
  onCollect,
}) {
  const itemGroupRef = useRef();
  const auraRef = useRef();
  const [collected, setCollected] = useState(false);

  useFrame((state, delta) => {
    if (!itemGroupRef.current || collected) return;

    // Hover spin and floating bob
    itemGroupRef.current.rotation.y += delta * 2.2;
    itemGroupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 3.0) * 0.12;

    // Pulse aura
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
      {/* ===================================================================
          1. CÀ PHÊ SỮA ĐÁ (Speed Rush)
          =================================================================== */}
      {type === 'coffee' && (
        <group>
          {/* Glass cup */}
          <mesh position={[0, 0, 0]} material={materials.glass}>
            <cylinderGeometry args={[0.22, 0.18, 0.5, 16]} />
          </mesh>
          {/* Condensed milk bottom layer */}
          <mesh position={[0, -0.15, 0]} material={materials.condensedMilk}>
            <cylinderGeometry args={[0.185, 0.18, 0.15, 16]} />
          </mesh>
          {/* Dark iced coffee top layer */}
          <mesh position={[0, 0.05, 0]} material={materials.coffeeLiquid}>
            <cylinderGeometry args={[0.21, 0.185, 0.28, 16]} />
          </mesh>
          {/* Metal Phin Filter on top */}
          <group position={[0, 0.35, 0]}>
            <mesh material={materials.phinMetal}>
              <cylinderGeometry args={[0.24, 0.24, 0.03, 16]} />
            </mesh>
            <mesh position={[0, 0.12, 0]} material={materials.phinMetal}>
              <cylinderGeometry args={[0.18, 0.18, 0.22, 16]} />
            </mesh>
          </group>
          {/* Amber Speed Aura */}
          <mesh ref={auraRef} material={materials.glowCoffee}>
            <sphereGeometry args={[0.55, 12, 12]} />
          </mesh>
        </group>
      )}

      {/* ===================================================================
          2. NÓN LÁ (Protective Shield)
          =================================================================== */}
      {type === 'shield' && (
        <group>
          {/* Conical Straw Hat */}
          <group position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
            <mesh castShadow material={materials.strawHat}>
              <coneGeometry args={[0.48, 0.32, 24, 1, true]} />
            </mesh>
            <mesh position={[0, -0.155, 0]} rotation-x={Math.PI / 2} material={materials.redRibbon}>
              <torusGeometry args={[0.46, 0.02, 8, 24]} />
            </mesh>
          </group>
          {/* Golden Shield Energy Halo */}
          <mesh ref={auraRef} rotation-x={Math.PI / 2} material={materials.glowShield}>
            <torusGeometry args={[0.65, 0.06, 8, 24]} />
          </mesh>
        </group>
      )}

      {/* ===================================================================
          3. BÁNH MÌ (Coin Magnet)
          =================================================================== */}
      {type === 'magnet' && (
        <group rotation={[0.2, 0, 0.4]}>
          {/* Crispy Baguette Bread */}
          <mesh castShadow material={materials.breadCrust}>
            <cylinderGeometry args={[0.14, 0.14, 0.8, 12]} />
          </mesh>
          {/* Pointy Baguette Tips */}
          <mesh position={[0, 0.45, 0]} material={materials.breadCrust}>
            <coneGeometry args={[0.14, 0.15, 12]} />
          </mesh>
          <mesh position={[0, -0.45, 0]} rotation-x={Math.PI} material={materials.breadCrust}>
            <coneGeometry args={[0.14, 0.15, 12]} />
          </mesh>
          {/* Paper sleeve wrapper */}
          <mesh position={[0, 0, 0]} material={materials.paperSleeve}>
            <cylinderGeometry args={[0.15, 0.15, 0.35, 12]} />
          </mesh>
          {/* Green chili garnish peeking out */}
          <mesh position={[0.12, 0.22, 0]} rotation-z={-0.3} material={materials.chiliGarnish}>
            <boxGeometry args={[0.04, 0.18, 0.04]} />
          </mesh>
          {/* Cyan Magnetic Flux Ring */}
          <mesh ref={auraRef} rotation-x={Math.PI / 2} material={materials.glowMagnet}>
            <torusGeometry args={[0.62, 0.05, 8, 24]} />
          </mesh>
        </group>
      )}

      {/* ===================================================================
          4. TRÀ ĐÁ (2X Score Multiplier)
          =================================================================== */}
      {type === 'multiplier' && (
        <group>
          {/* Tall Glass */}
          <mesh position={[0, 0, 0]} material={materials.glass}>
            <cylinderGeometry args={[0.2, 0.16, 0.6, 16]} />
          </mesh>
          {/* Golden Amber Iced Tea */}
          <mesh position={[0, -0.04, 0]} material={materials.teaAmber}>
            <cylinderGeometry args={[0.185, 0.155, 0.48, 16]} />
          </mesh>
          {/* Floating Ice Cubes */}
          <mesh position={[-0.05, 0.15, 0]} rotation={[0.3, 0.5, 0.2]} material={materials.iceCube}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          </mesh>
          <mesh position={[0.06, 0.12, 0.05]} rotation={[-0.2, 0.4, -0.1]} material={materials.iceCube}>
            <boxGeometry args={[0.09, 0.09, 0.09]} />
          </mesh>
          {/* Green Plastic Straw */}
          <mesh position={[0.08, 0.22, -0.05]} rotation-z={-0.2} material={materials.greenStraw}>
            <cylinderGeometry args={[0.018, 0.018, 0.65, 8]} />
          </mesh>
          {/* Glowing Multiplier Green Ring */}
          <mesh ref={auraRef} material={materials.glowMultiplier}>
            <torusGeometry args={[0.55, 0.05, 8, 24]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default React.memo(PowerUpItem);
