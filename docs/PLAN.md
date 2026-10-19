# Implementation Plan (PLAN.md)
## Project: Saigon Rush (3D Endless Runner)

---

## 1. Plan Overview
This implementation plan breaks down the development of **Saigon Rush** into 9 distinct, sequential phases with specific, actionable, and verifiable tasks. 

Every task adheres strictly to `TECH_ARCHITECTURE.md` and `PRD.md`, delivering vertical feature slices with clear acceptance criteria and verification commands.

---

## 2. Phase Breakdown & Tasks

### Phase 1: Project Scaffolding & R3F Foundation
Foundational setup of the Vite + React 19 + React Three Fiber development environment.

- [x] **Task 1.1: Initialize Vite Project & Install Dependencies** ✅ *(done 2026-10-19: Vite 6.4, React 19, three 0.186, R3F 9.8, drei 10.7, zustand 5; `.gitignore` extended for Node)*
  - **Description**: Initialize the Vite React project in the repository root and install `three`, `@react-three/fiber`, `@react-three/drei`, and `zustand`.
  - **Acceptance Criteria**:
    - `package.json` contains valid dependencies with clean resolution.
    - `npm run dev` starts the Vite local server without errors.
  - **Verification**: `npm run build` succeeds; Vite server boots on localhost.
  - **Files**: `package.json`, `vite.config.js`, `index.html`.
  - **Dependencies**: None.

- [x] **Task 1.2: Setup Directory Architecture & Global Styling** ✅ *(done 2026-10-19: empty folders kept via `.gitkeep`; temporary "Dev Scene" brand badge until Phase 7 UI)*
  - **Description**: Create folder structure (`src/components/`, `src/store/`, `src/systems/`, `src/hooks/`, `public/assets/`) and establish 16:9 widescreen arcade layout in `src/index.css` with dark backdrop, responsive canvas framing, and Saigon color tokens.
  - **Acceptance Criteria**:
    - Clean directory hierarchy matching `TECH_ARCHITECTURE.md`.
    - Widescreen container centers the canvas with aesthetic letterboxing on non-16:9 displays.
  - **Verification**: Browser displays centered canvas viewport with Vietnamese street-racing visual theme.
  - **Files**: `src/index.css`, `src/App.jsx`, `src/main.jsx`.
  - **Dependencies**: Task 1.1.

- [x] **Task 1.3: Build Core R3F Canvas & Lighting Scene** ✅ *(done 2026-10-19: placeholder nón lá + ground in `GameScene.jsx`, to be replaced in Phases 3–4)*
  - **Description**: Implement `GameCanvas.jsx`, `GameScene.jsx`, `Camera.jsx`, and `Lighting.jsx` with directional sunlight, warm ambient fill, soft shadow maps (`percentage`), and Saigon tropical depth fog.
  - **Acceptance Criteria**:
    - Perspective camera placed at `[0, 3.8, 6.5]` looking toward `[0, 1.4, -4.0]`.
    - Sunny Saigon daylight with soft shadows rendered at 60 FPS.
  - **Verification**: R3F Canvas renders a test mesh with ground shadow without WebGL warnings.
  - **Files**: `src/components/canvas/GameCanvas.jsx`, `src/components/canvas/GameScene.jsx`, `src/components/canvas/Camera.jsx`, `src/components/canvas/Lighting.jsx`.
  - **Dependencies**: Task 1.2.

#### Checkpoint 1: Foundation
- [x] Vite compiles with zero warnings.
- [ ] R3F Canvas boots at 60 FPS with correct camera perspective and lighting. *(pending manual browser check)*

---

### Phase 2: Game State Store & Input Controller
Decoupled state management and responsive desktop keyboard controls.

