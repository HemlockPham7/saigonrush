import * as THREE from 'three';
import {
  registerObstacle,
  updateObstacleBox,
  clearObstacles,
  getGroundHeight,
  checkCollisions,
} from '../src/systems/CollisionSystem.js';
import { useGameStore } from '../src/store/useGameStore.js';
import { GAME_STATE } from '../src/systems/constants.js';

function runTests() {
  console.log('--- STARTING COLLISION SYSTEM UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Set game state to PLAYING
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });
  clearObstacles();

  const playerBox = new THREE.Box3();
  const playerCenter = new THREE.Vector3();
  const playerSize = new THREE.Vector3(0.68, 1.8, 0.5);

  function setPlayer(x, y, isSliding = false) {
    const height = isSliding ? 0.6 : 1.8;
    playerCenter.set(x, y + height * 0.5, 0);
    playerSize.set(0.68, height, 0.5);
    playerBox.setFromCenterAndSize(playerCenter, playerSize);
    return {
      posY: y,
      groundY: getGroundHeight(x),
      isJumping: y > 0,
      isSliding,
      currentX: x,
      laneIndex: x === -2.5 ? 0 : x === 0 ? 1 : 2,
    };
  }

  // --- TEST A: LowBarrier (Plastic Stools) ---
  console.log('\n[Test A: Low Barrier]');
  const stoolBox = new THREE.Box3(
    new THREE.Vector3(-0.55, 0, -0.35),
    new THREE.Vector3(0.55, 0.6, 0.35)
  );
  registerObstacle('stool-1', {
    id: 'stool-1',
    type: 'low',
    laneIndex: 1,
    box: stoolBox,
    position: new THREE.Vector3(0, 0.3, 0),
    isHit: false,
  });

  // A1. Player runs on ground into stool -> Crash!
  let pData = setPlayer(0, 0, false);
  let hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'FATAL_CRASH', 'Running into low stool triggers FATAL_CRASH');

  // Clear for next test
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });

  // A2. Player jumps over stool (posY = 1.5m) -> Safe!
  registerObstacle('stool-2', {
    id: 'stool-2',
    type: 'low',
    laneIndex: 1,
    box: stoolBox,
    position: new THREE.Vector3(0, 0.3, 0),
    isHit: false,
  });
  pData = setPlayer(0, 1.5, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit === null, 'Jumping over low stool (y=1.5m) safely clears it without collision');

  // --- TEST B: Overhead Wires (Slide Under) ---
  console.log('\n[Test B: Overhead Wires]');
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });

  const wireBox = new THREE.Box3(
    new THREE.Vector3(-1.0, 1.0, -0.3),
    new THREE.Vector3(1.0, 2.2, 0.3)
  );
  registerObstacle('wire-1', {
    id: 'wire-1',
    type: 'overhead',
    laneIndex: 1,
    box: wireBox,
    position: new THREE.Vector3(0, 1.6, 0),
    isHit: false,
  });

  // B1. Standing player hits overhead wires
  pData = setPlayer(0, 0, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'FATAL_CRASH', 'Standing player hitting overhead wires triggers FATAL_CRASH');

  // Clear for next test
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });

  // B2. Sliding player passes under overhead wires
  registerObstacle('wire-2', {
    id: 'wire-2',
    type: 'overhead',
    laneIndex: 1,
    box: wireBox,
    position: new THREE.Vector3(0, 1.6, 0),
    isHit: false,
  });
  pData = setPlayer(0, 0, true); // isSliding = true
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit === null, 'Sliding player safely ducks under overhead wires without collision');

  // --- TEST C: Saigon Bus Front Ramp & Rooftop Run ---
  console.log('\n[Test C: Saigon Bus Ramp & Rooftop Elevation]');
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });

  // Bus at lane 2 (x = 2.5), center z = -5.0. Length 8.5, Body spans [-9.25, -0.75].
  // Ramp extends in front from -0.75 to +3.45. Z = 0 is on the ramp slope!
  const busPos = new THREE.Vector3(2.5, 1.2, -5.0);
  const busBox = new THREE.Box3(
    new THREE.Vector3(1.5, 0, -9.25),
    new THREE.Vector3(3.5, 2.4, -0.75)
  );
  registerObstacle('bus-1', {
    id: 'bus-1',
    type: 'bus',
    laneIndex: 2,
    hasRamp: true,
    size: [2.0, 2.4, 8.5],
    box: busBox,
    position: busPos,
    isHit: false,
  });

  // C1. Ramp elevation query: At z = 0, bus front ramp is crossing!
  const groundElevation = getGroundHeight(2.5);
  assert(groundElevation > 0 && groundElevation < 2.45, `Bus ramp elevates ground at z=0 to ${groundElevation.toFixed(2)}m`);

  // C2. Player on ramp climbing: y = groundElevation
  pData = setPlayer(2.5, groundElevation, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit === null, 'Player running on bus ramp does not crash into bus');

  // C3. Running on bus roof: Move bus so z=0 is on roof (bus center z = 0)
  busPos.z = 0;
  busBox.min.z = -4.25;
  busBox.max.z = 4.25;
  const roofGround = getGroundHeight(2.5);
  assert(roofGround === 2.45, `Bus roof provides flat ground at y = 2.45m (got ${roofGround}m)`);

  pData = setPlayer(2.5, 2.45, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit === null, 'Player running on bus roof (y=2.45m) does not trigger collision');

  // --- TEST D: Power-Ups (Coffee Smash & Shield Absorb) ---
  console.log('\n[Test D: Power-Up Collision Responses]');
  clearObstacles();
  useGameStore.setState({
    gameState: GAME_STATE.PLAYING,
    activePowerUps: { coffee: 5.0, shield: false, magnet: 0, multiplier: 0 },
  });

  registerObstacle('cart-1', {
    id: 'cart-1',
    type: 'foodcart',
    laneIndex: 1,
    box: new THREE.Box3(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1.8, 0.5)),
    position: new THREE.Vector3(0, 0.9, 0),
    isHit: false,
  });

  pData = setPlayer(0, 0, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'SMASH_OBSTACLE', 'Cà phê speed rush smashes through obstacles without dying');

  // D2. Nón Lá shield absorb
  clearObstacles();
  useGameStore.setState({
    gameState: GAME_STATE.PLAYING,
    activePowerUps: { coffee: 0, shield: true, magnet: 0, multiplier: 0 },
  });

  registerObstacle('bike-1', {
    id: 'bike-1',
    type: 'motorbike',
    laneIndex: 1,
    box: new THREE.Box3(new THREE.Vector3(-0.4, 0, -0.5), new THREE.Vector3(0.4, 1.3, 0.5)),
    position: new THREE.Vector3(0, 0.65, 0),
    isHit: false,
  });

  pData = setPlayer(0, 0, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'SHIELD_ABSORB', 'Nón Lá shield absorbs collision impact and keeps run alive');
  assert(useGameStore.getState().activePowerUps.shield === false, 'Shield is consumed after impact');

  // --- TEST E: Motorbike & FoodCart Collision & Auto-Registration ---
  console.log('\n[Test E: Motorbike & FoodCart Fatal Collisions]');
  clearObstacles();
  useGameStore.setState({
    gameState: GAME_STATE.PLAYING,
    activePowerUps: { coffee: 0, shield: false, magnet: 0, multiplier: 0 },
  });

  // E1. Auto-registration via updateObstacleBox when activeObstacles was cleared
  const bikeBox = new THREE.Box3(new THREE.Vector3(-0.4, 0, -0.8), new THREE.Vector3(0.4, 1.3, 0.8));
  updateObstacleBox('auto-bike-1', bikeBox, new THREE.Vector3(0, 0.65, 0), {
    type: 'motorbike',
    lane: 1,
    size: [0.8, 1.3, 1.6],
  });

  pData = setPlayer(0, 0, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'FATAL_CRASH', 'Running into Motorbike causes FATAL_CRASH (auto-registered obstacle)');

  // E2. Lane dodging: Motorbike in Lane 2 (x=2.5), player in Lane 1 (x=0) -> Safe!
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });
  const rightBikeBox = new THREE.Box3(new THREE.Vector3(2.1, 0, -0.8), new THREE.Vector3(2.9, 1.3, 0.8));
  updateObstacleBox('right-bike-1', rightBikeBox, new THREE.Vector3(2.5, 0.65, 0), {
    type: 'motorbike',
    lane: 2,
    size: [0.8, 1.3, 1.6],
  });

  pData = setPlayer(0, 0, false); // Player in center lane
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit === null, 'Player in center lane safely dodges motorbike in right lane');

  // E3. Food Cart collision in center lane
  clearObstacles();
  useGameStore.setState({ gameState: GAME_STATE.PLAYING });
  const foodCartBox = new THREE.Box3(new THREE.Vector3(-0.5, 0, -0.75), new THREE.Vector3(0.5, 1.8, 0.75));
  updateObstacleBox('foodcart-1', foodCartBox, new THREE.Vector3(0, 0.9, 0), {
    type: 'foodcart',
    lane: 1,
    size: [1.0, 1.8, 1.5],
  });

  pData = setPlayer(0, 0, false);
  hit = checkCollisions(playerBox, pData, 0.016);
  assert(hit?.type === 'FATAL_CRASH', 'Running into Food Cart in same lane triggers FATAL_CRASH');

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTests();
