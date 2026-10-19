import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import { subscribeToKeyboardAction } from '../../hooks/useKeyboard.js';
import {
  LANES,
  LANE_VALUES,
  LANE_SWITCH_SPEED,
  LANE_TILT_ANGLE,
  JUMP_GRAVITY,
  JUMP_INITIAL_VELOCITY,
  FAST_FALL_VELOCITY,
  SLIDE_DURATION,
  PLAYER_HEIGHT,
  SLIDE_HEIGHT,
  GAME_STATE,
} from '../../systems/constants.js';
import { checkCollisions, isInvincible, getGroundHeight } from '../../systems/CollisionSystem.js';
import { soundSystem } from '../../systems/SoundSystem.js';

// Reusable vectors for zero-allocation math in useFrame
const _playerCenter = new THREE.Vector3();
const _playerSize = new THREE.Vector3();

/**
 * Saigon Rush - Procedural 3D Player Controller
 * Renders an athletic Vietnamese street runner with Nón Lá (conical hat).
 * Handles responsive 3-lane switching, jumping, sliding, and fast-falling.
 */
export default function Player() {
  const playerGroupRef = useRef();
  const bodyGroupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const shieldAuraRef = useRef();

  // Reactive power-ups from Zustand
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const gameState = useGameStore((state) => state.gameState);

  // Mutable movement state stored in refs for 60 FPS useFrame updates
  const laneIndexRef = useRef(1); // 0: Left (-2.5), 1: Center (0), 2: Right (+2.5)
  const currentXRef = useRef(0);
  const targetXRef = useRef(0);
  const posYRef = useRef(0);
  const groundYRef = useRef(0);
  const velocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const isSlidingRef = useRef(false);
  const slideTimerRef = useRef(0);
  const runTimeRef = useRef(0);
  const boundingBoxRef = useRef(new THREE.Box3());

  // Subscribe to keyboard actions
  useEffect(() => {
    const unsubscribe = subscribeToKeyboardAction((action) => {
      if (useGameStore.getState().gameState !== GAME_STATE.PLAYING) return;

      switch (action) {
        case 'MOVE_LEFT':
          if (laneIndexRef.current > 0) {
            laneIndexRef.current -= 1;
            targetXRef.current = LANE_VALUES[laneIndexRef.current];
          }
          break;

        case 'MOVE_RIGHT':
          if (laneIndexRef.current < 2) {
            laneIndexRef.current += 1;
            targetXRef.current = LANE_VALUES[laneIndexRef.current];
          }
          break;

        case 'JUMP':
          // Can jump when on ground (or bus roof) and not already sliding
          if (!isJumpingRef.current && posYRef.current <= groundYRef.current + 0.1) {
            isJumpingRef.current = true;
            isSlidingRef.current = false;
            slideTimerRef.current = 0;
            velocityYRef.current = JUMP_INITIAL_VELOCITY;
            soundSystem.playJumpSound();
          }
          break;

        case 'SLIDE':
          if (isJumpingRef.current || posYRef.current > groundYRef.current + 0.1) {
            // Fast-fall mechanic: immediately slam downward
            velocityYRef.current = FAST_FALL_VELOCITY;
            soundSystem.playSlideSound();
          } else {
            // Regular slide on ground
            isSlidingRef.current = true;
            slideTimerRef.current = SLIDE_DURATION;
            soundSystem.playSlideSound();
          }
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Reset player when restarting game or going to menu
  useEffect(() => {
    if (gameState === GAME_STATE.MENU || gameState === GAME_STATE.PLAYING) {
      laneIndexRef.current = 1;
      currentXRef.current = 0;
      targetXRef.current = 0;
      posYRef.current = 0;
      groundYRef.current = 0;
      velocityYRef.current = 0;
      isJumpingRef.current = false;
      isSlidingRef.current = false;
      slideTimerRef.current = 0;
      runTimeRef.current = 0;

      if (playerGroupRef.current) {
        playerGroupRef.current.position.set(0, 0, 0);
      }
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.set(0, 0, 0);
        bodyGroupRef.current.rotation.set(0, 0, 0);
        bodyGroupRef.current.scale.set(1, 1, 1);
      }
    }
  }, [gameState]);

  // Main 60 FPS Player Movement & Animation Loop
  useFrame((state, delta) => {
    if (!playerGroupRef.current || !bodyGroupRef.current) return;

    // Cap delta to prevent tunneling or huge jumps after tab freeze
    const dt = Math.min(delta, 0.1);
    const isPlaying = gameState === GAME_STATE.PLAYING;

    // Speed multiplier during Cà phê rush
    const speedBoost = activePowerUps.coffee > 0 ? 1.4 : 1.0;
    const strideFreq = 16 * speedBoost;

    // Query current walkable ground height (asphalt = 0, bus ramp / roof = up to 2.45m)
    const currentGroundY = isPlaying ? getGroundHeight(currentXRef.current) : 0;
    groundYRef.current = currentGroundY;

    // 1. Horizontal Lane Interpolation
    currentXRef.current = THREE.MathUtils.damp(
      currentXRef.current,
      targetXRef.current,
      LANE_SWITCH_SPEED,
      dt
    );

    // Lateral delta for banking tilt
    const deltaX = targetXRef.current - currentXRef.current;
    const tiltZ = -LANE_TILT_ANGLE * THREE.MathUtils.clamp(deltaX / 1.5, -1, 1);

    // 2. Vertical Jump, Gravity Physics & Ramp Elevation
    if (isJumpingRef.current || posYRef.current > currentGroundY) {
      velocityYRef.current -= JUMP_GRAVITY * dt;
      posYRef.current += velocityYRef.current * dt;

      if (posYRef.current <= currentGroundY) {
        posYRef.current = currentGroundY;
        velocityYRef.current = 0;
        isJumpingRef.current = false;
      }
    } else {
      // Running smoothly on surface (elevates automatically along bus ramp)
      posYRef.current = currentGroundY;
    }

    // 3. Slide Timer & Posture
    if (isSlidingRef.current) {
      slideTimerRef.current -= dt;
      if (slideTimerRef.current <= 0) {
        isSlidingRef.current = false;
        slideTimerRef.current = 0;
      }
    }

    // Apply translation to main player group
    playerGroupRef.current.position.x = currentXRef.current;
    playerGroupRef.current.position.y = posYRef.current;
    playerGroupRef.current.position.z = 0;

    // 4. Procedural Character Stride & Pose Animations
    if (isPlaying) {
      runTimeRef.current += dt;
    }

    const runCycle = runTimeRef.current * strideFreq;

    if (isSlidingRef.current) {
      // SLIDE POSE: Character ducks low, tilts forward
      bodyGroupRef.current.scale.y = THREE.MathUtils.damp(bodyGroupRef.current.scale.y, 0.55, 20, dt);
      bodyGroupRef.current.scale.x = THREE.MathUtils.damp(bodyGroupRef.current.scale.x, 1.1, 20, dt);
      bodyGroupRef.current.scale.z = THREE.MathUtils.damp(bodyGroupRef.current.scale.z, 1.2, 20, dt);
      bodyGroupRef.current.position.y = -0.25;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.damp(bodyGroupRef.current.rotation.x, 0.45, 18, dt);
      bodyGroupRef.current.rotation.z = THREE.MathUtils.damp(bodyGroupRef.current.rotation.z, tiltZ, 18, dt);

      // Tuck limbs
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -1.1;
        rightLegRef.current.rotation.x = -1.1;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0.8;
        rightArmRef.current.rotation.x = 0.8;
      }
    } else if (isJumpingRef.current || posYRef.current > currentGroundY + 0.1) {
      // JUMP POSE: Arms open for balance, legs tuck slightly
      bodyGroupRef.current.scale.set(1, 1, 1);
      bodyGroupRef.current.position.y = 0;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.damp(bodyGroupRef.current.rotation.x, -0.15, 15, dt);
      bodyGroupRef.current.rotation.z = THREE.MathUtils.damp(bodyGroupRef.current.rotation.z, tiltZ, 18, dt);

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0.4, 15, dt);
        rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, -0.2, 15, dt);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -0.6, 15, dt);
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -0.6, 15, dt);
        leftArmRef.current.rotation.z = -0.3;
        rightArmRef.current.rotation.z = 0.3;
      }
    } else {
      // RUNNING POSE: Natural rhythmic swing & bob
      bodyGroupRef.current.scale.set(1, 1, 1);
      const bobbing = Math.abs(Math.sin(runCycle)) * 0.08;
      bodyGroupRef.current.position.y = isPlaying ? bobbing : 0;
      bodyGroupRef.current.rotation.x = THREE.MathUtils.damp(bodyGroupRef.current.rotation.x, 0.08, 15, dt);
      bodyGroupRef.current.rotation.z = THREE.MathUtils.damp(bodyGroupRef.current.rotation.z, tiltZ, 18, dt);

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(runCycle) * 0.75;
        rightLegRef.current.rotation.x = -Math.sin(runCycle) * 0.75;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(runCycle) * 0.65;
        rightArmRef.current.rotation.x = Math.sin(runCycle) * 0.65;
        leftArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.z = 0;
      }
    }

    // 5. Shield Aura Animation (Nón Lá Shield)
    if (shieldAuraRef.current) {
      if (activePowerUps.shield) {
        shieldAuraRef.current.visible = true;
        shieldAuraRef.current.rotation.y += dt * 3.0;
        const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 6.0) * 0.06;
        shieldAuraRef.current.scale.set(pulse, pulse, pulse);
      } else {
        shieldAuraRef.current.visible = false;
      }
    }

    // 6. Update Bounding Box for Collision System
    const currentHeight = isSlidingRef.current ? SLIDE_HEIGHT : PLAYER_HEIGHT;
    _playerCenter.set(currentXRef.current, posYRef.current + currentHeight * 0.5, 0);
    _playerSize.set(0.68, currentHeight, 0.5);
    boundingBoxRef.current.setFromCenterAndSize(_playerCenter, _playerSize);

    // Export bounds onto userData for CollisionSystem
    playerGroupRef.current.userData = {
      laneIndex: laneIndexRef.current,
      currentX: currentXRef.current,
      posY: posYRef.current,
      groundY: currentGroundY,
      isJumping: isJumpingRef.current,
      isSliding: isSlidingRef.current,
      boundingBox: boundingBoxRef.current,
    };

    // 7. Check Collisions with Active Obstacles
    if (isPlaying) {
      const hitResult = checkCollisions(
        boundingBoxRef.current,
        {
          posY: posYRef.current,
          groundY: currentGroundY,
          isJumping: isJumpingRef.current,
          isSliding: isSlidingRef.current,
          currentX: currentXRef.current,
          laneIndex: laneIndexRef.current,
        },
        dt
      );

      if (hitResult?.type === 'FATAL_CRASH') {
        // Tumble knockback reaction
        bodyGroupRef.current.rotation.x = -Math.PI / 3;
        bodyGroupRef.current.position.y = -0.3;
      }
    }

    // 8. Invincibility Blinking Effect (After shield absorb)
    if (isInvincible()) {
      const isVisible = Math.sin(state.clock.elapsedTime * 25.0) > 0;
      bodyGroupRef.current.visible = isVisible;
    } else {
      bodyGroupRef.current.visible = true;
    }
  });

  return (
    <group ref={playerGroupRef} name="player-root" position={[0, 0, 0]}>
      {/* Tilting & Squashing Body Container */}
      <group ref={bodyGroupRef}>
        {/* --- HEAD & CONICAL HAT (NÓN LÁ) --- */}
        <group position={[0, 1.38, 0]}>
          {/* Head Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#fcd5b5" roughness={0.6} />
          </mesh>

          {/* Hair */}
          <mesh position={[0, 0.08, -0.06]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#1a1818" roughness={0.9} />
          </mesh>

          {/* Vietnamese Conical Hat (Nón Lá) */}
          <group position={[0, 0.18, 0]} rotation={[-0.1, 0, 0]}>
            {/* Straw Cone */}
            <mesh castShadow>
              <coneGeometry args={[0.42, 0.24, 32, 1, true]} />
              <meshStandardMaterial color="#f4d58d" roughness={0.7} side={THREE.DoubleSide} />
            </mesh>
            {/* Red Rim Ribbon */}
            <mesh position={[0, -0.118, 0]} rotation-x={Math.PI / 2} castShadow>
              <torusGeometry args={[0.41, 0.015, 8, 32]} />
              <meshStandardMaterial color="#da291c" roughness={0.5} />
            </mesh>
            {/* Chin Strap */}
            <mesh position={[0, -0.12, 0]} rotation-z={Math.PI / 2}>
              <torusGeometry args={[0.15, 0.008, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#da291c" />
            </mesh>
          </group>
        </group>

        {/* --- TORSO & JACKET --- */}
        <group position={[0, 0.88, 0]}>
          {/* Street Runner Jacket (Saigon Red) */}
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.48, 0.26]} />
            <meshStandardMaterial color="#da291c" roughness={0.5} />
          </mesh>

          {/* Gold Sport Racing Stripe */}
          <mesh position={[0, 0, 0.132]}>
            <planeGeometry args={[0.1, 0.46]} />
            <meshStandardMaterial color="#ffd166" roughness={0.4} />
          </mesh>

          {/* Backpack / Satchel */}
          <mesh position={[0, 0.04, -0.17]} castShadow>
            <boxGeometry args={[0.3, 0.34, 0.14]} />
            <meshStandardMaterial color="#2c2a38" roughness={0.8} />
          </mesh>
        </group>

        {/* --- ARMS --- */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.28, 1.05, 0]}>
          {/* Sleeve & Forearm */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.38, 8]} />
            <meshStandardMaterial color="#da291c" roughness={0.5} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fcd5b5" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.28, 1.05, 0]}>
          {/* Sleeve & Forearm */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.38, 8]} />
            <meshStandardMaterial color="#da291c" roughness={0.5} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fcd5b5" />
          </mesh>
        </group>

        {/* --- LEGS & SNEAKERS --- */}
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.14, 0.62, 0]}>
          {/* Running Shorts / Pants */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.48, 8]} />
            <meshStandardMaterial color="#1a1c29" roughness={0.7} />
          </mesh>
          {/* Sneaker */}
          <mesh position={[0, -0.52, 0.05]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.14, 0.62, 0]}>
          {/* Running Shorts / Pants */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.48, 8]} />
            <meshStandardMaterial color="#1a1c29" roughness={0.7} />
          </mesh>
          {/* Sneaker */}
          <mesh position={[0, -0.52, 0.05]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* --- NÓN LÁ SHIELD ENERGY AURA --- */}
      <group ref={shieldAuraRef} visible={false} position={[0, 0.9, 0]}>
        {/* Holographic Glowing Conical Dome */}
        <mesh>
          <coneGeometry args={[0.95, 0.8, 32, 1, true]} />
          <meshStandardMaterial
            color="#ffd166"
            emissive="#ffd166"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Energy Rings */}
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#3be8ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* --- CÀ PHÊ SPEED RUSH AURA --- */}
      {activePowerUps.coffee > 0 && (
        <group position={[0, 0.9, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <ringGeometry args={[0.7, 0.9, 24]} />
            <meshBasicMaterial color="#ff9800" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.6]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[1.2, 0.8]} />
            <meshBasicMaterial color="#ffd166" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* --- BÁNH MÌ MAGNET AURA --- */}
      {activePowerUps.magnet > 0 && (
        <group position={[0, 0.9, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.8, 0.04, 8, 24]} />
            <meshBasicMaterial color="#3be8ff" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* --- TRÀ ĐÁ 2X MULTIPLIER AURA --- */}
      {activePowerUps.multiplier > 0 && (
        <group position={[0, 0.9, 0]}>
          <mesh rotation-y={Math.PI / 4}>
            <octahedronGeometry args={[0.85]} />
            <meshBasicMaterial color="#76ff03" wireframe transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
}