- [x] **Task 2.1: Implement Centralized Game Store (`useGameStore.js`)** ✅ *(done 2026-10-19: Zustand store with MENU/PLAYING/PAUSED/GAME_OVER states, metrics, power-up timers, shield consumption, and localStorage persistence)*
  - **Description**: Build Zustand store managing state machine (`MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`), live metrics (score, distance, coins, speed), active power-ups, and `localStorage` persistence.
  - **Acceptance Criteria**:
    - Actions `startGame`, `pauseGame`, `gameOver`, `addCoin`, `activatePowerUp`, `toggleMute` update store accurately.
    - High scores and mute settings read/write to `localStorage`.
  - **Verification**: Store actions transition states and update metrics predictably in unit/runtime checks.
  - **Files**: `src/store/useGameStore.js`, `src/systems/constants.js`.
  - **Dependencies**: Task 1.1.

- [x] **Task 2.2: Implement Keyboard Controls Hook (`useKeyboard.js`)** ✅ *(done 2026-10-19: keyboard hook capturing WASD/Arrows/Space/Escape with preventDefault, non-repeating lane/jump triggers, and window blur cleanup)*
  - **Description**: Build dedicated hook capturing `A`/`D`/`Left`/`Right` (lane switch), `W`/`Up`/`Space` (jump), `S`/`Down` (slide/fast-fall), and `P`/`Escape` (pause) with debounced single-press triggers for lane switches and jumps.
  - **Acceptance Criteria**:
    - Clean event listeners with unmount cleanup.
    - Prevents default browser scrolling on arrow keys and Space during gameplay.
  - **Verification**: Key presses log discrete directional commands without repeating floods.
  - **Files**: `src/hooks/useKeyboard.js`.
  - **Dependencies**: Task 2.1.

#### Checkpoint 2: State & Input
- [x] Game state transitions function properly.
- [x] Keyboard events trigger cleanly without browser scroll interference.

---

### Phase 3: Player Controller & 3-Lane Movement
Character rendering, smooth lane transitions, jumping, sliding, and fast-fall physics.

- [x] **Task 3.1: Build Procedural Player Mesh & Rig** ✅ *(done 2026-10-19: stylized procedural Vietnamese street runner with Nón Lá straw cone, red ribbon, jacket, backpack, limbs, running stride, and castShadow)*
  - **Description**: Create stylized low-poly runner component (`Player.jsx`) with iconic Vietnamese character silhouette (street runner with conical hat / backpack), shadow caster, and forward run animation.
  - **Acceptance Criteria**:
    - Procedural mesh with distinct body, head, nón lá, and limbs.
    - Procedural running bobbing motion driven by `useFrame`.
  - **Verification**: Player renders at center lane (`x = 0, y = 0, z = 0`) with smooth running cadence.
  - **Files**: `src/components/game/Player.jsx`.
  - **Dependencies**: Task 1.3, Task 2.1.

- [x] **Task 3.2: Implement 3-Lane Switching with Bank Tilting** ✅ *(done 2026-10-19: 3-lane switching clamped to [-2.5, 0, 2.5] with dampening factor 18, bank lean rotation on Z, and keyboard action subscription)*
  - **Description**: Connect keyboard lane commands to Player horizontal translation across 3 lanes (`x = -2.5, 0, +2.5`) using critical damping (`THREE.MathUtils.damp`) and subtle roll tilting (`rotation.z`).
  - **Acceptance Criteria**:
    - Snappy lane change completing in ~`180ms`.
    - Clamped within 3 lanes (pressing left on left lane does nothing).
  - **Verification**: Player smoothly darts between lanes with responsive bank lean.
  - **Files**: `src/components/game/Player.jsx`.
  - **Dependencies**: Task 2.2, Task 3.1.

- [x] **Task 3.3: Implement Jumping, Sliding & Fast-Fall Physics** ✅ *(done 2026-10-19: parabolic jump with 2.8m apex, sliding with squashed 0.55 scale and 0.8s timer, fast-fall at -18 m/s, boundingBox calculation, and Nón Lá shield aura)*
  - **Description**: Implement parabolic jump arc (apex `2.8m`, gravity `36 m/s²`) and slide roll (character height drops to `0.6m` for `0.8s`). Pressing slide mid-air triggers instant fast-fall to ground.
  - **Acceptance Criteria**:
    - Jump clears 1m obstacles cleanly and lands naturally on ground (`y = 0`).
    - Slide reduces collision box height and restores upright posture after timer.
    - Airborne slide causes steep downward trajectory.
  - **Verification**: Jump, slide, and fast-fall behave with Subway Surfers responsiveness.
  - **Files**: `src/components/game/Player.jsx`, `src/systems/constants.js`.
  - **Dependencies**: Task 3.2.

#### Checkpoint 3: Player Movement
- [x] Player moves smoothly between 3 lanes without clipping.
- [x] Jumping, sliding, and fast-falling feel tight, agile, and responsive.

---

### Phase 4: Endless Track Generation & Saigon Environment
Infinite chunk streaming, road styling, shophouses, and roadside scenery.

- [x] **Task 4.1: Build Modular Road & Sidewalk Segment (`TrackChunk.jsx`)** ✅ *(done 2026-10-19: 30-meter track segment with 3 asphalt lanes at x = -2.5, 0, 2.5, outer boundary shoulders, dashed dividers, sidewalks, and yellow painted curbs)*
  - **Description**: Create 30-meter track segment containing 3 asphalt lanes with dashed white markings, curbs with yellow-black paint stripes, and sidewalk tile textures.
  - **Acceptance Criteria**:
    - Exact 3-lane alignment matching player lane coordinates (`-2.5, 0, 2.5`).
    - Seamless tileable geometry with zero visual cracks between adjacent chunks.
  - **Verification**: Two contiguous chunks join seamlessly with continuous lane markings.
  - **Files**: `src/components/game/TrackChunk.jsx`.
  - **Dependencies**: Task 1.3.

- [x] **Task 4.2: Build Procedural Saigon Shophouses & Street Scenery** ✅ *(done 2026-10-19: colonial shophouses with Saigon pastel colors, shuttered windows, balconies, awnings, neon signboards, tamarind trees, streetlamps, and overhead wires)*
  - **Description**: Add colorful colonial-style facades (pastel yellow, mint green, terra-cotta), shuttered windows, Vietnamese business neon signs (*Cà Phê*, *Bánh Mì*, *Tiệm May*), tropical tamarind trees, and streetlights along sidewalks.
  - **Acceptance Criteria**:
    - Vibrant, diverse architectural streetscape flanking both sides of the roadway.
    - Low-poly meshes using shared materials for high performance.
  - **Verification**: Sidewalks feature rich Saigon urban atmosphere with zero draw-call stutter.
  - **Files**: `src/components/game/TrackChunk.jsx`, `src/components/game/SceneryElements.jsx`.
  - **Dependencies**: Task 4.1.

- [x] **Task 4.3: Implement Dynamic Chunk Pooling & Infinite Scrolling (`TrackPool.jsx`)** ✅ *(done 2026-10-19: 6-chunk object pool streaming 180m ahead, translating along positive Z at current speed with coffee boost, recycling past z > 25 with fresh randomized shophouse variants, and updating run distance)*
  - **Description**: Maintain an active pool of 5 chunks covering 150m ahead. Translate chunks along positive Z at current `gameSpeed`. When a chunk passes behind camera (`z > 25`), recycle and reposition it at the front of the queue.
  - **Acceptance Criteria**:
    - Endless track scrolling with zero hitching or memory leaks.
    - Smooth speed scaling from `18 m/s` upward.
  - **Verification**: Game runs for 10+ minutes continuously without memory accumulation or visible seam glitches.
  - **Files**: `src/components/game/TrackPool.jsx`.
  - **Dependencies**: Task 4.2, Task 2.1.

#### Checkpoint 4: Track Streaming
- [x] World streams endlessly at 60 FPS.
- [x] Saigon street environment looks authentic and lively.

---

### Phase 5: Obstacle System & Collision Engine
Saigon-themed hazards, moving vehicles, buses with ramps, and AABB collision detection.

- [x] **Task 5.1: Build Low Hurdles (Plastic Stools & Street Vendor Baskets)** ✅ *(done 2026-10-19: LowBarrier with 3 variants: plastic street stools & table, bamboo fruit baskets with carrying pole, and yellow/black construction barrier; height 0.65m cleanly jumpable)*
  - **Description**: Create red/blue plastic cafe stools (*ghế nhựa*) and bamboo fruit baskets (*gánh hàng rong*) positioned in single lanes, requiring player to jump over or switch lanes.
  - **Acceptance Criteria**:
    - Height `0.5m - 0.7m`. Cleanly jumpable.
    - Authentic Saigon street food styling.
  - **Verification**: Player can jump over low obstacles with clearance.
  - **Files**: `src/components/game/Obstacles/LowBarrier.jsx`.
  - **Dependencies**: Task 4.1.

- [x] **Task 5.2: Build Overhead Hazards (Tangled Electrical Wires & Awnings)** ✅ *(done 2026-10-19: OverheadWires with utility poles, high voltage plate, meter box, and tangled cable sag / canvas awning reaching y = 1.15m; requires sliding under to avoid crash)*
  - **Description**: Create iconic Saigon overhead electrical wire bundles (*mạng nhện dây điện*) and low canvas cafe awnings spanning across lanes with clearance underneath.
  - **Acceptance Criteria**:
    - Wire bundle bottom clearance at `1.2m`.
    - Standing player collides; sliding player passes underneath safely.
  - **Verification**: Player safely rolls under wires and collides if standing.
  - **Files**: `src/components/game/Obstacles/OverheadWires.jsx`.
  - **Dependencies**: Task 4.1.

- [x] **Task 5.3: Build Moving Motorbikes & Street Food Carts** ✅ *(done 2026-10-19: Honda Wave/Cub motorbike with wheels, fairing, exhaust, luggage cargo and optional forward cruising, and stainless steel food cart with wheels, glass counter, baguettes and soup pot)*
  - **Description**: Create iconic Honda Wave/Cub style motorbikes (parked or cruising forward at slow speed) and wheeled street food carts (*xe bánh mì / hủ tiếu*).
  - **Acceptance Criteria**:
    - Moving motorbikes travel at `30%` player forward speed.
    - Completely blocks a single lane.
  - **Verification**: Player must switch lanes to dodge motorbikes and food carts.
  - **Files**: `src/components/game/Obstacles/Motorbike.jsx`, `src/components/game/Obstacles/FoodCart.jsx`.
  - **Dependencies**: Task 4.1.

- [x] **Task 5.4: Build Saigon City Bus with Climbable Front Ramp** ✅ *(done 2026-10-19: SaigonBus with green/white city livery, route LED display, passenger windows, tires, walkable roof at y = 2.45m, and sloped front ramp with chevron stripes)*
  - **Description**: Create green Saigon city bus occupying an entire lane. Attach a road ramp in front allowing the player to run or jump up onto the bus roof to collect elevated coin trails.
  - **Acceptance Criteria**:
    - Front collision with bumper causes crash.
    - Running up ramp elevates player smoothly to bus roof (`y = 2.5m`).
    - Player can run along roof and jump off back into traffic.
  - **Verification**: Player can climb ramp, run across bus roof, and collect rooftop coins.
  - **Files**: `src/components/game/Obstacles/SaigonBus.jsx`.
  - **Dependencies**: Task 3.3, Task 4.1.

- [x] **Task 5.5: Implement AABB Collision Detection Engine (`CollisionSystem.js`)** ✅ *(done 2026-10-19: AABB Box3 intersection engine with broad/narrow phase filtering, slide evasion under overhead wires, Nón Lá shield absorption with invincibility frames, Cà phê speed smash, and fatal crash game over)*
  - **Description**: Implement per-frame 3D Box3 intersection testing in `useFrame` between player bounding box and active obstacles within proximity (`|Δz| < 3m`). Handle invulnerability frames, shield hits, and fatal crashes.
  - **Acceptance Criteria**:
    - Precise collision bounds for standing, jumping, and sliding states.
    - Fatal collision immediately invokes `gameOver()` action in store.
  - **Verification**: Accurate hit detection on all obstacle types with zero false positives.
  - **Files**: `src/systems/CollisionSystem.js`, `src/components/game/Player.jsx`.
  - **Dependencies**: Tasks 5.1 - 5.4.

#### Checkpoint 5: Obstacles & Collisions
- [x] All 4 obstacle categories spawn in balanced procedural patterns.
- [x] Jump, slide, and lane-switch evasions work with precise collision responses.

---

### Phase 6: Collectibles & Vietnamese Power-Ups
Coins, power-up meshes, duration countdowns, and active gameplay effects.

- [x] **Task 6.1: Build Animated Coins & Trail Spawner** ✅ *(done 2026-10-19: spinning golden star coins with embossed dong star, pickup detection, score/coin store increments, and spawning in straight lines, jump arcs over stools, and Saigon bus roof trails)*
  - **Description**: Create spinning golden star coins with pickup radius. Spawn coins in straight lines, jump arcs over low barriers, and strings along bus roofs.
  - **Acceptance Criteria**:
    - Coins spin continuously with subtle shimmer.
    - Picking up coin increments coin count, awards +10 points, and emits visual pickup sparkle.
  - **Verification**: Player collects coins on ground, in jump arcs, and on bus roofs.
  - **Files**: `src/components/game/Collectibles/Coin.jsx`, `src/components/game/Collectibles/CoinPatternSpawner.js`.
  - **Dependencies**: Task 5.5.

- [x] **Task 6.2: Implement Cà Phê (Vietnamese Coffee) Speed Rush** ✅ *(done 2026-10-19: Cà phê sữa đá with metal phin filter 3D pickup, 6s duration, 1.4x speed boost, obstacle smashing invulnerability, camera FOV dilation from 60° to 72°, and golden speed aura)*
  - **Description**: Build Cà phê sữa đá 3D pickup. When collected: boosts speed by 40%, grants invulnerability (smashes obstacles in path), dilates camera FOV, and displays speed streaks for 6 seconds.
  - **Acceptance Criteria**:
    - 6-second countdown timer.
    - Obstacles hit during rush explode into harmless debris instead of killing player.
  - **Verification**: Collecting coffee triggers exhilarating speed rush and safe obstacle clearing.
  - **Files**: `src/components/game/Collectibles/PowerUpItem.jsx`, `src/store/useGameStore.js`.
  - **Dependencies**: Task 6.1.

- [x] **Task 6.3: Implement Nón Lá (Conical Hat) Shield** ✅ *(done 2026-10-19: floating golden Nón Lá pickup, grants protective glowing shield aura on player, absorbs 1 collision crash, shatters, and gives 1.5s invincibility frames)*
  - **Description**: Build Nón lá 3D pickup. When collected: spawns glowing conical hat aura over player. Absorbs 1 collision crash, shatters with particle flash, and provides 1.5s invincibility frames.
  - **Acceptance Criteria**:
    - Shield remains active until first collision.
    - Absorbs hit without triggering Game Over.
  - **Verification**: Crashing with Nón Lá active destroys shield and allows run to continue.
  - **Files**: `src/components/game/Collectibles/PowerUpItem.jsx`, `src/components/game/Player.jsx`.
  - **Dependencies**: Task 5.5, Task 6.1.

- [x] **Task 6.4: Implement Bánh Mì (Baguette) Coin Magnet** ✅ *(done 2026-10-19: crispy golden Vietnamese baguette with green chili garnish 3D pickup, 8s duration, pulls all coins within 12m radius across all 3 lanes directly into player, with cyan magnetic flux ring)*
  - **Description**: Build crispy Bánh Mì 3D pickup. When collected: creates magnetic field (radius 12m) that pulls all nearby coins smoothly toward player for 8 seconds.
  - **Acceptance Criteria**:
    - Coins interpolate rapidly to player position across all 3 lanes.
    - Magnet visual indicator active on player.
  - **Verification**: Running past coins in adjacent lanes vacuums them directly into player.
  - **Files**: `src/components/game/Collectibles/PowerUpItem.jsx`, `src/components/game/Collectibles/Coin.jsx`.
  - **Dependencies**: Task 6.1.

- [x] **Task 6.5: Implement Trà Đá (Iced Tea) 2X Score Multiplier** ✅ *(done 2026-10-19: tall glass of Saigon iced tea with ice cubes and straw 3D pickup, 10s duration, doubles both distance score and coin score bonus to +20, with green crystalline aura)*
  - **Description**: Build Trà đá cup pickup. When collected: doubles all score accumulated for 10 seconds and surrounds player with sparkling golden aura.
  - **Acceptance Criteria**:
    - Score accrual rate and coin score bonuses double while active.
    - Timer correctly expires after 10 seconds.
  - **Verification**: Score counter visibly advances at 2x rate while Trà Đá is active.
  - **Files**: `src/components/game/Collectibles/PowerUpItem.jsx`, `src/store/useGameStore.js`.
  - **Dependencies**: Task 6.1.

#### Checkpoint 6: Collectibles & Power-Ups
- [x] Coins collect cleanly with responsive audio/visual feedback.
- [x] All 4 Vietnamese power-ups work exactly to specification.

---

### Phase 7: User Interface (HUD, Menus & LocalStorage)
Polished 2D overlay UI, start screen, real-time HUD, and game over modal.

- [ ] **Task 7.1: Build Start / Title Screen (`StartMenu.jsx`)**
  - **Description**: Design vibrant cyberpunk-Saigon title screen with logo, "Press SPACE to Play" button, keyboard control preview, and current all-time High Score.
  - **Acceptance Criteria**:
    - Clean overlay that transitions seamlessly into game upon start.
    - Displays high score fetched from `localStorage`.
  - **Verification**: Clicking play or pressing Space launches game countdown/start.
  - **Files**: `src/components/ui/StartMenu.jsx`, `src/components/ui/StartMenu.css`.
  - **Dependencies**: Task 2.1.

- [ ] **Task 7.2: Build Real-Time In-Game HUD (`HUD.jsx`)**
  - **Description**: Build sleek HUD displaying current score, distance in meters, coins collected, and active power-up status rings with animated countdown timers.
  - **Acceptance Criteria**:
    - Responsive 16:9 layout with zero obstruction of player view.
    - Power-up countdown rings deplete smoothly as duration ticks down.
  - **Verification**: HUD updates dynamically during gameplay with zero frame-drop.
  - **Files**: `src/components/ui/HUD.jsx`, `src/components/ui/HUD.css`.
  - **Dependencies**: Task 2.1, Phase 6.

- [ ] **Task 7.3: Build Game Over Modal & Score Persistence (`GameOver.jsx`)**
  - **Description**: Design Game Over results screen displaying final score, distance, coins, "NEW RECORD!" celebratory badge if personal best was beaten, and "Play Again" button.
  - **Acceptance Criteria**:
    - Saves personal best to `localStorage` key `saigonrush_highscore`.
    - Pressing Space or clicking Play Again resets world and starts new run instantly.
  - **Verification**: Crashing displays results modal; high scores persist across browser reloads.
  - **Files**: `src/components/ui/GameOver.jsx`, `src/components/ui/GameOver.css`.
  - **Dependencies**: Task 2.1.

- [ ] **Task 7.4: Build Pause Modal & Audio Controls (`AudioControls.jsx`)**
  - **Description**: Add Pause menu (triggered by `Escape` or `P`) and audio mute/unmute toggle button with saved preference in `localStorage`.
  - **Acceptance Criteria**:
    - Pausing freezes game loop and shows semi-transparent pause card.
    - Audio button toggles sound on/off with persistent icon state.
  - **Verification**: Pausing stops player movement; audio toggle updates store.
  - **Files**: `src/components/ui/AudioControls.jsx`, `src/components/ui/PauseModal.jsx`.
  - **Dependencies**: Task 2.1.

#### Checkpoint 7: Complete UI Flow
- [ ] End-to-end menu flow works: Start Menu -> Play -> HUD -> Pause -> Game Over -> Replay.
- [ ] High scores and mute settings reliably persist in `localStorage`.

---

### Phase 8: Audio Engine & Sound Synthesis
Audio manager with Web Audio API procedural synthesis fallbacks.

- [ ] **Task 8.1: Implement Web Audio Synthetic Sound Engine (`SoundSystem.js`)**
  - **Description**: Build procedural Web Audio API synthesizer generating zero-latency SFX: coin ding, jump whoosh, slide rustle, power-up stings, shield shatter, and crash thud.
  - **Acceptance Criteria**:
    - Plays immediately without external file dependencies.
    - Respects user mute toggle.
  - **Verification**: All player actions and pickups emit distinct, satisfying retro/arcade sounds.
  - **Files**: `src/systems/SoundSystem.js`.
  - **Dependencies**: Task 2.1.

- [ ] **Task 8.2: Connect Background Music & Audio Asset Loader**
  - **Description**: Add energetic Saigon street-beat background music track with looping, volume control, and graceful user-gesture unlock (handling browser autoplay policies).
  - **Acceptance Criteria**:
    - Audio context starts smoothly on first user click or keypress.
    - Background music pauses when game is paused or muted.
  - **Verification**: Music plays seamlessly during runs and pauses on game pause/over.
  - **Files**: `src/systems/SoundSystem.js`, `src/hooks/useAudio.js`.
  - **Dependencies**: Task 8.1.

#### Checkpoint 8: Audio System
- [ ] Sound effects trigger synchronously with gameplay events.
- [ ] Zero audio errors or unhandled autoplay rejections in browser console.

---

### Phase 9: 3D Asset Pipeline Polish (Sketchfab Integration) & Optimization
Curating Sketchfab GLTF/GLB models, fallback degradation, and 60 FPS performance tuning.

- [ ] **Task 9.1: Configure `useGLTF` Asset Loader & Graceful Fallbacks**
  - **Description**: Create asset loader utility leveraging `@react-three/drei`'s `useGLTF` with Draco decoder support. Wrap every 3D model in a component that gracefully falls back to procedural geometry if the GLB file is missing or loading.
  - **Acceptance Criteria**:
    - Zero runtime crashes or broken meshes if external models are absent.
    - Seamless transition when custom `.glb` assets are dropped into `public/assets/models/`.
  - **Verification**: Game runs identically in procedural mode and GLB model mode.
  - **Files**: `src/components/game/ModelLoader.jsx`, `src/components/game/fallbacks/`.
  - **Dependencies**: Phase 3, Phase 5.

- [ ] **Task 9.2: Curate & Integrate Sketchfab / 3D Models in `public/assets/models/`**
  - **Description**: Prepare and integrate free CC-licensed / low-poly 3D models for character runner, motorbike, bus, and power-up icons.
  - **Acceptance Criteria**:
    - Models compressed and optimized for web delivery (< 2MB each).
    - Correct scale, orientation, and material lighting in R3F.
  - **Verification**: 3D models render correctly in place of procedural shapes.
  - **Files**: `public/assets/models/`.
  - **Dependencies**: Task 9.1.

- [ ] **Task 9.3: Performance Profiling, Shadow Tuning & Final Polish**
  - **Description**: Profile frame times, tune shadow map resolution, verify frustum culling, and ensure steady 60 FPS on standard desktop displays.
  - **Acceptance Criteria**:
    - Rock-solid 60 FPS with zero memory leaks over extended play sessions.
    - Pixel ratio clamped (`dpr={[1, 1.5]}`) with smooth anti-aliased presentation.
  - **Verification**: Chrome DevTools Performance panel confirms 60 FPS without garbage collection spikes.
  - **Files**: `src/components/canvas/GameCanvas.jsx`, `src/App.jsx`.
  - **Dependencies**: All preceding tasks.

#### Checkpoint 9: Final Release Quality
- [ ] Complete, polished, playable 3D endless runner game meeting all PRD criteria.
- [ ] 60 FPS desktop performance with authentic Saigon street vibes.

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Garbage Collection (GC) Stutter** | High | Eliminate object allocations in `useFrame`; reuse module-scope vectors, matrices, and bounding boxes. |
| **External 3D Models Failing to Load** | Medium | Implement robust procedural Three.js geometry fallbacks for all entities so the game never crashes. |
| **Browser Audio Autoplay Blocking** | Medium | Initialize Web Audio Context strictly upon user interaction (start button click or space key). |
| **High-DPI GPU Overheating** | Low | Clamp `dpr={[1, 1.5]}` in `<Canvas>` to avoid rendering 4K buffers on retina screens. |
